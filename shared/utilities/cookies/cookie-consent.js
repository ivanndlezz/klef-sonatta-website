const KLEF_COOKIE_KEY = "klef_cookie_consent";

function getCookieConsent() {
  const raw = localStorage.getItem(KLEF_COOKIE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCookieConsent(categories) {
  const data = {
    version: 1,
    timestamp: new Date().toISOString(),
    categories,
  };
  localStorage.setItem(KLEF_COOKIE_KEY, JSON.stringify(data));
  return data;
}

function loadScriptsForConsentedCategories(consent) {
  if (!consent || !consent.categories) return;
  Object.entries(consent.categories).forEach(([category, allowed]) => {
    if (!allowed) return;
    const group = KLEF_COOKIE_SCRIPTS[category];
    if (!group) return;
    group.forEach((scriptConfig) => {
      try {
        scriptConfig.load();
      } catch (e) {
        /* log opcional */
      }
    });
  });
}
