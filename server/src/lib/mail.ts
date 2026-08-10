import nodemailer from 'nodemailer'
import {
  getVerificationTemplate,
  getResetPasswordTemplate,
  getBookingAlertTemplate,
  getNotificationsConfirmationTemplate,
  getMarketingWelcomeTemplate,
  getContactSupportTemplate,
  getOtpTemplate,
} from '../templates/index.js'

// ─── Shared Transporter (Nodemailer Connection) ─────────────────────────────
let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) return null

  if (!_transporter) {
    const isSecure = smtpPort === 465
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      // Connection pooling can cause socket hangs on cloud platforms like Render when idle sockets are severed by firewall.
      // Pool is disabled by default unless explicitly enabled via SMTP_POOL=true.
      pool: process.env.SMTP_POOL === 'true',
      connectionTimeout: 15_000,
      socketTimeout: 15_000,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    } as any)
    console.log(
      '📬  [Mail] SMTP transporter initialized (ready)',
    )
  }

  return _transporter
}

// ─── Helper function to send email via Nodemailer SMTP or Simulator ───────────

interface SendMailHelperOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  simulatedTitle: string
  simulatedLogLines?: string[]
}

async function sendMailHelper({
  to,
  subject,
  html,
  text,
  replyTo,
  simulatedTitle,
  simulatedLogLines,
}: SendMailHelperOptions): Promise<void> {
  const smtpUser = process.env.SMTP_USER
  const defaultFrom = smtpUser
    ? `"VastuRent" <${smtpUser}>`
    : '"VastuRent" <noreply@vasturent.com>'
  const smtpFrom = process.env.SMTP_FROM || defaultFrom

  const transporter = getTransporter()
  if (transporter) {
    try {
      console.log(`📧  [SMTP] Attempting to send email to ${to}...`)
      console.log(`   From: ${smtpFrom}`)
      console.log(`   Subject: ${subject}`)
      if (replyTo) {
        console.log(`   Reply-To: ${replyTo}`)
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: smtpFrom,
        to,
        subject,
        html,
        text,
      }
      if (replyTo) {
        mailOptions.replyTo = replyTo
      }

      await transporter.sendMail(mailOptions)
      console.log(`📧  [SMTP] Email sent successfully to ${to}`)
      return
    } catch (err: any) {
      console.error('❌  [SMTP] Error sending email on Render:', err?.message || err)
      console.log('⚠️  Falling back to simulated log display...')
    }
  }

  // Fallback to Local Email Simulator when SMTP is not configured
  console.log('\n' + '='.repeat(75))
  console.log(`📧  [VastuRent Email Simulator] - ${simulatedTitle}`)
  console.log('='.repeat(75))
  console.log(`✉️  To Email:   ${to}`)
  console.log(`📋  Subject:    ${subject}`)
  if (simulatedLogLines) {
    for (const line of simulatedLogLines) {
      console.log(line)
    }
  }
  console.log('-'.repeat(75))
  console.log(
    '💡  Note: Define SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env to send real emails.',
  )
  console.log('='.repeat(75) + '\n')
}

// ─── Exported Direct Functions ────────────────────────────────────────────────

interface SendVerificationEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

export async function sendVerificationEmailDirect({
  email,
  name,
  url: _url,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientVerificationUrl = `${clientUrl}/verify-email?token=${token}`
  const subject = 'Verify your email address - VastuRent'
  const htmlContent = getVerificationTemplate({ name, clientVerificationUrl })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `Confirm Your Email Address - Welcome to VastuRent!\n\nPlease visit the following link to verify your email: ${clientVerificationUrl}`,
    simulatedTitle: 'VERIFICATION LINK GENERATED',
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `🔗  Verify URL: \x1b[36m\x1b[4m${clientVerificationUrl}\x1b[0m`,
      `🎫  Token:      ${token}`,
    ],
  })
}

interface SendOtpEmailOptions {
  email: string
  name: string
  otp: string
}

export async function sendOtpEmailDirect({
  email,
  name,
  otp,
}: SendOtpEmailOptions): Promise<void> {
  const subject = 'Your VastuRent Verification Code'
  const htmlContent = getOtpTemplate({ name, otp })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `Your VastuRent Verification Code is: ${otp}`,
    simulatedTitle: 'OTP GENERATED',
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `🔑  OTP Code:   \x1b[36m\x1b[1m${otp}\x1b[0m`,
    ],
  })
}

interface SendResetPasswordEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

