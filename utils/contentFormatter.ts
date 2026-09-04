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

  // 3. If the content is purely plain text without any HTML tags, wrap lines into <p> tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(formatted);
  if (!hasHtmlTags && formatted.trim().length > 0) {
    formatted = formatted
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }

  return formatted;
}
