import cron from 'node-cron';
import { scrapeDanishFarms } from '@/lib/scraper';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { AIService } from '@/lib/ai-service';

const prisma = new PrismaClient();

// Reuse the sendOutreachEmail function from the route (copy for simplicity)
async function sendOutreachEmail(company: any, transporter: nodemailer.Transporter): Promise<boolean> {
  if (!company.email) return false;

  const prompt = `Generate a professional outreach email proposing a partnership for recruiting Romanian workers in agriculture/forestry. 
  Company: ${company.name}
  From: Romanian-Danish Jobs Platform (platforma for skilled Romanian workers seeking jobs in Denmark)
  Focus: Agriculture/farm work opportunities, reliable candidates, streamlined hiring.
  Language: English (professional tone).
  Structure: Subject, Greeting, Introduction, Value proposition, Call to action, Closing.
  Keep concise (150-200 words).`;

  try {
    const aiService = AIService.getInstance();
    const response = await aiService.generateResponse(prompt);
    const emailContent = response.content;

    const lines = emailContent.split('\n');
    const subject = lines.find((line: string) => line.startsWith('Subject:'))?.replace('Subject: ', '') || 'Partnership Opportunity for Romanian Agriculture Workers';
    const body = lines.slice(1).join('\n').trim();

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@romanian-danish-jobs.com',
      to: company.email,
      subject,
      html: body.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Cron email sent to ${company.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Cron failed to send email to ${company.email}:`, error);
    return false;
  }
}

// Main scraping and sending function
async function runScraping() {
  console.log('Running weekly scraping job...');
  try {
    const companies = await scrapeDanishFarms();
    if (companies.length === 0) {
      console.log('No companies found in cron job');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP creds not set; cron emails will log to console only');
      transporter.sendMail = async (options: nodemailer.SendMailOptions) => {
        console.log('Cron mock email to', options.to, ':', options.subject, options.html);
        const toAddress = Array.isArray(options.to) ? options.to : [options.to || ''];
        return {
          messageId: 'cron-mock-id',
          envelope: { 
            from: options.from || false, 
            to: toAddress 
          },
          accepted: toAddress,
          rejected: [],
          pending: [],
          response: 'Cron mock sent successfully'
        } as nodemailer.SentMessageInfo;
      };
    }

    let emailsSent = 0;
    const errors: string[] = [];

    const limitedCompanies = companies.slice(0, 5); // Limit for cron too

    for (const company of limitedCompanies) {
      if (company.email) {
        const sent = await sendOutreachEmail(company, transporter);
        if (sent) emailsSent++;
        else errors.push(`Cron failed for ${company.name}`);
      }
    }

    await prisma.scrapingLog.create({
      data: {
        country: 'DENMARK',
        companiesCount: limitedCompanies.length,
        newLeadsCount: limitedCompanies.length,
        emailsFound: limitedCompanies.filter(c => c.email).length,
        emailsSent,
        errors: errors.length > 0 ? errors.join('; ') : null,
        duration: 10, // 10 minutes estimated
        pagesScraped: 15,
      },
    });

    console.log(`Cron job completed: ${limitedCompanies.length} companies, ${emailsSent} emails sent`);
  } catch (error) {
    console.error('Cron job error:', error);
    await prisma.scrapingLog.create({
      data: {
        country: 'DENMARK',
        companiesCount: 0,
        newLeadsCount: 0,
        emailsFound: 0,
        emailsSent: 0,
        errors: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        pagesScraped: 0,
      },
    });
  }
}

// Schedule weekly run: Sundays at 2 AM (UTC)
cron.schedule('0 2 * * 0', runScraping, {
  timezone: 'Europe/Copenhagen', // Danish timezone
});

// Keep the script running
console.log('Scraping cron job started. Waiting for next run (Sundays 2 AM CET)...');
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  // For manual testing: node scripts/scrape-cron.js --run-now
  const args = process.argv.slice(2);
  if (args.includes('--run-now')) {
    runScraping();
  } else {
    // Run once on start for testing, then schedule
    runScraping().then(() => console.log('Initial run completed. Cron active.'));
  }
}
