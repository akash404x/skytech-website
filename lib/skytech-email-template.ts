export interface SkyTechEmailData {
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
  services?: Array<{
    icon: string;
    title: string;
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

export function generateSkyTechEmailTemplate(data: SkyTechEmailData): string {
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
    services,
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
          background-color: #F4F8FC;
        }
        a {
          color: #0EA5FF;
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
          .service-grid {
            display: block !important;
          }
          .service-card {
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
    <body style="margin: 0; padding: 0; background-color: #F4F8FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      
      <!-- Email Container -->
      <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header with Logo -->
        <tr>
          <td style="padding: 24px 32px; background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); border-radius: 16px 16px 0 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
              <tr>
                <td style="text-align: center;">
                  <!-- Sky Tech Logo -->
                  <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 16px 32px; border-radius: 12px; backdrop-filter: blur(10px);">
                    <span style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                      Sky<span style="background: linear-gradient(135deg, #00bfff 0%, #00e5ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Tech</span>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-top: 12px;">
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                    Innovation • Technology • Electronics
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero Section -->
        ${heroTitle || heroSubtitle || heroDescription || heroImage ? `
        <tr>
          <td style="padding: 40px 32px; background: #ffffff; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            ${heroTitle ? `
              <h1 style="margin: 0 0 16px; color: #1F2937; font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 1.2; text-align: center;">
                ${heroTitle}
              </h1>
            ` : ''}
            
            ${heroSubtitle ? `
              <p style="margin: 0 0 16px; color: #0EA5FF; font-size: 18px; font-weight: 600; text-align: center; letter-spacing: 0.5px;">
                ${heroSubtitle}
              </p>
            ` : ''}
            
            ${heroDescription ? `
              <p style="margin: 0 0 24px; color: #64748B; font-size: 15px; line-height: 1.6; text-align: center;">
                ${heroDescription}
              </p>
            ` : ''}
            
            ${heroImage ? `
              <div style="text-align: center; margin-top: 24px;">
                <img src="${heroImage}" alt="Hero" class="hero-image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 20px 40px rgba(14, 165, 255, 0.15);">
              </div>
            ` : ''}
          </td>
        </tr>
        ` : ''}

        <!-- Content Body -->
        <tr>
          <td style="padding: 32px; background: #ffffff; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <!-- Greeting -->
            <p style="margin: 0 0 24px; color: #1F2937; font-size: 16px; line-height: 1.6;">
              Dear ${recipientName},
            </p>
            
            <!-- Rich Content -->
            <div style="color: #374151; font-size: 15px; line-height: 1.7;">
              ${content}
            </div>
          </td>
        </tr>

        <!-- Feature Cards -->
        ${features && features.length > 0 ? `
        <tr>
          <td style="padding: 32px; background: #F8FBFF; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <div class="feature-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              ${features.map(feature => `
                <div class="feature-card" style="background: #ffffff; border: 1px solid #DCEEFF; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(14, 165, 255, 0.08);">
                  <div style="font-size: 32px; margin-bottom: 12px;">${feature.icon}</div>
                  <h3 style="margin: 0 0 8px; color: #1F2937; font-size: 16px; font-weight: 600;">${feature.title}</h3>
                  <p style="margin: 0; color: #64748B; font-size: 13px; line-height: 1.5;">${feature.description}</p>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- Services Section -->
        ${services && services.length > 0 ? `
        <tr>
          <td style="padding: 32px; background: #ffffff; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <h3 style="margin: 0 0 24px; color: #1F2937; font-size: 20px; font-weight: 700; text-align: center;">Our Services</h3>
            <div class="service-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              ${services.map(service => `
                <div class="service-card" style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 10px; padding: 16px; text-align: center;">
                  <div style="font-size: 28px; margin-bottom: 8px;">${service.icon}</div>
                  <p style="margin: 0; color: #1F2937; font-size: 13px; font-weight: 600;">${service.title}</p>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- Offer Section -->
        ${offerSection ? `
        <tr>
          <td style="padding: 32px; background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <div style="background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #0EA5FF; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                ${offerSection.title}
              </p>
              <h2 style="margin: 0 0 12px; color: #1F2937; font-size: 48px; font-weight: 800; letter-spacing: -2px;">
                ${offerSection.discount}
              </h2>
              <p style="margin: 0 0 24px; color: #64748B; font-size: 15px;">
                ${offerSection.description}
              </p>
              ${offerSection.couponCode ? `
                <div style="display: inline-block; background: #F8FBFF; border: 2px dashed #0EA5FF; border-radius: 8px; padding: 12px 24px; margin-bottom: 24px;">
                  <span style="color: #0EA5FF; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
                    ${offerSection.couponCode}
                  </span>
                </div>
              ` : ''}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); border-radius: 10px; box-shadow: 0 8px 24px rgba(14, 165, 255, 0.3);">
                    <a href="${offerSection.buttonUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                      ${offerSection.buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- Product Cards -->
        ${products && products.length > 0 ? `
        <tr>
          <td style="padding: 32px; background: #F8FBFF; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <h3 style="margin: 0 0 24px; color: #1F2937; font-size: 20px; font-weight: 700; text-align: center;">Featured Products</h3>
            <div class="product-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              ${products.map(product => `
                <div class="product-card" style="background: #ffffff; border: 1px solid #DCEEFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(14, 165, 255, 0.08);">
                  <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 160px; object-fit: cover;">
                  <div style="padding: 16px;">
                    <h4 style="margin: 0 0 8px; color: #1F2937; font-size: 14px; font-weight: 600;">${product.title}</h4>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                      <span style="color: #0EA5FF; font-size: 16px; font-weight: 700;">${product.price}</span>
                      ${product.discount ? `
                        <span style="color: #9CA3AF; font-size: 13px; text-decoration: line-through;">${product.discount}</span>
                      ` : ''}
                    </div>
                    <a href="${product.buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">
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
          <td style="padding: 32px; background: #ffffff; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <div style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 12px; padding: 24px; text-align: center;">
              <div style="margin-bottom: 16px;">
                ${'★'.repeat(testimonial.rating).split('').map(() => '<span style="color: #F59E0B; font-size: 20px;">★</span>').join('')}
              </div>
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6; font-style: italic;">
                "${testimonial.text}"
              </p>
              <p style="margin: 0; color: #0EA5FF; font-size: 14px; font-weight: 600;">
                — ${testimonial.name}
              </p>
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- CTA Buttons -->
        ${ctaButton || secondaryCta ? `
        <tr>
          <td style="padding: 32px; background: #ffffff; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF; text-align: center;">
            ${ctaButton ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); border-radius: 10px; box-shadow: 0 8px 24px rgba(14, 165, 255, 0.3);">
                    <a href="${ctaButton.url}" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                      ${ctaButton.text}
                    </a>
                  </td>
                </tr>
              </table>
            ` : ''}
            ${secondaryCta ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background: #F8FBFF; border: 1px solid #DCEEFF; border-radius: 10px;">
                    <a href="${secondaryCta.url}" style="display: inline-block; padding: 14px 32px; color: #0EA5FF; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.5px;">
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
          <td style="padding: 32px; background: #F8FBFF; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <p style="margin: 0 0 16px; color: #0EA5FF; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Attachments
            </p>
            ${attachments.map(att => `
              <div style="display: flex; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; margin-bottom: 8px; border: 1px solid #DCEEFF;">
                <div style="flex: 1;">
                  <p style="margin: 0; color: #1F2937; font-size: 14px; font-weight: 500;">${att.name}</p>
                  <p style="margin: 4px 0 0; color: #64748B; font-size: 12px;">${att.size}</p>
                </div>
                <a href="${att.url}" style="color: #0EA5FF; font-size: 14px; font-weight: 500; text-decoration: none;">Download</a>
              </div>
            `).join('')}
          </td>
        </tr>
        ` : ''}

        <!-- Contact Section -->
        <tr>
          <td style="padding: 32px; background: #F8FBFF; border-left: 1px solid #DCEEFF; border-right: 1px solid #DCEEFF;">
            <h3 style="margin: 0 0 24px; color: #1F2937; font-size: 18px; font-weight: 700; text-align: center;">Contact Us</h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 16px; text-align: center; background: #ffffff; border: 1px solid #DCEEFF; border-radius: 10px;">
                  <p style="margin: 0 0 8px; color: #0EA5FF; font-size: 14px; font-weight: 600;">📧 Email</p>
                  <p style="margin: 0; color: #1F2937; font-size: 14px;">contact@theskytechnology.in</p>
                </td>
                <td style="width: 12px;"></td>
                <td style="padding: 16px; text-align: center; background: #ffffff; border: 1px solid #DCEEFF; border-radius: 10px;">
                  <p style="margin: 0 0 8px; color: #0EA5FF; font-size: 14px; font-weight: 600;">📞 Phone</p>
                  <p style="margin: 0; color: #1F2937; font-size: 14px;">+91 5334357055</p>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="height: 12px;"></td>
              </tr>
              <tr>
                <td style="padding: 16px; text-align: center; background: #ffffff; border: 1px solid #DCEEFF; border-radius: 10px;">
                  <p style="margin: 0 0 8px; color: #0EA5FF; font-size: 14px; font-weight: 600;">🌐 Website</p>
                  <p style="margin: 0; color: #1F2937; font-size: 14px;">theskytechnology.in</p>
                </td>
                <td style="width: 12px;"></td>
                <td style="padding: 16px; text-align: center; background: #ffffff; border: 1px solid #DCEEFF; border-radius: 10px;">
                  <p style="margin: 0 0 8px; color: #0EA5FF; font-size: 14px; font-weight: 600;">🕐 Business Hours</p>
                  <p style="margin: 0; color: #1F2937; font-size: 14px;">24/7 Available</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 32px; background: #ffffff; border: 1px solid #DCEEFF; border-top: none; border-radius: 0 0 16px 16px; text-align: center;">
            <!-- Logo -->
            <div style="margin-bottom: 16px;">
              <span style="color: #1F2937; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Sky<span style="background: linear-gradient(135deg, #0EA5FF 0%, #2563EB 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Tech</span>
              </span>
            </div>
            
            <!-- Tagline -->
            <p style="margin: 0 0 16px; color: #64748B; font-size: 13px; font-style: italic;">
              Building The Future Through Technology
            </p>
            
            <!-- Links -->
            <p style="margin: 0 0 16px; color: #64748B; font-size: 13px;">
              <a href="https://theskytechnology.in/privacy-policy" style="color: #0EA5FF; text-decoration: none;">Privacy Policy</a> • 
              <a href="https://theskytechnology.in/terms-of-service" style="color: #0EA5FF; text-decoration: none;">Terms of Service</a> • 
              <a href="https://theskytechnology.in" style="color: #0EA5FF; text-decoration: none;">Website</a>
            </p>
            
            <!-- Copyright -->
            <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
              © ${new Date().getFullYear()} Sky Tech. All rights reserved.
            </p>
            
            <p style="margin: 16px 0 0; color: #9CA3AF; font-size: 11px;">
              This email was sent to ${recipientEmail || 'you'}
            </p>
          </td>
        </tr>

      </table>
      <!-- End Email Container -->

    </body>
    </html>
  `;
}
