export interface NotificationsConfirmationTemplateOptions {
  name: string
}

export function getNotificationsConfirmationTemplate({
  name,
}: NotificationsConfirmationTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Notifications Active</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #faf7f0; color: #132019; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #edf0ed; box-shadow: 0 4px 20px rgba(20,35,25,0.05); }
        .header { color: #24553e; font-size: 24px; font-weight: bold; margin-bottom: 24px; border-bottom: 2px solid #F4F8F1; padding-bottom: 12px; }
        h1 { font-size: 20px; color: #132019; }
        p { font-size: 15px; line-height: 1.6; color: #4a5c52; }
        .feature-box { background-color: #F4F8F1; border-radius: 12px; padding: 20px; border-left: 4px solid #24553e; margin: 20px 0; }
        .feature-title { font-weight: 700; color: #24553e; font-size: 14px; margin-bottom: 8px; }
        .footer { font-size: 12px; color: #8fa397; margin-top: 32px; border-top: 1px solid #edf0ed; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">VastuRent Preferences</div>
        <h1>Notification Preferences Updated</h1>
        <p>Hi ${name || 'User'},</p>
        <p>This is a confirmation that your <strong>Email Notifications</strong> preference has been successfully turned <strong>ON</strong>.</p>
        
        <div class="feature-box">
          <div class="feature-title">What you'll receive:</div>
          <p style="margin: 0; font-size: 14px;">📦 Real-time alerts on your rental bookings (requests, confirmations, completions, and cancellations).</p>
          <p style="margin: 6px 0 0 0; font-size: 14px;">💬 Important system updates regarding your account security and profile changes.</p>
        </div>
 
        <p>You can adjust these settings at any time in your profile dashboard.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VastuRent. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `
}
