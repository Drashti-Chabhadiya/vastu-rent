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
import { notificationQueue } from '../queues/queues.js'
import { JOB_NAMES } from '../constants/queue-keys.js'
import { getRedisStatus } from '../config/redis.js'

// ─── Shared Transporter (Nodemailer Connection Pool) ─────────────────────────
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
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      pool: true,
      maxConnections: 3,
      connectionTimeout: 15_000,
      socketTimeout: 15_000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
    console.log(
      '📬  [Mail] SMTP transporter initialized (connection pool ready)',
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
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'

  const transporter = getTransporter()
  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to,
        replyTo,
        subject,
        html,
        text,
      })
      console.log(`📧  [SMTP] Email sent successfully to ${to}`)
      return
    } catch (err: any) {
      console.error('❌  [SMTP] Error sending email:', err?.message || err)
      throw err
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

// ─── Queue-based Non-blocking Wrappers ───────────────────────────────────────

export async function sendVerificationEmail(
  options: SendVerificationEmailOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendVerificationEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'verification',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue verification email:', err)
    await sendVerificationEmailDirect(options)
  }
}

export async function sendOtpEmail(
  options: SendOtpEmailOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendOtpEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'otp',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue OTP email:', err)
    await sendOtpEmailDirect(options)
  }
}

export async function sendResetPasswordEmail(
  options: SendResetPasswordEmailOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendResetPasswordEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'reset-password',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue reset password email:', err)
    await sendResetPasswordEmailDirect(options)
  }
}

export async function sendBookingAlertEmail(
  options: SendBookingAlertOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendBookingAlertEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'booking-alert',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue booking alert email:', err)
    await sendBookingAlertEmailDirect(options)
  }
}

export async function sendEmailNotificationsConfirmationEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendEmailNotificationsConfirmationEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'preference-confirmation',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue preference confirmation email:', err)
    await sendEmailNotificationsConfirmationEmailDirect(options)
  }
}

export async function sendMarketingWelcomeEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendMarketingWelcomeEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'welcome',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue welcome email:', err)
    await sendMarketingWelcomeEmailDirect(options)
  }
}

export async function sendContactSupportEmail(
  options: SendContactSupportOptions,
): Promise<void> {
  try {
    if (!getRedisStatus()) {
      await sendContactSupportEmailDirect(options)
      return
    }

    const addPromise = notificationQueue.add(
      JOB_NAMES.NOTIFICATION.SEND_EMAIL,
      {
        type: 'support',
        emailData: options,
      },
    )

    await Promise.race([
      addPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 3000),
      ),
    ])
  } catch (err) {
    console.error('Failed to queue support email:', err)
    await sendContactSupportEmailDirect(options)
  }
}
