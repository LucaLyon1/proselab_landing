const LOGO_URL = 'https://www.proselab.io/favicon/favicon-96x96.png';

export function emailLayout(body: string): string {
  return `
    <div style="background-color: #f5f0e8; padding: 40px 0;">
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8dfc8;">

        <!-- Header -->
        <div style="padding: 28px 32px; border-bottom: 1px solid #e8dfc8; text-align: center;">
          <a href="https://www.proselab.io" style="text-decoration: none;">
            <img src="${LOGO_URL}" alt="ProseLab" width="40" height="40" style="display: inline-block; vertical-align: middle; border: 0;" />
            <span style="display: inline-block; vertical-align: middle; margin-left: 10px; font-family: Georgia, serif; font-size: 20px; font-weight: bold; color: #1a1714; letter-spacing: 0.04em;">ProseLab</span>
          </a>
        </div>

        <!-- Body -->
        <div style="padding: 40px 32px; color: #1a1a1a;">
          ${body}
        </div>

        <!-- Footer -->
        <div style="padding: 28px 32px; border-top: 1px solid #e8dfc8; background: #faf7f2;">
          <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #5c5246; margin: 0 0 16px;">
            ProseLab is coming soon, and by being on this list you&rsquo;ll have access to the inside scoop. Updates, discounts and exclusive content are coming your way.
          </p>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #b5aca6; margin: 0;">
            <a href="https://www.proselab.io" style="color: #b84c2e; text-decoration: none;">proselab.io</a>
            &nbsp;&middot;&nbsp;
            <a href="https://www.proselab.io/privacy" style="color: #b5aca6; text-decoration: none;">Privacy</a>
            &nbsp;&middot;&nbsp;
            <a href="https://www.proselab.io/terms" style="color: #b5aca6; text-decoration: none;">Terms</a>
          </p>
        </div>

      </div>
    </div>
  `;
}
