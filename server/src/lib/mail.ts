import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'
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
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpUser || !smtpPass) {
    return null
  }

  if (!_transporter) {
    // Port 465 uses SSL (secure: true). Port 587 uses STARTTLS (secure: false).
    const isSecure = smtpPort === 465
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      family: 4,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    } as SMTPTransport.Options)
    console.log(
      `📬 [Mail] SMTP transporter initialized (${smtpHost}:${smtpPort}, secure: ${isSecure})`,
    )
  }

  return _transporter
}

// ─── Core Email Sending Function ─────────────────────────────────────────────

interface SendMailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  simulatedTitle?: string
  simulatedLogLines?: string[]
}

async function sendMail(options: SendMailOptions): Promise<void> {
  const {
    to,
    subject,
    html,
    text,
    replyTo,
    simulatedTitle = 'EMAIL GENERATED',
    simulatedLogLines,
  } = options

  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const defaultFrom = smtpUser
    ? `"VastuRent" <${smtpUser}>`
    : '"VastuRent" <noreply@vasturent.com>'
  const smtpFrom = process.env.SMTP_FROM || defaultFrom

  const transporter = getTransporter()

  if (transporter && smtpUser && smtpPass) {
    try {
      console.log(`📧 [SMTP] Attempting to send email to ${to}...`)
      console.log(`   From: ${smtpFrom}`)
      console.log(`   Subject: ${subject}`)

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html,
        text,
        replyTo,
      })
      console.log(`✅ [SMTP] Email sent successfully to ${to}`)
      return
    } catch (err: any) {
      console.error('❌ [SMTP] Error sending email:', err?.message || err)
    }
  }

  // Fallback to local Email Simulator if SMTP credentials are missing or send fails
  console.log('\n' + '='.repeat(75))
  console.log(`📧 [VastuRent Email Simulator] - ${simulatedTitle}`)
  console.log('='.repeat(75))
  console.log(`✉️  To Email:   ${to}`)
  console.log(`📋  Subject:    ${subject}`)
  if (simulatedLogLines) {
    for (const line of simulatedLogLines) {
      console.log(line)
    }
  }
  console.log('-'.repeat(75))
  console.log('💡 Note: Define SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env to send real emails.')
  console.log('='.repeat(75) + '\n')
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export interface SendVerificationEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

export async function sendVerificationEmail({
  email,
  name,
  url: _url,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientVerificationUrl = `${clientUrl}/verify-email?token=${token}`
  const subject = 'Verify your email address - VastuRent'
  const htmlContent = getVerificationTemplate({ name, clientVerificationUrl })

  await sendMail({
    to: email,
    subject,
    html: htmlContent,
    text: `Confirm Your Email Address - Welcome to VastuRent!\n\nPlease visit the following link to verify your email: ${clientVerificationUrl}`,
    simulatedTitle: 'VERIFICATION LINK GENERATED',
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `🔗  Verify URL: ${clientVerificationUrl}`,
      `🎫  Token:      ${token}`,
    ],
  })
}

export const sendVerificationEmailDirect = sendVerificationEmail

export interface SendOtpEmailOptions {
  email: string
  name: string
  otp: string
}

export async function sendOtpEmail({
  email,
  name,
  otp,
}: SendOtpEmailOptions): Promise<void> {
  const subject = 'Your VastuRent Verification Code'
  const htmlContent = getOtpTemplate({ name, otp })

  await sendMail({
    to: email,
    subject,
    html: htmlContent,
    text: `Your VastuRent Verification Code is: ${otp}`,
    simulatedTitle: 'OTP GENERATED',
    simulatedLogLines: [
      `👤  To Name:    ${name}`,
      `🔑  OTP Code:   ${otp}`,
    ],
  })
}

export const sendOtpEmailDirect = sendOtpEmail

export interface SendResetPasswordEmailOptions {
  email: string
  name: string
  url: string
  token: string
}

export async function sendResetPasswordEmail({
  email,
  name,
  url: _url,
  token,
}: SendResetPasswordEmailOptions): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const clientResetPasswordUrl = `${clientUrl}/reset-password?token=${token}`
  const subject = 'Reset your password - VastuRent'
  const htmlContent = getResetPasswordTemplate({ name, clientResetPasswordUrl })

  await sendMail({
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

export const sendResetPasswordEmailDirect = sendResetPasswordEmail

export interface SendBookingAlertOptions {
  email: string
  name: string
  title: string
  message: string
  type: string
}

export async function sendBookingAlertEmail({
  email,
  name,
  title,
  message,
  type: _type,
}: SendBookingAlertOptions): Promise<void> {
  const subject = `${title} - VastuRent`
  const htmlContent = getBookingAlertTemplate({ title, name, message })

  await sendMail({
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

export const sendBookingAlertEmailDirect = sendBookingAlertEmail

export interface SendPreferenceConfirmationOptions {
  email: string
  name: string
}

export async function sendEmailNotificationsConfirmationEmail({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const subject = '🔔 Email Notifications Activated! - VastuRent'
  const htmlContent = getNotificationsConfirmationTemplate({ name })

  await sendMail({
    to: email,
    subject,
    html: htmlContent,
    text: `Email Notifications Activated!\n\nHi ${name},\n\nYour email notifications preference has been successfully turned ON. You will now receive important updates about bookings and account settings.`,
    simulatedTitle: 'EMAIL NOTIFICATIONS PREFERENCE ON',
    simulatedLogLines: [`👤  To Name:    ${name}`],
  })
}

export const sendEmailNotificationsConfirmationEmailDirect =
  sendEmailNotificationsConfirmationEmail

export async function sendMarketingWelcomeEmail({
  email,
  name,
}: SendPreferenceConfirmationOptions): Promise<void> {
  const subject = '🎉 Welcome to VastuRent Deals! Exclusive Offers Inside'
  const htmlContent = getMarketingWelcomeTemplate({ name })

  await sendMail({
    to: email,
    subject,
    html: htmlContent,
    text: `Welcome to VastuRent Exclusive Offers!\n\nHi ${name},\n\nThank you for subscribing to VastuRent Marketing Emails! Here is your exclusive 15% discount code: WELCOME15`,
    simulatedTitle: 'MARKETING PROMOTIONS SUBSCRIBED',
    simulatedLogLines: [`👤  To Name:    ${name}`],
  })
}

export const sendMarketingWelcomeEmailDirect = sendMarketingWelcomeEmail

export interface SendContactSupportOptions {
  email: string
  name: string
  subject: string
  message: string
}

export async function sendContactSupportEmail({
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

  await sendMail({
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

export const sendContactSupportEmailDirect = sendContactSupportEmail

