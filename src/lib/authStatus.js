export const AUTH_STATUS = {
  LOCAL: 'local',
  CHECKING: 'checking',
  LINK_SENT: 'link_sent',
  LOADING_REMOTE: 'loading_remote',
  CREATING_REMOTE: 'creating_remote',
  SAVING: 'saving',
  SYNCED: 'synced',
  SIGNING_OUT: 'signing_out',
  ERROR: 'error',
};

export const authStatusLabels = {
  [AUTH_STATUS.LOCAL]: 'Saved locally',
  [AUTH_STATUS.CHECKING]: 'Checking sign-in',
  [AUTH_STATUS.LINK_SENT]: 'Email sent',
  [AUTH_STATUS.LOADING_REMOTE]: 'Loading cloud data',
  [AUTH_STATUS.CREATING_REMOTE]: 'Creating cloud backup',
  [AUTH_STATUS.SAVING]: 'Saving to cloud',
  [AUTH_STATUS.SYNCED]: 'Cloud synced',
  [AUTH_STATUS.SIGNING_OUT]: 'Signing out',
  [AUTH_STATUS.ERROR]: 'Sync needs attention',
};

export function parseAuthRedirectError(locationLike) {
  const hash = locationLike?.hash || '';
  const search = locationLike?.search || '';
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  for (const source of [params, searchParams]) {
    const error = source.get('error') || source.get('error_code');
    if (!error) continue;
    const description = source.get('error_description') || source.get('error_message') || '';
    const normalized = `${error} ${description}`.toLowerCase();
    const expired = /expired|invalid|otp|token|link/.test(normalized);
    return {
      code: error,
      description,
      message: expired
        ? 'That sign-in link is expired or invalid. Request a new email link and use the newest message.'
        : description || 'The sign-in link was rejected. Request a new email link and try again.',
    };
  }
  return null;
}

export function isRemoteDataLoading(cloud) {
  if (!cloud?.configured) return false;
  if ([AUTH_STATUS.CHECKING, AUTH_STATUS.LOADING_REMOTE, AUTH_STATUS.CREATING_REMOTE].includes(cloud.status)) return true;
  return Boolean(cloud.session && !cloud.remoteReady);
}

export function canEditProfile(cloud) {
  return !isRemoteDataLoading(cloud);
}