export async function sendResetPasswordEmailDirect({
  email,
  name,
  url: _url,
  token,
}: SendResetPasswordEmailOptions): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientResetPasswordUrl = `${clientUrl}/reset-password?token=${token}`
  const subject = 'Reset your password - VastuRent'
  const htmlContent = getResetPasswordTemplate({ name, clientResetPasswordUrl })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `Reset Your Password - VastuRent\n\nPlease visit the following link to reset your password: ${clientResetPasswordUrl}`,
    simulatedTitle: 'PASSWORD RESET LINK GENERATED',
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `🔗  Reset URL:  ${clientResetPasswordUrl}`,
      `🎫  Token:      ${token}`,
    ],
  })
}

interface SendBookingAlertOptions {
  email: string
  name: string
  title: string
  message: string
  type: string
}

export async function sendBookingAlertEmailDirect({
  email,
  name,
  title,
  message,
  type: _type,
}: SendBookingAlertOptions): Promise<void> {
  const subject = `${title} - VastuRent`
  const htmlContent = getBookingAlertTemplate({ title, name, message })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `${title}\n\nHi ${name},\n\n${message}`,
    simulatedTitle: title.toUpperCase(),
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `💬  Message:    ${message}`,
    ],
  })
}

interface SendPreferenceConfirmationOptions {
  email: string
  name: string
}

export async function sendEmailNotificationsConfirmationEmailDirect({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const subject = '🔔 Email Notifications Activated! - VastuRent'
  const htmlContent = getNotificationsConfirmationTemplate({ name })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `Email Notifications Activated!\n\nHi ${name},\n\nYour email notifications preference has been successfully turned ON. You will now receive important updates about bookings and account settings.`,
    simulatedTitle: 'EMAIL NOTIFICATIONS PREFERENCE ON',
    simulatedLogLines: [`👤  To Name:    ${name}`],
  })
}

export async function sendMarketingWelcomeEmailDirect({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const subject = '🎉 Welcome to VastuRent Deals! Exclusive Offers Inside'
  const htmlContent = getMarketingWelcomeTemplate({ name })

  await sendMailHelper({
    to: email,
    subject,
    html: htmlContent,
    text: `Welcome to VastuRent Exclusive Offers!\n\nHi ${name},\n\nThank you for subscribing to VastuRent Marketing Emails! Here is your exclusive 15% discount code: WELCOME15`,
    simulatedTitle: 'MARKETING PROMOTIONS SUBSCRIBED',
    simulatedLogLines: [`👤  To Name:    ${name}`],
  })
}

interface SendContactSupportOptions {
  email: string
  name: string
  subject: string
  message: string
}

export async function sendContactSupportEmailDirect({
  email,
  name,
  subject,
  message,
}: SendContactSupportOptions): Promise<void> {
  const emailSubject = `📥 New Support Inquiry: ${subject} - VastuRent`
  const htmlContent = getContactSupportTemplate({
    name,
    email,
    subject,
    message,
  })

  await sendMailHelper({
    to:
      process.env.CONTACT_EMAIL ||
      process.env.SMTP_USER ||
      'support@vasturent.com',
    replyTo: email,
    subject: emailSubject,
    html: htmlContent,
    text: `New Support Inquiry!\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    simulatedTitle: 'SUPPORT INQUIRY RECEIVED',
    simulatedLogLines: [
      `👤  From Name:  ${name}`,
      `✉️  From Email: ${email}`,
      `💬  Message:    ${message}`,
    ],
  })
}

// ─── Direct Exported Wrappers ────────────────────────────────────────────────

export async function sendVerificationEmail(
  options: SendVerificationEmailOptions,
): Promise<void> {
  await sendVerificationEmailDirect(options)
}

export async function sendOtpEmail(
  options: SendOtpEmailOptions,
): Promise<void> {
  await sendOtpEmailDirect(options)
}

export async function sendResetPasswordEmail(
  options: SendResetPasswordEmailOptions,
): Promise<void> {
  await sendResetPasswordEmailDirect(options)
}

export async function sendBookingAlertEmail(
  options: SendBookingAlertOptions,
): Promise<void> {
  await sendBookingAlertEmailDirect(options)
}

export async function sendEmailNotificationsConfirmationEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  await sendEmailNotificationsConfirmationEmailDirect(options)
}

export async function sendMarketingWelcomeEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  await sendMarketingWelcomeEmailDirect(options)
}

export async function sendContactSupportEmail(
  options: SendContactSupportOptions,
): Promise<void> {
  await sendContactSupportEmailDirect(options)
}
