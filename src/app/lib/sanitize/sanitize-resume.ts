export function sanitizeResumeText(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  let sanitized = text;

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /1[3-9]\d{9}/g;
  const landlineRegex = /0\d{2,3}-\d{7,8}/g;
  const landlineRegex2 = /0\d{2,3}\d{7,8}/g;
  const internationalPhoneRegex = /\+?\d{1,3}[-\s]?\(?\d{2,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}/g;

  sanitized = sanitized.replace(emailRegex, "[邮箱已移除]");
  sanitized = sanitized.replace(phoneRegex, "[手机号已移除]");
  sanitized = sanitized.replace(landlineRegex, "[电话已移除]");
  sanitized = sanitized.replace(landlineRegex2, "[电话已移除]");
  sanitized = sanitized.replace(internationalPhoneRegex, "[电话已移除]");

  return sanitized;
}
