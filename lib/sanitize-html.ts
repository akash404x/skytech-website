import sanitizeHtml from 'sanitize-html';

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'hr',
      'a',
      'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div',
    ],
    allowedAttributes: {
      '*': ['style', 'class'],
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height'],
      'td': ['colspan', 'rowspan'],
      'th': ['colspan', 'rowspan'],
    },
    allowedStyles: {
      '*': {
        'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/i],
        'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/i],
        'font-size': [/^\d+(px|em|rem|%)$/],
        'font-weight': [/^(normal|bold|[1-9]00)$/],
        'font-style': [/^(normal|italic)$/],
        'text-decoration': [/^(none|underline|line-through)$/],
        'text-align': [/^(left|center|right|justify)$/],
        'padding': [/^\d+(px|em|rem|%|cm|mm|in|pt|pc)$/],
        'margin': [/^\d+(px|em|rem|%|cm|mm|in|pt|pc)$/],
        'border': [/^.+$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    transformTags: {
      's': 'strike',
      'del': 'strike',
    },
  });
}
