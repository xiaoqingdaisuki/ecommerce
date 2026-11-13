import sanitizeHtml from 'sanitize-html';

export function CmsContent({ html }: { html: string }) {
  const clean = sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
