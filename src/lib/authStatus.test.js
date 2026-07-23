import { AUTH_STATUS, canEditProfile, parseAuthRedirectError } from './authStatus';

test('recognizes expired or invalid magic-link redirect errors', () => {
  const result = parseAuthRedirectError({ hash: '#error=access_denied&error_description=Token%20has%20expired%20or%20is%20invalid' });
  expect(result.message).toMatch(/expired or invalid/i);
});

test('recognizes rejected auth links from query params', () => {
  const result = parseAuthRedirectError({ search: '?error_code=access_denied&error_description=Rejected' });
  expect(result.code).toBe('access_denied');
  expect(result.message).toMatch(/rejected/i);
});

test('allows local profile edits when Supabase is not configured', () => {
  expect(canEditProfile({ configured: false, status: AUTH_STATUS.LOCAL })).toBe(true);
});

test('blocks profile edits while remote data is loading after login', () => {
  expect(canEditProfile({ configured: true, session: { user: { id: 'u1' } }, remoteReady: false, status: AUTH_STATUS.LOADING_REMOTE })).toBe(false);
});

test('allows profile edits once the remote document is ready', () => {
  expect(canEditProfile({ configured: true, session: { user: { id: 'u1' } }, remoteReady: true, status: AUTH_STATUS.SYNCED })).toBe(true);
});
