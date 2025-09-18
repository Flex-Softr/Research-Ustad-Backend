import { IContactFormData } from './contact.interface';
import { sendEmail } from '../../utils/sendEmail';
import config from '../../config';

export class ContactService {
  static async createContact(
    payload: IContactFormData,
  ): Promise<{ success: boolean; message: string }> {
    // Send notification email to website email
    await this.sendContactNotification(payload);

    return { success: true, message: 'Contact form submitted successfully' };
  }

  private static async sendContactNotification(
    contact: IContactFormData,
  ): Promise<void> {
    try {
      const researchUstadEmail = config.email_user;
      const subject = `New Submission from ${contact.name}: ${contact.subject}`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background-color: #2563eb; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>
              <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px;">ResearchUstad</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              
              <!-- Contact Details -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Contact Information</h2>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-size: 14px;">Name:</strong>
                  <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px;">${
                    contact.name
                  }</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-size: 14px;">Email:</strong>
                  <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px;">
                    <a href="mailto:${
                      contact.email
                    }" style="color: #2563eb; text-decoration: none;">${
                      contact.email
                    }</a>
                  </p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-size: 14px;">Subject:</strong>
                  <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px;">${
                    contact.subject
                  }</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-size: 14px;">Message:</strong>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; margin-top: 5px; border-left: 3px solid #2563eb;">
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                      ${contact.message.replace(/\n/g, '<br>')}
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="mailto:${contact.email}?subject=${encodeURIComponent(
                  `Reply: ${contact.subject}`,
                )}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 14px;">
                  Reply to ${contact.name}
                </a>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                                 <p style="margin: 0; color: #6b7280; font-size: 12px;">
                   Submitted on: ${new Date()?.toLocaleString('en-US', {
                     year: 'numeric',
                     month: 'short',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit',
                   })}
                 </p>
               
              </div>
              
            </div>
            
          </div>
        </body>
        </html>
      `;

      if (!researchUstadEmail) {
        throw new Error('Research Ustad email address is not defined.');
      }

      await sendEmail(researchUstadEmail, html, subject);
    } catch (error) {
      console.error('Failed to send contact notification email:', error);
    }
  }
}
