export interface VerificationTemplateOptions {
  name: string;
  clientVerificationUrl: string;
}

export function getVerificationTemplate({
  name,
  clientVerificationUrl,
}: VerificationTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #faf7f0;
          color: #132019;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(20, 35, 25, 0.05);
          border: 1px solid #edf0ed;
        }
        .header {
          background-color: #24553e;
          padding: 32px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #faf7f0;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .body {
          padding: 40px 32px;
        }
        h1 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 16px;
          color: #132019;
          letter-spacing: -0.01em;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #4a5c52;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .btn-container {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background-color: #24553e;
          color: #faf7f0 !important;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 12px;
          transition: background-color 0.2s ease;
          box-shadow: 0 2px 4px rgba(36, 85, 62, 0.15);
        }
        .divider {
          height: 1px;
          background-color: #edf0ed;
          margin: 32px 0 24px 0;
        }
        .footer {
          font-size: 12px;
          color: #8fa397;
          line-height: 1.5;
        }
        .footer a {
          color: #24553e;
          text-decoration: underline;
        }
        .link-fallback {
          word-break: break-all;
          font-size: 13px;
          color: #8fa397;
          background-color: #f7faf8;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #edf0ed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="logo">VastuRent</span>
        </div>
        <div class="body">
          <h1>Confirm Your Email Address</h1>
          <p>Hi ${name || "there"},</p>
          <p>Welcome to VastuRent! We're excited to have you join our community. To complete your sign-up and secure your account, please verify your email address by clicking the button below:</p>
          
          <div class="btn-container">
            <a href="${clientVerificationUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          
          <p>This verification link will expire in 24 hours. If you did not create a VastuRent account, please ignore this email.</p>
          
          <div class="divider"></div>
          
          <p style="margin-bottom: 8px; font-size: 13px; font-weight: 600;">Button not working? Copy and paste this URL into your browser:</p>
          <div class="link-fallback">
            <a href="${clientVerificationUrl}" target="_blank" style="color: #24553e; text-decoration: none;">${clientVerificationUrl}</a>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} VastuRent. All rights reserved.</p>
            <p style="margin: 4px 0 0 0; font-size: 11px;">If you have any questions, reach out to our team at <a href="mailto:support@vasturent.com">support@vasturent.com</a>.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
