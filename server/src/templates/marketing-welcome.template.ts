export interface MarketingWelcomeTemplateOptions {
  name: string;
}

export function getMarketingWelcomeTemplate({
  name,
}: MarketingWelcomeTemplateOptions): string {
  return `
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
}
