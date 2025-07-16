import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { sendEmail, generateHiringRequestEmail } from '../services/emailService.js';

export const getHiringAnalytics = async (req: Request, res: Response) => {
  try {
    const requests = await storage.getHiringRequests();
    res.json(requests);
  } catch (error) {
    console.error('Get hiring analytics error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendHiringRequestEmail = async (req: Request, res: Response) => {
  try {
    const { 
      hiringRequestIds, 
      vendorId, 
      cityId,
      customMessage 
    } = req.body;

    if (!hiringRequestIds || !Array.isArray(hiringRequestIds) || hiringRequestIds.length === 0) {
      return res.status(400).json({ message: "Hiring request IDs are required" });
    }

    if (!vendorId || !cityId) {
      return res.status(400).json({ message: "Vendor ID and City ID are required" });
    }

    // Get vendor details with city SPOC data
    const vendors = await storage.getVendors();
    const vendor = vendors.find(v => v.id === parseInt(vendorId));
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Get city SPOC email for the specific city
    const citySpoc = vendor.citySpocData?.[cityId];
    if (!citySpoc || !citySpoc.email) {
      return res.status(400).json({ 
        message: `No recruitment SPOC email found for this vendor in the selected city` 
      });
    }

    // Get hiring request details
    const allRequests = await storage.getHiringRequests();
    const selectedRequests = allRequests.filter(req => 
      hiringRequestIds.includes(req.id)
    );

    if (selectedRequests.length === 0) {
      return res.status(404).json({ message: "No valid hiring requests found" });
    }

    // Generate email content
    let emailContent = '';
    const cityName = selectedRequests[0].cityName;
    
    if (selectedRequests.length === 1) {
      const request = selectedRequests[0];
      emailContent = generateHiringRequestEmail(
        vendor.name,
        request.cityName || 'Unknown City',
        request.roleName || 'Unknown Role',
        request.clusterName || 'Unknown Cluster',
        request.numberOfPositions,
        request.priority,
        customMessage || request.notes
      );
    } else {
      // Multiple requests - create summary email
      emailContent = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                Multiple Hiring Requests - ${cityName}
              </h2>
              
              <p>Dear ${vendor.name} Team,</p>
              
              <p>We have ${selectedRequests.length} hiring requirements for your attention:</p>
              
              ${selectedRequests.map((request, index) => `
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                  <h3 style="margin-top: 0; color: #1e40af;">Request ${index + 1}: ${request.roleName}</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; font-weight: bold; width: 40%;">Cluster:</td>
                      <td style="padding: 4px 0;">${request.clusterName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: bold;">Positions:</td>
                      <td style="padding: 4px 0;">${request.numberOfPositions}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-weight: bold;">Priority:</td>
                      <td style="padding: 4px 0; color: ${request.priority === 'high' ? '#dc2626' : request.priority === 'medium' ? '#d97706' : '#059669'};">
                        ${request.priority.toUpperCase()}
                      </td>
                    </tr>
                    ${request.notes ? `
                      <tr>
                        <td style="padding: 4px 0; font-weight: bold;">Notes:</td>
                        <td style="padding: 4px 0;">${request.notes}</td>
                      </tr>
                    ` : ''}
                  </table>
                </div>
              `).join('')}
              
              ${customMessage ? `
                <div style="background-color: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #92400e;">Additional Message:</h4>
                  <p style="margin-bottom: 0;">${customMessage}</p>
                </div>
              ` : ''}
              
              <p style="margin-top: 30px;">Please review these requirements and get back to us with your candidate submissions at the earliest.</p>
              
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

    // Send email
    const subject = selectedRequests.length === 1 
      ? `Hiring Request: ${selectedRequests[0].roleName} - ${cityName}`
      : `${selectedRequests.length} Hiring Requests - ${cityName}`;

    const emailSent = await sendEmail({
      to: citySpoc.email,
      subject,
      html: emailContent
    });

    if (emailSent) {
      res.json({ 
        message: `Email sent successfully to ${citySpoc.name} (${citySpoc.email})`,
        recipientName: citySpoc.name,
        recipientEmail: citySpoc.email,
        requestCount: selectedRequests.length
      });
    } else {
      res.status(500).json({ message: "Failed to send email" });
    }

  } catch (error) {
    console.error('Send hiring request email error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};