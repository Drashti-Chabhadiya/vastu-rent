export interface BookingAlertTemplateOptions {
  title: string
  name: string
  message: string
}

export function getBookingAlertTemplate({
  title,
  name,
  message,
}: BookingAlertTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #faf7f0; color: #132019; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #edf0ed; }
        .header { color: #24553e; font-size: 24px; font-weight: bold; margin-bottom: 24px; border-bottom: 2px solid #F4F8F1; padding-bottom: 12px; }
        h1 { font-size: 20px; color: #132019; }
        p { font-size: 15px; line-height: 1.6; color: #4a5c52; }
        .footer { font-size: 12px; color: #8fa397; margin-top: 32px; border-top: 1px solid #edf0ed; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">VastuRent Alert</div>
        <h1>${title}</h1>
        <p>Hi ${name || 'User'},</p>
        <p>${message}</p>
        <p>You received this email because you have Email Notifications enabled in your VastuRent settings.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VastuRent. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `
}
