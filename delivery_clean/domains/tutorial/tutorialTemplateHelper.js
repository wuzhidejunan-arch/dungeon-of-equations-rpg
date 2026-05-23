export function formatTutorialTemplate(template, values = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => `${values?.[key] ?? ''}`);
}
