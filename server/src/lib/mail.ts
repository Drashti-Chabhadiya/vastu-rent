import nodemailer from 'nodemailer'
import {
  getVerificationTemplate,
  getResetPasswordTemplate,
  getBookingAlertTemplate,
  getNotificationsConfirmationTemplate,
  getMarketingWelcomeTemplate,
  getContactSupportTemplate,
} from '../templates/index.js'
import { notificationQueue } from '../queues/queues.js'
import { JOB_NAMES } from '../constants/queue-keys.js'

// ─── Shared Transporter (Connection Pool) ────────────────────────────────────
// Created once at module load. Reuses TCP/TLS connections across all email
// sends, avoiding the 1-2 second handshake overhead per email.
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
      pool: true,         // keep TCP connections alive
      maxConnections: 3,  // up to 3 concurrent SMTP connections
      connectionTimeout: 15_000,  // fail fast if SMTP port is blocked (e.g. Render)
      socketTimeout: 15_000,      // fail fast if socket stalls mid-send
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
    console.log('📬  [Mail] SMTP transporter initialized (connection pool ready)')
  }

  return _transporter
}


interface SendVerificationEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

/**
 * Sends a premium verification email.
 * If SMTP credentials are not configured in .env, falls back to logging a styled
 * terminal box containing the link to make local development and review a breeze.
 */
