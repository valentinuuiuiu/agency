#!/bin/bash

# Deployment script for Piata-AI.ro (Romanian-Danish Jobs platform) on Hetzner Ubuntu VM
# Run as root on the VM: ssh root@142.132.234.22, then: wget -O deployment.sh https://your-host-or-scp-this-file, chmod +x deployment.sh, ./deployment.sh
# Prerequisites: Copy the entire project directory to /tmp/romanian-danish-jobs on the VM via scp or git clone
# Update DOMAIN, PROJECT_DIR, and sensitive values in .env.production before running

set -e

DOMAIN="piata-ai.ro"
PROJECT_DIR="/opt/piata-ai"
ENV_FILE="$PROJECT_DIR/.env"
BACKUP_DIR="/opt/backups"

echo "Starting deployment of Piata-AI.ro..."

# Update system and install prerequisites
apt update -y
apt upgrade -y
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw unzip

# Install Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

systemctl enable docker
systemctl start docker

# Create directories
mkdir -p $PROJECT_DIR $BACKUP_DIR
cd $PROJECT_DIR

# Assume project is copied to /tmp/romanian-danish-jobs - move it here
if [ -d "/tmp/romanian-danish-jobs" ]; then
    cp -r /tmp/romanian-danish-jobs/* .
    rm -rf /tmp/romanian-danish-jobs
else
    echo "Project files not found in /tmp/romanian-danish-jobs. Please copy them via scp or git clone first."
    exit 1
fi

# Copy .env.production to .env and update for production
cp .env.production .env

# Generate NEXTAUTH_SECRET if not set
if ! grep -q "NEXTAUTH_SECRET=" .env; then
    NEXTAUTH_SECRET=$(openssl rand -hex 32)
    echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env
fi

# Note on AWS: Since you have a 160GB Hetzner server, AWS S3 is optional for resume storage.
# The code uses S3 by default, but you can comment out AWS vars in .env and modify lib/s3.ts to use local storage (/opt/piata-ai/uploads).
# For now, keeping AWS optional - fill if needed, or implement local storage.

# Build and start services
docker-compose -f production-docker-compose.yml down || true
docker-compose -f production-docker-compose.yml pull
docker-compose -f production-docker-compose.yml up -d

# Wait for services to be healthy
sleep 30

# Run Prisma migrations
docker-compose -f production-docker-compose.yml exec -T app pnpm prisma migrate deploy
docker-compose -f production-docker-compose.yml exec -T app pnpm prisma generate

# Setup Nginx reverse proxy
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # n8n location
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

# Setup SSL with Certbot
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com || true  # Run manually first time if needed

# Firewall setup
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Create backup script
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
docker-compose -f /opt/piata-ai/production-docker-compose.yml down
tar -czf /opt/backups/backup_\$DATE.tar.gz /opt/piata-ai
docker-compose -f /opt/piata-ai/production-docker-compose.yml up -d
EOF

chmod +x /opt/backup.sh

# Setup cron for backups (daily at 2AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -

echo "Deployment complete!"
echo "App: https://$DOMAIN"
echo "n8n: https://$DOMAIN/n8n (admin / your_password)"
echo "Logs: docker-compose -f production-docker-compose.yml logs -f"
echo "Backup: /opt/backup.sh"
echo "Update .env with your actual secrets (OpenRouter key, SMTP, etc.) and restart: docker-compose -f production-docker-compose.yml restart"
