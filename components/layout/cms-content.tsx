import sanitizeHtml from 'sanitize-html';

export function CmsContent({ html }: { html: string }) {
  const clean = sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
    },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      img: (_tagName, attributes) => ({
        tagName: 'img',
        attribs: { ...attributes, loading: 'lazy', decoding: 'async' },
      }),
    },
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
