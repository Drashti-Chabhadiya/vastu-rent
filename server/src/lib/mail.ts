import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  email: string;
  name: string;
  url: string;
  token: string;
}

/**
 * Sends a premium verification email.
 * If SMTP credentials are not configured in .env, falls back to logging a styled
 * terminal box containing the link to make local development and review a breeze.
 */
export async function sendVerificationEmail({
  email,
  name,
  url,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>';

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  // Propose a cleaner client-side URL for email verification
  const clientVerificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass;

  const subject = "Verify your email address - VastuRent";

  const htmlContent = `
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

  if (!hasSmtpConfig) {
    // Elegant and high-visibility debug output in console
    console.log("\n" + "=".repeat(75));
    console.log("📧  [VastuRent Email Simulator] - VERIFICATION LINK GENERATED");
    console.log("=".repeat(75));
    console.log(`👤  To Name:    ${name}`);
    console.log(`✉️  To Email:   ${email}`);
    console.log(`📋  Subject:    ${subject}`);
    console.log(`🔗  Verify URL: \x1b[36m\x1b[4m${clientVerificationUrl}\x1b[0m`);
    console.log(`🎫  Token:      ${token}`);
    console.log("-".repeat(75));
    console.log("💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS");
    console.log("    in your server/.env file. Proceeding with simulated success.");
    console.log("=".repeat(75) + "\n");
    return;
  }

  // Real email sending
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Confirm Your Email Address - Welcome to VastuRent!\n\nPlease visit the following link to verify your email: ${clientVerificationUrl}`,
    });

    console.log(`📧  Email verification sent successfully to ${email}`);
  } catch (error) {
    console.error("❌  Error sending email verification email:", error);
    // Throw error so Better Auth knows verification mail failed to send
    throw error;
  }
}

interface SendBookingAlertOptions {
  email: string;
  name: string;
  title: string;
  message: string;
  type: string; // 'booking_request' | 'booking_status' | 'booking_completed'
}

export async function sendBookingAlertEmail({
  email,
  name,
  title,
  message,
  type,
}: SendBookingAlertOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>';

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass;
  const subject = `${title} - VastuRent`;

  const htmlContent = `
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
        <p>Hi ${name || "User"},</p>
        <p>${message}</p>
        <p>You received this email because you have Email Notifications enabled in your VastuRent settings.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VastuRent. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!hasSmtpConfig) {
    console.log("\n" + "=".repeat(75));
    console.log(`📧  [VastuRent Email Simulator] - ${title.toUpperCase()}`);
    console.log("=".repeat(75));
    console.log(`👤  To Name:    ${name}`);
    console.log(`✉️  To Email:   ${email}`);
    console.log(`📋  Subject:    ${subject}`);
    console.log(`💬  Message:    ${message}`);
    console.log("-".repeat(75));
    console.log("💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS");
    console.log("    in your server/.env file. Proceeding with simulated success.");
    console.log("=".repeat(75) + "\n");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `${title}\n\nHi ${name},\n\n${message}`,
    });
    console.log(`📧  Alert email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌  Error sending alert email:", error);
  }
}

interface SendPreferenceConfirmationOptions {
  email: string;
  name: string;
}

export async function sendEmailNotificationsConfirmationEmail({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>';

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass;
  const subject = "🔔 Email Notifications Activated! - VastuRent";

  const htmlContent = `
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
        <p>Hi ${name || "User"},</p>
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
  `;

  if (!hasSmtpConfig) {
    console.log("\n" + "=".repeat(75));
    console.log("📧  [VastuRent Email Simulator] - EMAIL NOTIFICATIONS PREFERENCE ON");
    console.log("=".repeat(75));
    console.log(`👤  To Name:    ${name}`);
    console.log(`✉️  To Email:   ${email}`);
    console.log(`📋  Subject:    ${subject}`);
    console.log("💬  Status:     Preference confirmed active!");
    console.log("-".repeat(75));
    console.log("💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS");
    console.log("    in your server/.env file. Proceeding with simulated success.");
    console.log("=".repeat(75) + "\n");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Email Notifications Activated!\n\nHi ${name},\n\nYour email notifications preference has been successfully turned ON. You will now receive important updates about bookings and account settings.`,
    });
    console.log(`📧  Notification activation email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌  Error sending preference confirmation email:", error);
  }
}

export async function sendMarketingWelcomeEmail({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>';

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass;
  const subject = "🎉 Welcome to VastuRent Deals! Exclusive Offers Inside";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VastuRent Deals</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #faf7f0; color: #132019; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #edf0ed; box-shadow: 0 4px 20px rgba(20,35,25,0.05); }
        .header { color: #24553e; font-size: 24px; font-weight: bold; margin-bottom: 24px; border-bottom: 2px solid #F4F8F1; padding-bottom: 12px; }
        h1 { font-size: 20px; color: #132019; }
        p { font-size: 15px; line-height: 1.6; color: #4a5c52; }
        .promo-card { background: linear-gradient(135deg, #24553e 0%, #357250 100%); border-radius: 16px; padding: 24px; color: #faf7f0; text-align: center; margin: 24px 0; box-shadow: 0 4px 15px rgba(36,85,62,0.15); }
        .promo-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .promo-code { font-size: 28px; font-weight: 800; background: rgba(255,255,255,0.15); display: inline-block; padding: 8px 24px; border-radius: 12px; letter-spacing: 2px; margin: 12px 0; border: 1px dashed rgba(255,255,255,0.3); }
        .footer { font-size: 12px; color: #8fa397; margin-top: 32px; border-top: 1px solid #edf0ed; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">VastuRent Offers</div>
        <h1>Welcome to VastuRent Premium Circle!</h1>
        <p>Hi ${name || "User"},</p>
        <p>Thank you for opting in to receive **Marketing Emails & Promotions**. We are thrilled to have you in our insider club!</p>
        <p>Get ready for hand-picked discounts, premium community updates, and flash deals on your favorite items.</p>
        
        <div class="promo-card">
          <div class="promo-title">Here is your welcome gift! 🎁</div>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Save 15% on your next booking with this exclusive code:</p>
          <div class="promo-code">WELCOME15</div>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.8;">Valid for the next 30 days. One-time use.</p>
        </div>

        <p>We promise to only send things you love. You can unsubscribe or change your preferences anytime in your settings.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VastuRent. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!hasSmtpConfig) {
    console.log("\n" + "=".repeat(75));
    console.log("📧  [VastuRent Email Simulator] - MARKETING PROMOTIONS SUBSCRIBED");
    console.log("=".repeat(75));
    console.log(`👤  To Name:    ${name}`);
    console.log(`✉️  To Email:   ${email}`);
    console.log(`📋  Subject:    ${subject}`);
    console.log("💬  Gift Code:  WELCOME15 (15% Off Welcome Promotion)");
    console.log("-".repeat(75));
    console.log("💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS");
    console.log("    in your server/.env file. Proceeding with simulated success.");
    console.log("=".repeat(75) + "\n");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Welcome to VastuRent Exclusive Offers!\n\nHi ${name},\n\nThank you for subscribing to VastuRent Marketing Emails! Here is your exclusive 15% discount code: WELCOME15`,
    });
    console.log(`📧  Marketing welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌  Error sending marketing welcome email:", error);
  }
}