export async function sendVerificationEmailDirect({
  email,
  name,
  url: _url,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientVerificationUrl = `${clientUrl}/verify-email?token=${token}`
  const subject = 'Verify your email address - VastuRent'
  const htmlContent = getVerificationTemplate({ name, clientVerificationUrl })

  const transporter = getTransporter()

  if (!transporter) {
    // No SMTP config — log to console for local dev
    console.log('\n' + '='.repeat(75))
    console.log('📧  [VastuRent Email Simulator] - VERIFICATION LINK GENERATED')
    console.log('='.repeat(75))
    console.log(`👤  To Name:    ${name}`)
    console.log(`✉️  To Email:   ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log(`🔗  Verify URL: \x1b[36m\x1b[4m${clientVerificationUrl}\x1b[0m`)
    console.log(`🎫  Token:      ${token}`)
    console.log('-'.repeat(75))
    console.log('💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS')
    console.log('    in your server/.env file. Proceeding with simulated success.')
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Confirm Your Email Address - Welcome to VastuRent!\n\nPlease visit the following link to verify your email: ${clientVerificationUrl}`,
    })
    console.log(`📧  Email verification sent successfully to ${email}`)
  } catch (error) {
    console.error('❌  Error sending email verification email:', error)
    throw error
  }
}

interface SendResetPasswordEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

/**
 * Sends a premium password reset email.
 * If SMTP credentials are not configured in .env, falls back to logging a styled
 * terminal box containing the link to make local development and review a breeze.
 */
export async function sendResetPasswordEmailDirect({
  email,
  name,
  url: _url,
  token,
}: SendResetPasswordEmailOptions): Promise<void> {
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientResetPasswordUrl = `${clientUrl}/reset-password?token=${token}`
  const subject = 'Reset your password - VastuRent'
  const htmlContent = getResetPasswordTemplate({ name, clientResetPasswordUrl })

  const transporter = getTransporter()

  if (!transporter) {
    console.log('\n' + '='.repeat(75))
    console.log('📧  [VastuRent Email Simulator] - PASSWORD RESET LINK GENERATED')
    console.log('='.repeat(75))
    console.log(`👤  To Name:    ${name}`)
    console.log(`✉️  To Email:   ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log(`🔗  Reset URL:  ${clientResetPasswordUrl}`)
    console.log(`🎫  Token:      ${token}`)
    console.log('-'.repeat(75))
    console.log('💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS')
    console.log('    in your server/.env file. Proceeding with simulated success.')
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Reset Your Password - VastuRent\n\nPlease visit the following link to reset your password: ${clientResetPasswordUrl}`,
    })
    console.log(`📧  Password reset email sent successfully to ${email}`)
  } catch (error) {
    console.error('❌  Error sending password reset email:', error)
    throw error
  }
}

interface SendBookingAlertOptions {
  email: string
  name: string
  title: string
  message: string
  type: string // 'booking_request' | 'booking_status' | 'booking_completed'
}

export async function sendBookingAlertEmailDirect({
  email,
  name,
  title,
  message,
  type: _type,
}: SendBookingAlertOptions): Promise<void> {
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'
  const subject = `${title} - VastuRent`
  const htmlContent = getBookingAlertTemplate({ title, name, message })

  const transporter = getTransporter()

  if (!transporter) {
    console.log('\n' + '='.repeat(75))
    console.log(`📧  [VastuRent Email Simulator] - ${title.toUpperCase()}`)
    console.log('='.repeat(75))
    console.log(`👤  To Name:    ${name}`)
    console.log(`✉️  To Email:   ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log(`💬  Message:    ${message}`)
    console.log('-'.repeat(75))
    console.log('💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS')
    console.log('    in your server/.env file. Proceeding with simulated success.')
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `${title}\n\nHi ${name},\n\n${message}`,
    })
    console.log(`📧  Alert email sent successfully to ${email}`)
  } catch (error) {
    console.error('❌  Error sending alert email:', error)
  }
}

interface SendPreferenceConfirmationOptions {
  email: string
  name: string
}

export async function sendEmailNotificationsConfirmationEmailDirect({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass
  const subject = '🔔 Email Notifications Activated! - VastuRent'

  // Load cleanly from template file
  const htmlContent = getNotificationsConfirmationTemplate({
    name,
  })

  if (!hasSmtpConfig) {
    console.log('\n' + '='.repeat(75))
    console.log(
      '📧  [VastuRent Email Simulator] - EMAIL NOTIFICATIONS PREFERENCE ON',
    )
    console.log('='.repeat(75))
    console.log(`👤  To Name:    ${name}`)
    console.log(`✉️  To Email:   ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log('💬  Status:     Preference confirmed active!')
    console.log('-'.repeat(75))
    console.log(
      '💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS',
    )
    console.log(
      '    in your server/.env file. Proceeding with simulated success.',
    )
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Email Notifications Activated!\n\nHi ${name},\n\nYour email notifications preference has been successfully turned ON. You will now receive important updates about bookings and account settings.`,
    })
    console.log(
      `📧  Notification activation email sent successfully to ${email}`,
    )
  } catch (error) {
    console.error('❌  Error sending preference confirmation email:', error)
  }
}

export async function sendMarketingWelcomeEmailDirect({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass
  const subject = '🎉 Welcome to VastuRent Deals! Exclusive Offers Inside'

  // Load cleanly from template file
  const htmlContent = getMarketingWelcomeTemplate({
    name,
  })

  if (!hasSmtpConfig) {
    console.log('\n' + '='.repeat(75))
    console.log(
      '📧  [VastuRent Email Simulator] - MARKETING PROMOTIONS SUBSCRIBED',
    )
    console.log('='.repeat(75))
    console.log(`👤  To Name:    ${name}`)
    console.log(`✉️  To Email:   ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log('💬  Gift Code:  WELCOME15 (15% Off Welcome Promotion)')
    console.log('-'.repeat(75))
    console.log(
      '💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS',
    )
    console.log(
      '    in your server/.env file. Proceeding with simulated success.',
    )
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject,
      html: htmlContent,
      text: `Welcome to VastuRent Exclusive Offers!\n\nHi ${name},\n\nThank you for subscribing to VastuRent Marketing Emails! Here is your exclusive 15% discount code: WELCOME15`,
    })
    console.log(`📧  Marketing welcome email sent successfully to ${email}`)
  } catch (error) {
    console.error('❌  Error sending marketing welcome email:', error)
  }
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
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom =
    process.env.SMTP_FROM || '"VastuRent" <noreply@vasturent.com>'

  const hasSmtpConfig = smtpHost && smtpUser && smtpPass
  const emailSubject = `📥 New Support Inquiry: ${subject} - VastuRent`

  // Load cleanly from template file
  const htmlContent = getContactSupportTemplate({
    name,
    email,
    subject,
    message,
  })

  if (!hasSmtpConfig) {
    console.log('\n' + '='.repeat(75))
    console.log(`📧  [VastuRent Email Simulator] - SUPPORT INQUIRY RECEIVED`)
    console.log('='.repeat(75))
    console.log(`👤  From Name:  ${name}`)
    console.log(`✉️  From Email: ${email}`)
    console.log(`📋  Subject:    ${subject}`)
    console.log(`💬  Message:    ${message}`)
    console.log('-'.repeat(75))
    console.log(
      '💡  Note: To send real emails, define SMTP_HOST, SMTP_USER, and SMTP_PASS',
    )
    console.log(
      '    in your server/.env file. Proceeding with simulated success.',
    )
    console.log('='.repeat(75) + '\n')
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: smtpFrom,
      to:
        process.env.CONTACT_EMAIL ||
        process.env.SMTP_USER ||
        'support@vasturent.com',
      replyTo: email,
      subject: emailSubject,
      html: htmlContent,
      text: `New Support Inquiry!\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    })
    console.log(`📧  Support inquiry alert sent successfully.`)
  } catch (error) {
    console.error('❌  Error sending support inquiry email:', error)
  }
}

// ─── Queue-based Non-blocking Wrappers ───────────────────────────────────────

export async function sendVerificationEmail(
  options: SendVerificationEmailOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'verification',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue verification email:', err)
    await sendVerificationEmailDirect(options)
  }
}

export async function sendResetPasswordEmail(
  options: SendResetPasswordEmailOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'reset-password',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue reset password email:', err)
    await sendResetPasswordEmailDirect(options)
  }
}

export async function sendBookingAlertEmail(
  options: SendBookingAlertOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'booking-alert',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue booking alert email:', err)
    await sendBookingAlertEmailDirect(options)
  }
}

export async function sendEmailNotificationsConfirmationEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'preference-confirmation',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue preference confirmation email:', err)
    await sendEmailNotificationsConfirmationEmailDirect(options)
  }
}

export async function sendMarketingWelcomeEmail(
  options: SendPreferenceConfirmationOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'welcome',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue welcome email:', err)
    await sendMarketingWelcomeEmailDirect(options)
  }
}

export async function sendContactSupportEmail(
  options: SendContactSupportOptions,
): Promise<void> {
  try {
    await notificationQueue.add(JOB_NAMES.NOTIFICATION.SEND_EMAIL, {
      type: 'support',
      emailData: options,
    })
  } catch (err) {
    console.error('Failed to queue support email:', err)
    await sendContactSupportEmailDirect(options)
  }
}
