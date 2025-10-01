# N8N Recruitment Automation Workflows

This directory contains n8n workflow configurations for automated Romanian-Danish recruitment campaigns.

## Available Workflows

### 1. Simple Recruitment Workflow (`simple-recruitment-workflow.json`)
A streamlined workflow that runs daily to:
- Research Danish agricultural job sites using local AI
- Scrape farm job listings
- Analyze recruitment results
- Send automated reports

### 2. Advanced Recruitment Automation (`recruitment-automation-local.json`)
A comprehensive workflow with multiple AI agents:
- AI Research Agent: Finds job sites and strategies
- Data Extraction Agent: Parses job listings from HTML
- Recruitment Strategy Agent: Creates outreach campaigns
- Campaign Analysis Agent: Optimizes future efforts

## Setup Instructions

1. **Start n8n**: Run `docker-compose up -d` (n8n available at http://localhost:5678)
2. **Import Workflow**: In n8n UI, import one of the JSON files
3. **Configure Credentials**: Set up email credentials for sending reports
4. **Test Workflow**: Run manually first, then activate schedule

## API Endpoints

- `/api/n8n-automation`: Dedicated endpoint for AI-powered automation tasks
- `/api/scrape-danish-farms`: Triggers farm scraping with email outreach
- `/api/chat`: General AI chat endpoint

## Features

- **Local AI Integration**: Uses your free GLM-4.5-air model via OpenRouter
- **Automated Research**: AI finds relevant Danish job sites daily
- **Intelligent Scraping**: Extracts job data from various sources
- **Email Campaigns**: Automated outreach to employers
- **Performance Analytics**: Tracks campaign success and optimization

## Security Notes

- All AI processing uses your local API keys
- No external LLM costs (uses free tier)
- Ethical scraping with proper delays
- GDPR-compliant data handling

## Customization

Modify the workflow JSON files to:
- Change research keywords
- Adjust scraping targets
- Customize email templates
- Modify analysis parameters

The workflows are designed to help Romanian workers find agricultural jobs in Denmark while maintaining ethical standards and respecting local regulations.
