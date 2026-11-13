/** Escape HTML delimiters so catalog text cannot terminate a JSON-LD script. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
