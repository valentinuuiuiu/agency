# 🇷🇴🇩🇰 Romanian-Danish Jobs Platform

A comprehensive job platform connecting Romanian workers with Danish employers, featuring AI-powered job matching, resume scoring, and complete agency recruitment management.

## 🌟 Features

### 🚀 Core Features
- **Multi-language Support**: Romanian, Danish, English, German, French, Dutch
- **AI-Powered Job Matching**: Smart candidate-job matching using embeddings
- **Resume Scoring**: AI-powered resume evaluation with detailed feedback
- **Real-time Chat**: Integrated messaging system between candidates and employers
- **Danish Language Learning**: Built-in flashcards for Danish language preparation

### 🏢 Agency Management
- **Client Management**: Complete CRM for recruitment agencies
- **Lead Generation**: AI-powered company scraping and lead scoring
- **Placement Tracking**: Monitor candidate placements and commissions
- **Payment Management**: Track client payments and agency revenue
- **Analytics Dashboard**: Comprehensive recruitment analytics

### 👨‍💼 Admin Panel
- **User Management**: Admin controls for all platform users
- **Job Moderation**: Review and approve job postings
- **System Analytics**: Platform usage and performance metrics
- **AI Task Management**: Configure and monitor AI processes
- **Scraping Management**: Control web scraping operations

### 🔍 Smart Features
- **Web Scraping**: Automated company and job discovery
- **Lead Scoring**: AI-powered company evaluation for recruitment potential
- **Semantic Search**: Vector-based job and candidate matching
- **Automated Outreach**: N8N workflow automation for lead engagement

## 🛠 Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.1** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Framer Motion** - Smooth animations

### Backend & Database
- **Prisma 6.7.0** - Modern database toolkit
- **PostgreSQL with pgvector** - Vector database for AI features
- **NextAuth.js** - Authentication and authorization
- **Next-intl** - Internationalization framework

### AI & Automation
- **OpenAI Embeddings** - Semantic search and matching
- **Crawl4AI** - Web scraping capabilities
- **Puppeteer** - Browser automation
- **N8N** - Workflow automation platform

### DevOps & Deployment
- **Docker** - Containerization
- **AWS S3** - File storage for resumes
- **Node.js 20** - Runtime environment

## 📋 Prerequisites

- **Node.js 20+**
- **PostgreSQL 16+** (with pgvector extension)
- **Docker & Docker Compose** (recommended)
- **AWS Account** (for S3 storage)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/valentinuuiuiu/agency.git
   cd agency
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Seed the database (optional)**
   ```bash
   docker-compose exec app npx prisma db seed
   ```

5. **Access the application**
   - App: http://localhost:3000
   - N8N: http://localhost:5678

### Manual Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up PostgreSQL database**
   ```bash
   createdb romanian_danish_jobs
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/romanian_danish_jobs"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# AWS S3 (for resume storage)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket-name"
AWS_REGION="eu-central-1"

# AI Services
OPENROUTER_API_KEY="your-openrouter-key"

# Email (for notifications)
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

### Database Schema

The platform uses a comprehensive PostgreSQL schema with:

- **Users**: Candidates, recruiters, and administrators
- **Jobs**: Agricultural and forestry positions
- **Applications**: Job applications with AI scoring
- **Resumes**: PDF storage with text extraction and embeddings
- **Agency Features**: Clients, placements, payments, leads
- **AI Configuration**: Embedding models and scoring systems

## 🌍 Supported Countries

- 🇩🇰 **Denmark** - Primary market
- 🇩🇪 **Germany** - Secondary market
- 🇳🇱 **Netherlands** - Growing market
- 🇫🇷 **France** - Emerging market

## 👥 User Roles

### Candidates
- Browse and apply for jobs
- Upload and manage resumes
- Learn Danish with integrated flashcards
- Track application status

### Recruiters/Agencies
- Post job opportunities
- Manage client relationships
- Track placements and commissions
- Access recruitment analytics

### Administrators
- Platform oversight
- User management
- System configuration
- Analytics and reporting

## 🤖 AI Features

### Smart Job Matching
- Semantic search using OpenAI embeddings
- Automatic candidate-job scoring
- Personalized job recommendations

### Resume Analysis
- PDF text extraction
- AI-powered resume scoring (1-100)
- Detailed feedback with pros/cons
- Keyword optimization suggestions

### Lead Scoring
- Company website analysis
- Recruitment potential assessment
- Industry trend analysis
- Automated lead qualification

## 🌐 Internationalization

The platform supports 6 languages:
- **Romanian (ro)** - Primary language
- **Danish (da)** - Target market language
- **English (en)** - International business
- **German (de)** - Secondary market
- **French (fr)** - Emerging market
- **Dutch (nl)** - Growing market

## 🔧 Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   ├── admin/             # Admin panel
│   ├── agency/            # Agency dashboard
│   ├── api/               # API routes
│   └── components/        # React components
├── components/            # Shared components
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema and migrations
├── messages/             # Translation files
├── n8n-workflows/        # Automation workflows
└── scripts/              # Database seeds and utilities
```

### Key Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create and apply migrations
npx prisma db seed      # Seed database with sample data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
```

## 🚢 Deployment

### Production Docker Setup

1. **Build and deploy**
   ```bash
   docker-compose -f production-docker-compose.yml up -d
   ```

2. **Run migrations in production**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

### Environment Configuration

For production, ensure these environment variables are set:

```env
NODE_ENV=production
NEXT_OUTPUT_MODE=standalone
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- User registration and activity tracking
- Job posting and application metrics
- Agency performance dashboards
- AI scoring effectiveness
- Geographic recruitment trends

### N8N Workflow Automation
- Automated lead outreach
- Email campaign management
- Data synchronization
- Report generation

## 🔒 Security Features

- **Row Level Security (RLS)** in PostgreSQL
- **Secure file upload** with AWS S3
- **Input validation** and sanitization
- **Rate limiting** on API endpoints
- **CSRF protection** with NextAuth.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the admin documentation

## 🎯 Roadmap

### Phase 1 (Current) ✅
- Basic job platform functionality
- User authentication and profiles
- Resume upload and management
- Basic agency features

### Phase 2 (In Development) 🚧
- [x] **Advanced AI matching algorithms** - Neural network-based candidate-job matching with behavioral analysis, career trajectory prediction, and risk assessment
- [x] **Real-time notifications** - WebSocket-based notification system with multi-channel delivery (in-app, push, email)
- [x] **Video interview platform** - Complete video interviewing system with AI-powered analysis, recording capabilities, and mobile support
- [x] **Mobile application** - Progressive Web App (PWA) with offline capabilities, push notifications, and mobile-optimized UI
- [ ] **Interview scheduling system** - Automated interviewer availability management and calendar integration
- [ ] **Push notification support** - Cross-platform mobile push notifications (iOS/Android/Web)
- [ ] **Offline capabilities** - Full offline functionality for mobile users with background sync

### Phase 3 (Future)
- [ ] Blockchain-based credential verification
- [ ] VR job site tours
- [ ] Advanced predictive analytics
- [ ] Multi-platform integration

---

**Made with ❤️ for connecting Romanian talent with Danish opportunities**
