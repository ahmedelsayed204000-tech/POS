export const hasEmailDeliveryConsent = (consent = {}) => Boolean(consent.emailDelivery);
export const hasReminderConsent = (consent = {}) => Boolean(consent.reminders);

export const canConnectEmailDelivery = (consent = {}) => hasEmailDeliveryConsent(consent);

export const canEnableReminders = (consent = {}) =>
  hasEmailDeliveryConsent(consent) && hasReminderConsent(consent);

export const automationConsentMessage = (consent = {}) => {
  if (!hasEmailDeliveryConsent(consent)) return 'Turn on email consent before connecting a delivery account.';
  if (!hasReminderConsent(consent)) return 'Turn on reminder consent before enabling reminders.';
  return '';
};

export const applyAutomationConsentPatch = (automations = {}, patch = {}) => ({
  ...automations,
  ...(patch.emailDelivery === false || patch.reminders === false ? { enabled: false } : {}),
});
