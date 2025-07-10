import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create transporter - configure with your email service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hrms.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    console.log(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
