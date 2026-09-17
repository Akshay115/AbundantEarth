// Only operator-configured HTTPS destinations are allowed. Never infer a payment account.
export function httpsUrl(value, name = 'URL') {
  if (!value?.trim()) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${name} must be an HTTPS URL without credentials.`);
  }
  return url.href;
}

export function emailDraft(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// A missing project checkout must never silently route a restricted gift to the general fund.
export function givingDestination({ project, monthly, oneTimeUrl, monthlyUrl, projectUrls }) {
  if (!project) return (monthly ? monthlyUrl : oneTimeUrl) || '';
  const match = projectUrls.find(item => item.slug === project);
  return (monthly ? match?.monthlyUrl : match?.oneTimeUrl) || '';
}
