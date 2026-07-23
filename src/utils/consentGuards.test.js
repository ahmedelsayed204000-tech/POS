import {
  applyAutomationConsentPatch,
  automationConsentMessage,
  canConnectEmailDelivery,
  canEnableReminders,
} from './consentGuards';

test('requires email consent before connecting an email delivery account', () => {
  expect(canConnectEmailDelivery({ emailDelivery: false })).toBe(false);
  expect(canConnectEmailDelivery({ emailDelivery: true })).toBe(true);
});

test('requires both email and reminder consent before enabling reminders', () => {
  expect(canEnableReminders({ emailDelivery: true, reminders: false })).toBe(false);
  expect(canEnableReminders({ emailDelivery: false, reminders: true })).toBe(false);
  expect(canEnableReminders({ emailDelivery: true, reminders: true })).toBe(true);
});

test('explains which consent is missing first', () => {
  expect(automationConsentMessage({ emailDelivery: false, reminders: false })).toMatch(/email consent/i);
  expect(automationConsentMessage({ emailDelivery: true, reminders: false })).toMatch(/reminder consent/i);
  expect(automationConsentMessage({ emailDelivery: true, reminders: true })).toBe('');
});

test('turns off reminders when delivery or reminder consent is withdrawn', () => {
  expect(applyAutomationConsentPatch({ enabled: true }, { emailDelivery: false }).enabled).toBe(false);
  expect(applyAutomationConsentPatch({ enabled: true }, { reminders: false }).enabled).toBe(false);
  expect(applyAutomationConsentPatch({ enabled: true }, { reminders: true }).enabled).toBe(true);
});
