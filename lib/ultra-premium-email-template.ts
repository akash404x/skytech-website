export interface UltraPremiumEmailData {
  subject: string;
  recipientName?: string;
  recipientEmail?: string;
  content: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
  offerSection?: {
    title: string;
    discount: string;
    description: string;
    couponCode?: string;
    buttonText: string;
    buttonUrl: string;
  };
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  products?: Array<{
    image: string;
    title: string;
    price: string;
    discount?: string;
    buttonUrl: string;
  }>;
  testimonial?: {
    name: string;
    rating: number;
    text: string;
  };
  attachments?: Array<{
    name: string;
    url: string;
    size: string;
  }>;
}

export function generateUltraPremiumEmailTemplate(data: UltraPremiumEmailData): string {
  const {
    subject,
    recipientName = 'User',
    recipientEmail,
    content,
    heroTitle,
    heroSubtitle,
    heroDescription,
    heroImage,
    ctaButton,
    secondaryCta,
    offerSection,
    features,
    products,
    testimonial,
    attachments,
  } = data;

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
          background-color: #090E18;
        }
        a {
          color: #00C8FF;
          text-decoration: none;
        }
        @media screen and (max-width: 650px) {
          .container {
            width: 100% !important;
            padding: 0 16px !important;
          }
          .hero-image {
            width: 100% !important;
            height: auto !important;
          }
          .feature-grid {
            display: block !important;
          }
          .feature-card {
            width: 100% !important;
            margin-bottom: 16px !important;
          }
          .product-grid {
            display: block !important;
          }
          .product-card {
            width: 100% !important;
            margin-bottom: 16px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #090E18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      
      <!-- Background with noise texture effect -->
      <div style="background: linear-gradient(180deg, #090E18 0%, #111827 50%, #090E18 100%); padding: 40px 20px; position: relative;">
        
        <!-- Subtle watermark pattern -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.03; background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22none%22 stroke=%22%2300C8FF%22 stroke-width=%220.5%22/><circle cx=%2250%22 cy=%2250%22 r=%2230%22 fill=%22none%22 stroke=%22%2300C8FF%22 stroke-width=%220.5%22/><circle cx=%2250%22 cy=%2250%22 r=%2220%22 fill=%22none%22 stroke=%22%2300C8FF%22 stroke-width=%220.5%22/></svg>'); background-size: 80px; pointer-events: none;"></div>
        
        <!-- Email Container -->
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 650px; margin: 0 auto; position: relative; z-index: 1;">
          
          <!-- Header with Glassmorphism -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(9, 14, 24, 0.9) 100%); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.1); backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
              <!-- Logo with glow effect -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="text-align: center; padding: 16px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #00C8FF 0%, #0077FF 100%); padding: 20px 32px; border-radius: 12px; box-shadow: 0 0 40px rgba(0, 200, 255, 0.3), 0 0 80px rgba(0, 200, 255, 0.1);">
                      <span style="color: #090E18; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                        Sky<span style="color: #ffffff;">Tech</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          ${heroTitle || heroSubtitle || heroDescription || heroImage ? `
          <tr>
            <td style="padding: 32px; background: linear-gradient(180deg, rgba(17, 24, 39, 0.6) 0%, rgba(9, 14, 24, 0.8) 100%); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.08); margin-top: 16px; position: relative; overflow: hidden;">
              <!-- Glowing line effect -->
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #00C8FF 50%, transparent 100%);"></div>
              
              <!-- Circuit pattern decoration -->
              <div style="position: absolute; top: 20px; right: 20px; opacity: 0.05;">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect x="10" y="10" width="40" height="40" stroke="#00C8FF" stroke-width="1"/>
                  <circle cx="30" cy="30" r="10" stroke="#00C8FF" stroke-width="1"/>
                  <line x1="30" y1="0" x2="30" y2="10" stroke="#00C8FF" stroke-width="1"/>
                  <line x1="30" y1="50" x2="30" y2="60" stroke="#00C8FF" stroke-width="1"/>
                  <line x1="0" y1="30" x2="10" y2="30" stroke="#00C8FF" stroke-width="1"/>
                  <line x1="50" y1="30" x2="60" y2="30" stroke="#00C8FF" stroke-width="1"/>
                </svg>
              </div>

              ${heroTitle ? `
              <h1 style="margin: 0 0 16px; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -1px; line-height: 1.2; text-align: center; text-shadow: 0 0 40px rgba(0, 200, 255, 0.3);">
                ${heroTitle}
              </h1>
              ` : ''}
              
              ${heroSubtitle ? `
              <p style="margin: 0 0 16px; color: #5AE4FF; font-size: 18px; font-weight: 500; text-align: center; letter-spacing: 0.5px;">
                ${heroSubtitle}
              </p>
              ` : ''}
              
              ${heroDescription ? `
              <p style="margin: 0 0 24px; color: #9CA3AF; font-size: 15px; line-height: 1.6; text-align: center;">
                ${heroDescription}
              </p>
              ` : ''}
              
              ${heroImage ? `
              <div style="text-align: center; margin-top: 24px;">
                <img src="${heroImage}" alt="Hero" class="hero-image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 200, 255, 0.1);">
              </div>
              ` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px; background: rgba(17, 24, 39, 0.4); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.06); margin-top: 16px;">
              <!-- Greeting -->
              <p style="margin: 0 0 24px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Dear ${recipientName},
              </p>
              
              <!-- Rich Content -->
              <div style="color: #E5E7EB; font-size: 15px; line-height: 1.7;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Feature Cards -->
          ${features && features.length > 0 ? `
          <tr>
            <td style="padding: 32px; background: rgba(17, 24, 39, 0.4); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.06); margin-top: 16px;">
              <div class="feature-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                ${features.map(feature => `
                  <div class="feature-card" style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(9, 14, 24, 0.9) 100%); border: 1px solid rgba(0, 200, 255, 0.1); border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 30px rgba(0, 200, 255, 0.05);">
                    <div style="font-size: 32px; margin-bottom: 12px;">${feature.icon}</div>
                    <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 600;">${feature.title}</h3>
                    <p style="margin: 0; color: #9CA3AF; font-size: 13px; line-height: 1.5;">${feature.description}</p>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Offer Section -->
          ${offerSection ? `
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(0, 200, 255, 0.1) 0%, rgba(0, 119, 255, 0.1) 100%); border-radius: 16px; border: 2px solid transparent; background-clip: padding-box; position: relative; margin-top: 16px;">
              <!-- Gradient border effect -->
              <div style="position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, #00C8FF 0%, #0077FF 100%); border-radius: 16px; z-index: -1;"></div>
              <div style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(9, 14, 24, 0.98) 100%); border-radius: 14px; padding: 32px; position: relative;">
                <div style="text-align: center;">
                  <p style="margin: 0 0 8px; color: #5AE4FF; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                    ${offerSection.title}
                  </p>
                  <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 48px; font-weight: 800; letter-spacing: -2px; text-shadow: 0 0 40px rgba(0, 200, 255, 0.4);">
                    ${offerSection.discount}
                  </h2>
                  <p style="margin: 0 0 24px; color: #9CA3AF; font-size: 15px;">
                    ${offerSection.description}
                  </p>
                  ${offerSection.couponCode ? `
                    <div style="display: inline-block; background: rgba(0, 200, 255, 0.1); border: 1px solid rgba(0, 200, 255, 0.3); border-radius: 8px; padding: 12px 24px; margin-bottom: 24px;">
                      <span style="color: #00C8FF; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
                        ${offerSection.couponCode}
                      </span>
                    </div>
                  ` : ''}
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                    <tr>
                      <td style="background: linear-gradient(135deg, #00C8FF 0%, #0077FF 100%); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 200, 255, 0.4), 0 0 40px rgba(0, 200, 255, 0.2);">
                        <a href="${offerSection.buttonUrl}" style="display: inline-block; padding: 16px 40px; color: #090E18; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                          ${offerSection.buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Product Cards -->
          ${products && products.length > 0 ? `
          <tr>
            <td style="padding: 32px; background: rgba(17, 24, 39, 0.4); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.06); margin-top: 16px;">
              <div class="product-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                ${products.map(product => `
                  <div class="product-card" style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(9, 14, 24, 0.9) 100%); border: 1px solid rgba(0, 200, 255, 0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);">
                    <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 160px; object-fit: cover;">
                    <div style="padding: 16px;">
                      <h4 style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">${product.title}</h4>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <span style="color: #00C8FF; font-size: 16px; font-weight: 700;">${product.price}</span>
                        ${product.discount ? `
                          <span style="color: #9CA3AF; font-size: 13px; text-decoration: line-through;">${product.discount}</span>
                        ` : ''}
                      </div>
                      <a href="${product.buttonUrl}" style="display: inline-block; background: rgba(0, 200, 255, 0.1); color: #00C8FF; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">
                        View
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Testimonial Section -->
          ${testimonial ? `
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.6) 0%, rgba(9, 14, 24, 0.8) 100%); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.1); margin-top: 16px; position: relative;">
              <!-- Glass effect -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(0, 200, 255, 0.05) 0%, rgba(0, 119, 255, 0.05) 100%); border-radius: 16px; pointer-events: none;"></div>
              <div style="position: relative; z-index: 1;">
                <div style="text-align: center; margin-bottom: 16px;">
                  ${'★'.repeat(testimonial.rating).split('').map(() => '<span style="color: #FFD700; font-size: 20px;">★</span>').join('')}
                </div>
                <p style="margin: 0 0 16px; color: #E5E7EB; font-size: 16px; line-height: 1.6; font-style: italic; text-align: center;">
                  "${testimonial.text}"
                </p>
                <p style="margin: 0; color: #00C8FF; font-size: 14px; font-weight: 600; text-align: center;">
                  — ${testimonial.name}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Buttons -->
          ${ctaButton || secondaryCta ? `
          <tr>
            <td style="padding: 32px; text-align: center; margin-top: 16px;">
              ${ctaButton ? `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 16px;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #00C8FF 0%, #0077FF 100%); border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 200, 255, 0.4), 0 0 40px rgba(0, 200, 255, 0.2);">
                      <a href="${ctaButton.url}" style="display: inline-block; padding: 16px 40px; color: #090E18; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                        ${ctaButton.text}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ''}
              ${secondaryCta ? `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                  <tr>
                    <td style="background: rgba(0, 200, 255, 0.1); border: 1px solid rgba(0, 200, 255, 0.3); border-radius: 10px;">
                      <a href="${secondaryCta.url}" style="display: inline-block; padding: 14px 32px; color: #00C8FF; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px;">
                        ${secondaryCta.text}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Attachments -->
          ${attachments && attachments.length > 0 ? `
          <tr>
            <td style="padding: 32px; background: rgba(17, 24, 39, 0.4); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.06); margin-top: 16px;">
              <p style="margin: 0 0 16px; color: #00C8FF; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Attachments
              </p>
              ${attachments.map(att => `
                <div style="display: flex; align-items: center; padding: 12px; background: rgba(0, 200, 255, 0.05); border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(0, 200, 255, 0.1);">
                  <div style="flex: 1;">
                    <p style="margin: 0; color: #E5E7EB; font-size: 14px; font-weight: 500;">${att.name}</p>
                    <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 12px;">${att.size}</p>
                  </div>
                  <a href="${att.url}" style="color: #00C8FF; font-size: 14px; font-weight: 500; text-decoration: none;">Download</a>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Contact Glass Card -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.6) 0%, rgba(9, 14, 24, 0.8) 100%); border-radius: 16px; border: 1px solid rgba(0, 200, 255, 0.1); margin-top: 16px; position: relative;">
              <!-- Glass effect overlay -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(0, 200, 255, 0.03) 0%, rgba(0, 119, 255, 0.03) 100%); border-radius: 16px; pointer-events: none;"></div>
              <div style="position: relative; z-index: 1;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 16px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #5AE4FF; font-size: 14px; font-weight: 600;">📧 Email</p>
                      <p style="margin: 0; color: #E5E7EB; font-size: 14px;">contact@theskytechnology.in</p>
                    </td>
                    <td style="width: 16px;"></td>
                    <td style="padding: 16px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #5AE4FF; font-size: 14px; font-weight: 600;">🌐 Website</p>
                      <p style="margin: 0; color: #E5E7EB; font-size: 14px;">theskytechnology.in</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #5AE4FF; font-size: 14px; font-weight: 600;">📞 Phone</p>
                      <p style="margin: 0; color: #E5E7EB; font-size: 14px;">+91 XXXXX XXXXX</p>
                    </td>
                    <td style="width: 16px;"></td>
                    <td style="padding: 16px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #5AE4FF; font-size: 14px; font-weight: 600;">🕐 Support</p>
                      <p style="margin: 0; color: #E5E7EB; font-size: 14px;">24/7 Available</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 32px; text-align: center; border-top: 1px solid rgba(0, 200, 255, 0.1); margin-top: 16px;">
              <p style="margin: 0 0 12px; color: #6B7280; font-size: 13px;">
                © ${new Date().getFullYear()} Sky Tech. All rights reserved.
              </p>
              <p style="margin: 0; color: #4B5563; font-size: 12px;">
                <a href="https://theskytechnology.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy</a> • 
                <a href="https://theskytechnology.in/terms" style="color: #6B7280; text-decoration: none;">Terms</a> • 
                <a href="https://theskytechnology.in" style="color: #6B7280; text-decoration: none;">Website</a>
              </p>
              <p style="margin: 16px 0 0; color: #374151; font-size: 11px;">
                This email was sent to ${recipientEmail || 'you'}
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
