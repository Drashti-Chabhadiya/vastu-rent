export interface ContactSupportTemplateOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function getContactSupportTemplate({
  name,
  email,
  subject,
  message,
}: ContactSupportTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Support Inquiry</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #faf7f0; color: #132019; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #edf0ed; }
        .header { color: #24553e; font-size: 24px; font-weight: bold; margin-bottom: 24px; border-bottom: 2px solid #F4F8F1; padding-bottom: 12px; }
        h1 { font-size: 20px; color: #132019; }
        p { font-size: 15px; line-height: 1.6; color: #4a5c52; }
        .inquiry-details { background-color: #F4F8F1; border-radius: 12px; padding: 20px; border-left: 4px solid #24553e; margin: 20px 0; }
        .footer { font-size: 12px; color: #8fa397; margin-top: 32px; border-top: 1px solid #edf0ed; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">VastuRent Support</div>
        <h1>New Contact Form Submission</h1>
        <p>A user has submitted an inquiry on the VastuRent Contact page:</p>
        
        <div class="inquiry-details">
          <p style="margin: 0; font-size: 14px;"><strong>From Name:</strong> ${name}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>From Email:</strong> ${email}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 12px 0 0 0; font-size: 14px; white-space: pre-wrap;"><strong>Message:</strong><br/>${message}</p>
        </div>
 
        <p>Please reply directly to the customer's email address listed above.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VastuRent. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}
