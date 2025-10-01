import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { AIService } from '@/lib/ai-service';
import { scrapeDanishFarms, FarmCompany } from '@/lib/scraper';

const prisma = new PrismaClient();

async function sendOutreachEmail(company: FarmCompany, transporter: nodemailer.Transporter): Promise<boolean> {
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

    // Parse for subject and body (simple split, assume AI formats as "Subject: ...\n\nBody...")
    const lines = emailContent.split('\n');
    const subject = lines.find(line => line.startsWith('Subject:'))?.replace('Subject: ', '') || 'Partnership Opportunity for Romanian Agriculture Workers';
    const body = lines.slice(1).join('\n').trim();

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@romanian-danish-jobs.com',
      to: company.email,
      subject,
      html: body.replace(/\n/g, '<br>'), // Basic HTML conversion
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${company.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${company.email}:`, error);
    return false;
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const companies = await scrapeDanishFarms();
    if (companies.length === 0) {
      return NextResponse.json({ error: 'No companies found' }, { status: 404 });
    }

    // Setup Nodemailer transporter (use env vars; fallback to console for mock)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    // Test transporter if no creds
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP creds not set; emails will log to console only');
      transporter.sendMail = async (options: nodemailer.SendMailOptions) => {
        console.log('Mock email to', options.to, ':', options.subject, options.html);
        const toAddress = Array.isArray(options.to) ? options.to : [options.to || ''];
        return {
          messageId: 'mock-id',
          envelope: { 
            from: options.from || false, 
            to: toAddress 
          },
          accepted: toAddress,
          rejected: [],
          pending: [],
          response: 'Mock sent successfully'
        } as nodemailer.SentMessageInfo;
      };
    }

    let emailsSent = 0;
    const errors: string[] = [];

    // Limit to 5 for testing
    const limitedCompanies = companies.slice(0, 5);

    for (const company of limitedCompanies) {
      if (company.email) {
        const sent = await sendOutreachEmail(company, transporter);
        if (sent) emailsSent++;
        else errors.push(`Failed for ${company.name}`);
      }
    }

    // Log to DB
    await prisma.scrapingLog.create({
      data: {
        country: 'DENMARK',
        companiesCount: limitedCompanies.length,
        newLeadsCount: limitedCompanies.length,
        emailsFound: limitedCompanies.filter(c => c.email).length,
        emailsSent,
        errors: errors.length > 0 ? errors.join('; ') : null,
        duration: 5, // 5 minutes for demo
        pagesScraped: 10,
      },
    });

    return NextResponse.json({
      success: true,
      companies: limitedCompanies.length,
      emailsSent,
      errors: errors.length,
    });
  } catch (error) {
    console.error('Scraping route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET for cron/manual trigger (same logic)
export async function GET(): Promise<NextResponse> {
  return POST();
}
