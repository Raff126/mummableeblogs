/**
 * Utility to parse and format article content for both live website display and preview.
 * - Supports standard HTML (<a href="..." target="_blank">)
 * - Automatically parses Markdown links: [Brand Name](https://example.com) -> <a href="https://example.com" target="_blank" rel="noopener noreferrer">Brand Name</a>
 * - Ensures all external links open in a new tab with noopener noreferrer
 */
export function formatArticleContent(rawContent: string): string {
  if (!rawContent) return '';

  let formatted = rawContent;

  // 1. Convert Markdown links [Anchor Text](https://url) to HTML <a ...>
  // Matches [text](url) where url does not contain whitespace
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+)\)/g,
    (_match, text, url) => {
      const isExternal = url.startsWith('http');
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${targetAttr}>${text}</a>`;
    }
  );

  // 2. Ensure existing HTML <a href="..."> tags with external URLs have target="_blank" rel="noopener noreferrer"
  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/[^"']+)["']([^>]*)>/gi,
    (match, url, rest) => {
      // If target is already defined, leave it
      if (/target=/i.test(match)) {
        if (!/rel=/i.test(match)) {
          return match.replace(/>$/, ' rel="noopener noreferrer">');
        }
        return match;
      }
      // If rel is already defined, add target
      if (/rel=/i.test(match)) {
        return `<a href="${url}"${rest} target="_blank">`;
      }
      return `<a href="${url}"${rest} target="_blank" rel="noopener noreferrer">`;
    }
  );

  // 3. Clean Microsoft Word / pasted document artifacts (white text, o:p tags, mso styles)
  // Strip white or light text colors that make text invisible on light background
  formatted = formatted.replace(
    /style=["']([^"']*?)color\s*:\s*(?:white|#fff(?:fff)?|rgba?\s*\(\s*255\s*,\s*255\s*,\s*255[^)]*\))([^"']*?)["']/gi,
    (_m, pre, post) => {
      const remaining = `${pre}${post}`.replace(/;\s*;/g, ';').trim().replace(/^;|;$/g, '');
      return remaining ? `style="${remaining}"` : '';
    }
  );

  // Strip Word o:p namespace tags
  formatted = formatted.replace(/<\/?o:p[^>]*>/gi, '');

  // Strip mso- specific styles from style attributes
  formatted = formatted.replace(/mso-[^:;"]+:[^;"]+;?/gi, '');

  // Strip empty style attributes
  formatted = formatted.replace(/\s*style=["']\s*["']/gi, '');

  // 4. Wrap standalone tables in a responsive scrolling container if not already wrapped
  formatted = formatted.replace(
    /(<table[\s\S]*?<\/table>)/gi,
    (tableMatch) => {
      // Clean inline padding like padding:.75pt from table cells so CSS padding works
      const cleanedTable = tableMatch.replace(
        /(<td|<th)([^>]*?)style=["'][^"']*?padding\s*:[^"']*?["']/gi,
        '$1$2'
      );
      return `<div className="overflow-x-auto my-6 rounded-2xl border border-gray-200 shadow-2xs max-w-full">${cleanedTable}</div>`;
    }
  );

  // 5. If the content is purely plain text without any HTML tags, wrap lines into <p> tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(formatted);
  if (!hasHtmlTags && formatted.trim().length > 0) {
    formatted = formatted
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }

  return formatted;
}
