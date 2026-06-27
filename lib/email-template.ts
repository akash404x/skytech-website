export interface EmailTemplateData {
  subject: string;
  recipientName?: string;
  recipientEmail?: string;
  content: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  showSocial?: boolean;
  showContact?: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    size: string;
  }>;
}

export function generatePremiumEmailTemplate(data: EmailTemplateData): string {
  const {
    subject,
    recipientName = 'User',
    recipientEmail,
    content,
    heroTitle,
    heroSubtitle,
    heroImage,
    ctaButton,
    showSocial = true,
    showContact = true,
    attachments,
  } = data;

  const socialLinks = {
    instagram: 'https://instagram.com/skytech',
    linkedin: 'https://linkedin.com/company/skytech',
    youtube: 'https://youtube.com/@skytech',
    github: 'https://github.com/skytech',
    facebook: 'https://facebook.com/skytech',
    whatsapp: 'https://wa.me/1234567890',
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${subject}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* Reset */
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          background-color: #0B1220;
        }
        a {
          color: #00C8FF;
          text-decoration: none;
        }
        @media screen and (max-width: 650px) {
          .container {
            width: 100% !important;
            padding: 0 10px !important;
          }
          .hero-image {
            width: 100% !important;
            height: auto !important;
          }
          .social-icon {
            width: 32px !important;
            height: 32px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0B1220; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <!-- Background Pattern -->
      <div style="background: linear-gradient(135deg, #0B1220 0%, #111827 50%, #0B1220 100%); padding: 40px 20px;">
        
        <!-- Email Container -->
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 650px; margin: 0 auto; background-color: #111827; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 200, 255, 0.15); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #0077FF 0%, #00C8FF 100%); position: relative;">
              <!-- Background Pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.05; background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221%22/><circle cx=%2250%22 cy=%2250%22 r=%2230%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221%22/><circle cx=%2250%22 cy=%2250%22 r=%2220%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221%22/></svg>'); background-size: 60px;"></div>
              
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="position: relative; z-index: 1;">
                <tr>
                  <td style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    <span style="color: #ffffff;">Sky</span><span style="color: #0B1220; background-color: #ffffff; padding: 2px 8px; border-radius: 4px; margin-left: 4px;">Tech</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Banner -->
          ${heroTitle || heroSubtitle || heroImage ? `
          <tr>
            <td style="padding: 40px; background: linear-gradient(180deg, #111827 0%, #0B1220 100%); text-align: center;">
              ${heroTitle ? `
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                ${heroTitle}
              </h1>
              ` : ''}
              ${heroSubtitle ? `
              <p style="margin: 0 0 24px; color: #9CA3AF; font-size: 16px; line-height: 1.5;">
                ${heroSubtitle}
              </p>
              ` : ''}
              ${heroImage ? `
              <img src="${heroImage}" alt="Hero" class="hero-image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
              ` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Gradient Divider -->
          <tr>
            <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, #00C8FF 50%, transparent 100%);"></td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px; background-color: #111827;">
              <!-- Greeting -->
              <p style="margin: 0 0 24px; color: #E5E7EB; font-size: 16px; line-height: 1.6;">
                Dear ${recipientName},
              </p>
              
              <!-- Rich Content -->
              <div style="color: #D1D5DB; font-size: 15px; line-height: 1.7;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          ${ctaButton ? `
          <tr>
            <td style="padding: 0 40px 40px; background-color: #111827; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background: linear-gradient(135deg, #00C8FF 0%, #0077FF 100%); border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 200, 255, 0.3);">
                    <a href="${ctaButton.url}" style="display: inline-block; padding: 16px 32px; color: #0B1220; font-size: 16px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px;">
                      ${ctaButton.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Attachments -->
          ${attachments && attachments.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 40px; background-color: #111827;">
              <div style="background-color: #0B1220; border-radius: 8px; padding: 20px; border: 1px solid rgba(0, 200, 255, 0.1);">
                <p style="margin: 0 0 16px; color: #00C8FF; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Attachments
                </p>
                ${attachments.map(att => `
                <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(0, 200, 255, 0.05); border-radius: 6px; margin-bottom: 8px;">
                  <div style="flex: 1;">
                    <p style="margin: 0; color: #E5E7EB; font-size: 14px; font-weight: 500;">${att.name}</p>
                    <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 12px;">${att.size}</p>
                  </div>
                  <a href="${att.url}" style="color: #00C8FF; font-size: 14px; font-weight: 500; text-decoration: none;">Download</a>
                </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Social Media -->
          ${showSocial ? `
          <tr>
            <td style="padding: 30px 40px; background-color: #0B1220; text-align: center; border-top: 1px solid rgba(0, 200, 255, 0.1);">
              <p style="margin: 0 0 20px; color: #9CA3AF; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Follow Us
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.instagram}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #E1306C 0%, #833AB4 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">📷</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.linkedin}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #0077B5 0%, #00A0DC 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">💼</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.youtube}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">▶️</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.github}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #333333 0%, #24292E 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">🐙</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.facebook}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #1877F2 0%, #4267B2 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">📘</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${socialLinks.whatsapp}" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 50%; line-height: 40px; text-align: center; color: #ffffff; font-size: 18px; text-decoration: none;">💬</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Contact Section -->
          ${showContact ? `
          <tr>
            <td style="padding: 30px 40px; background-color: #111827; border-top: 1px solid rgba(0, 200, 255, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 16px; background-color: #0B1220; border-radius: 8px; border: 1px solid rgba(0, 200, 255, 0.1);">
                    <p style="margin: 0; color: #00C8FF; font-size: 14px; font-weight: 600;">📧 Email</p>
                    <p style="margin: 4px 0 0; color: #E5E7EB; font-size: 14px;">contact@theskytechnology.in</p>
                  </td>
                  <td style="width: 12px;"></td>
                  <td style="padding: 16px; background-color: #0B1220; border-radius: 8px; border: 1px solid rgba(0, 200, 255, 0.1);">
                    <p style="margin: 0; color: #00C8FF; font-size: 14px; font-weight: 600;">🌐 Website</p>
                    <p style="margin: 4px 0 0; color: #E5E7EB; font-size: 14px;">https://theskytechnology.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0B1220; text-align: center; border-top: 1px solid rgba(0, 200, 255, 0.1);">
              <p style="margin: 0 0 12px; color: #6B7280; font-size: 13px;">
                © ${new Date().getFullYear()} Sky Tech. All rights reserved.
              </p>
              <p style="margin: 0 0 12px; color: #6B7280; font-size: 13px;">
                <a href="https://theskytechnology.in/privacy" style="color: #9CA3AF; text-decoration: underline;">Privacy Policy</a> • 
                <a href="https://theskytechnology.in/terms" style="color: #9CA3AF; text-decoration: underline;">Terms of Service</a>
              </p>
              <p style="margin: 0; color: #4B5563; font-size: 12px;">
                This email was sent to ${recipientEmail || 'you'}. 
              </p>
            </td>
          </tr>

        </table>
        <!-- End Email Container -->

      </div>
    </body>
    </html>
  `;
}
