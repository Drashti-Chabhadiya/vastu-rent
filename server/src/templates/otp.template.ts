export interface OtpTemplateOptions {
  name: string
  otp: string
}

export function getOtpTemplate({ name, otp }: OtpTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your VastuRent Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f1;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f1;padding:40px 16px;">
    <tr>
      <td align="center">
        
        <!-- Card Container -->
        <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- Header / Brand Bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a4a31 0%,#2d7a52 100%);border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:20px;">🏠</div>
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle;">VastuRent</span>
              </div>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.05em;text-transform:uppercase;font-weight:500;">Account Verification</p>
            </td>
          </tr>

          <!-- White Card Body -->
          <tr>
            <td style="background:#ffffff;padding:48px 40px 40px;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(20,60,35,0.10);">
              
              <!-- Shield Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#e8f5ee,#d0ead9);border-radius:20px;line-height:64px;font-size:30px;">🔐</div>
              </div>

              <!-- Heading -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f2a1c;text-align:center;letter-spacing:-0.02em;">Verify Your Identity</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#5a7a68;text-align:center;line-height:1.6;">
                Hi <strong style="color:#1a4a31;">${name || 'there'}</strong> 👋<br>
                Use the one-time code below to complete your sign-up. It expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Code Text -->
              <div style="text-align:center;margin-bottom:36px;">
                <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#1a4a31;font-family:'Courier New',Courier,monospace;margin:16px 0;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;">
                  ${otp}
                </div>
                <p style="margin:0;font-size:12px;color:#92aaa0;letter-spacing:0.04em;text-transform:uppercase;font-weight:600;">One-Time Verification Code</p>
              </div>

              <!-- Warning Banner -->
              <div style="background:#fffbf0;border:1px solid #f5e3a3;border-radius:12px;padding:16px 20px;margin-bottom:32px;display:flex;align-items:flex-start;gap:12px;">
                <span style="font-size:18px;line-height:1.4;">⚠️</span>
                <p style="margin:0;font-size:13px;color:#7a6020;line-height:1.5;">
                  <strong>Never share this code with anyone.</strong> VastuRent will never ask you for your verification code via phone, chat, or email.
                </p>
              </div>

              <!-- Divider -->
              <div style="height:1px;background:#edf2ef;margin-bottom:24px;"></div>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#8fa99a;line-height:1.6;text-align:center;">
                Didn't request this? You can safely ignore this email.<br>
                Your account won't be affected.
              </p>

            </td>
          </tr>

          <!-- Bottom Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#8fa99a;">© ${new Date().getFullYear()} VastuRent. All rights reserved.</p>
              <p style="margin:0;font-size:11px;color:#a8bdb4;">Questions? <a href="mailto:support@vasturent.com" style="color:#2d7a52;text-decoration:none;font-weight:600;">support@vasturent.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `
}
