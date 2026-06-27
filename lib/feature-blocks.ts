export interface FeatureBlock {
  type: 'new-product' | 'special-offer' | 'coupon' | 'announcement' | 'important-notice' | 'latest-blog' | 'latest-project' | 'upcoming-event';
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  metadata?: Record<string, string>;
}

export function generateFeatureBlockHTML(block: FeatureBlock): string {
  const icons: Record<FeatureBlock['type'], string> = {
    'new-product': '🆕',
    'special-offer': '🎁',
    'coupon': '🎟️',
    'announcement': '📢',
    'important-notice': '⚠️',
    'latest-blog': '📝',
    'latest-project': '🚀',
    'upcoming-event': '📅',
  };

  const gradients: Record<FeatureBlock['type'], string> = {
    'new-product': 'linear-gradient(135deg, #00C8FF 0%, #0077FF 100%)',
    'special-offer': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    'coupon': 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
    'announcement': 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    'important-notice': 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    'latest-blog': 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    'latest-project': 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
    'upcoming-event': 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  };

  const icon = icons[block.type];
  const gradient = gradients[block.type];

  let content = '';

  switch (block.type) {
    case 'coupon':
      content = `
        <div style="background: ${gradient}; padding: 24px; border-radius: 12px; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 48px;">${icon}</div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 20px; font-weight: 700;">${block.title}</h3>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">${block.description}</p>
              ${block.metadata?.code ? `
                <div style="margin-top: 12px; background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 6px; display: inline-block;">
                  <span style="color: #ffffff; font-weight: 600; font-size: 16px;">Code: ${block.metadata.code}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'new-product':
    case 'latest-project':
      content = `
        <div style="background: #0B1220; border: 1px solid rgba(0, 200, 255, 0.2); border-radius: 12px; overflow: hidden; margin: 20px 0;">
          ${block.imageUrl ? `
            <img src="${block.imageUrl}" alt="${block.title}" style="width: 100%; height: auto; max-height: 200px; object-fit: cover;">
          ` : ''}
          <div style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="font-size: 24px;">${icon}</span>
              <span style="background: ${gradient}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ${block.type.replace('-', ' ')}
              </span>
            </div>
            <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">${block.title}</h3>
            <p style="margin: 0 0 16px; color: #9CA3AF; font-size: 14px; line-height: 1.5;">${block.description}</p>
            ${block.link ? `
              <a href="${block.link}" style="display: inline-block; background: ${gradient}; color: #0B1220; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Learn More →
              </a>
            ` : ''}
          </div>
        </div>
      `;
      break;

    case 'special-offer':
      content = `
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 24px; border-radius: 12px; margin: 20px 0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; font-size: 120px; opacity: 0.1;">${icon}</div>
          <div style="position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 36px;">${icon}</span>
              <span style="background: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                Limited Time Offer
              </span>
            </div>
            <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 24px; font-weight: 700;">${block.title}</h3>
            <p style="margin: 0 0 16px; color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.5;">${block.description}</p>
            ${block.link ? `
              <a href="${block.link}" style="display: inline-block; background: #ffffff; color: #FF6B6B; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px;">
                Claim Offer →
              </a>
            ` : ''}
          </div>
        </div>
      `;
      break;

    case 'announcement':
    case 'important-notice':
      content = `
        <div style="background: ${block.type === 'important-notice' ? 'rgba(245, 87, 108, 0.1)' : 'rgba(102, 126, 234, 0.1)'}; border-left: 4px solid ${block.type === 'important-notice' ? '#F5576C' : '#667EEA'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 28px;">${icon}</span>
            <div>
              <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 600;">${block.title}</h3>
              <p style="margin: 0; color: #D1D5DB; font-size: 14px; line-height: 1.5;">${block.description}</p>
              ${block.link ? `
                <div style="margin-top: 12px;">
                  <a href="${block.link}" style="color: ${block.type === 'important-notice' ? '#F5576C' : '#667EEA'}; text-decoration: none; font-weight: 500; font-size: 13px;">
                    Read More →
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'latest-blog':
      content = `
        <div style="background: #111827; border: 1px solid rgba(0, 200, 255, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 24px;">${icon}</span>
            <span style="color: #00C8FF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Latest Blog Post
            </span>
          </div>
          <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">${block.title}</h3>
          <p style="margin: 0 0 16px; color: #9CA3AF; font-size: 14px; line-height: 1.5;">${block.description}</p>
          ${block.link ? `
            <a href="${block.link}" style="display: inline-block; background: rgba(0, 200, 255, 0.1); color: #00C8FF; padding: 8px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px;">
              Read Article →
            </a>
          ` : ''}
        </div>
      `;
      break;

    case 'upcoming-event':
      content = `
        <div style="background: linear-gradient(135deg, #FA709A 0%, #FEE140 100%); padding: 24px; border-radius: 12px; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <span style="font-size: 32px;">${icon}</span>
            <div>
              <h3 style="margin: 0; color: #0B1220; font-size: 20px; font-weight: 700;">${block.title}</h3>
              ${block.metadata?.date ? `
                <p style="margin: 4px 0 0; color: rgba(11, 18, 32, 0.7); font-size: 13px; font-weight: 500;">📅 ${block.metadata.date}</p>
              ` : ''}
            </div>
          </div>
          <p style="margin: 0 0 16px; color: rgba(11, 18, 32, 0.8); font-size: 14px; line-height: 1.5;">${block.description}</p>
          ${block.link ? `
            <a href="${block.link}" style="display: inline-block; background: #0B1220; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Register Now →
            </a>
          ` : ''}
        </div>
      `;
      break;

    default:
      content = '';
  }

  return content;
}
