import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Gmail configuration using nodemailer
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const transporter = createGmailTransporter();
    
    const mailOptions = {
      from: params.from || process.env.GMAIL_USER,
      to: params.to,
      subject: params.subject,
      html: params.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function generateHiringRequestEmail(
  vendorName: string,
  cityName: string,
  roleName: string,
  clusterName: string,
  numberOfPositions: number,
  priority: string,
  notes?: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Hiring Request - ${cityName}
          </h2>
          
          <p>Dear ${vendorName} Team,</p>
          
          <p>We have a new hiring requirement for your attention:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Hiring Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">City:</td>
                <td style="padding: 8px 0;">${cityName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Cluster:</td>
                <td style="padding: 8px 0;">${clusterName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Role:</td>
                <td style="padding: 8px 0;">${roleName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Number of Positions:</td>
                <td style="padding: 8px 0;">${numberOfPositions}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 8px 0; color: ${priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#059669'};">
                  ${priority.toUpperCase()}
                </td>
              </tr>
            </table>
          </div>
          
          ${notes ? `
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <h4 style="margin-top: 0; color: #92400e;">Additional Notes:</h4>
              <p style="margin-bottom: 0;">${notes}</p>
            </div>
          ` : ''}
          
          <p style="margin-top: 30px;">Please review this requirement and get back to us with your candidate submissions at the earliest.</p>
          
          <p>Best regards,<br>
          <strong>HR Team</strong><br>
          Blue Collar HRMS Platform</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated email from our HRMS platform. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}