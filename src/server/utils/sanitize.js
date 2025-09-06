import sanitizeHtml from "sanitize-html";

export const sanitizeUserInput = (input) => {
  if (input == null) return '';
  return sanitizeHtml(String(input).trim(), {
    allowedTags: [],        // strip all HTML tags
    allowedAttributes: {}   // strip all attributes
  });
};
