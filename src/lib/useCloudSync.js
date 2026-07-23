import { useCallback, useEffect, useRef, useState } from 'react';
import { migrateData } from '../data/migrate';
import { isSupabaseConfigured, supabase } from './supabase';
import { loadPersonalData, savePersonalData, saveUserProfile } from './personalDataRepository';
import { AUTH_STATUS, parseAuthRedirectError } from './authStatus';

export function useCloudSync({ data, loaded, replaceData }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? AUTH_STATUS.CHECKING : AUTH_STATUS.LOCAL);
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [remoteReady, setRemoteReady] = useState(false);
  const [lastEmailSentTo, setLastEmailSentTo] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState('');
  const dataRef = useRef(data);
  const remoteReadyRef = useRef(false);
  dataRef.current = data;

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const redirectError = parseAuthRedirectError(window.location);
    if (redirectError) {
      setError(redirectError.message);
      setStatus(AUTH_STATUS.ERROR);
      setAuthReady(true);
      if (window.location.hash) window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    }
    let active = true;
    supabase.auth.getSession().then(({ data: result, error: authError }) => {
      if (!active) return;
      setAuthReady(true);
      if (authError) { setError(authError.message); setStatus(AUTH_STATUS.ERROR); return; }
      setSession(result.session);
      if (!result.session && !redirectError) setStatus(AUTH_STATUS.LOCAL);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (redirectError && !nextSession) return;
      remoteReadyRef.current = false;
      setRemoteReady(false);
      setSession(nextSession);
      setError('');
      setAuthReady(true);
      setStatus(nextSession ? AUTH_STATUS.LOADING_REMOTE : AUTH_STATUS.LOCAL);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!loaded || !session?.user?.id || !isSupabaseConfigured) return undefined;
    let active = true;
    const loadRemote = async () => {
      setStatus(AUTH_STATUS.LOADING_REMOTE);
      const { data: row, error: loadError } = await loadPersonalData(session.user.id);
      if (!active) return;
      if (loadError) { setError(loadError.message); setStatus(AUTH_STATUS.ERROR); return; }
      const restored = row?.payload && migrateData(row.payload);
      if (restored) replaceData(restored);
      else {
        setStatus(AUTH_STATUS.CREATING_REMOTE);
        const { error: createError } = await savePersonalData(session.user.id, dataRef.current);
        if (createError) { setError(createError.message); setStatus(AUTH_STATUS.ERROR); return; }
      }
      const { error: profileError } = await saveUserProfile(session.user, restored || dataRef.current);
      if (profileError) { setError(profileError.message); setStatus(AUTH_STATUS.ERROR); return; }
      remoteReadyRef.current = true;
      setRemoteReady(true);
      setLastSyncAt(new Date().toISOString());
      setStatus(AUTH_STATUS.SYNCED);
    };
    loadRemote();
    return () => { active = false; };
  }, [loaded, session?.user?.id, replaceData]);

  useEffect(() => {
    if (!loaded || !session?.user?.id || !remoteReadyRef.current || !isSupabaseConfigured) return undefined;
    setStatus(AUTH_STATUS.SAVING);
    const timer = window.setTimeout(async () => {
      const { error: saveError } = await savePersonalData(session.user.id, data);
      const { error: profileError } = saveError ? { error: null } : await saveUserProfile(session.user, data);
      if (saveError || profileError) { setError((saveError || profileError).message); setStatus(AUTH_STATUS.ERROR); }
      else { setError(''); setLastSyncAt(new Date().toISOString()); setStatus(AUTH_STATUS.SYNCED); }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [data, loaded, session?.user?.id]);

  const signIn = useCallback(async (provider) => {
    if (!isSupabaseConfigured) return;
    setStatus(AUTH_STATUS.CHECKING); setError('');
    const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: provider === 'microsoft' ? 'azure' : 'google', options: { redirectTo: `${window.location.origin}/app` } });
    if (signInError) { setError(signInError.message); setStatus(AUTH_STATUS.ERROR); }
  }, []);
  const sendMagicLink = useCallback(async (email) => {
    if (!isSupabaseConfigured || !email?.trim()) return { error: new Error('Enter a valid email address.') };
    setStatus(AUTH_STATUS.CHECKING); setError('');
    const normalizedEmail = email.trim();
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/app?profile=1`, shouldCreateUser: true },
    });
    if (magicError) { setError(magicError.message); setStatus(AUTH_STATUS.ERROR); return { error: magicError }; }
    setLastEmailSentTo(normalizedEmail);
    setStatus(AUTH_STATUS.LINK_SENT);
    return { error: null };
  }, []);
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setStatus(AUTH_STATUS.SIGNING_OUT);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) { setError(signOutError.message); setStatus(AUTH_STATUS.ERROR); }
    else { remoteReadyRef.current = false; setRemoteReady(false); setSession(null); setStatus(AUTH_STATUS.LOCAL); }
  }, []);
  const syncNow = useCallback(async () => {
    if (!session?.user?.id || !isSupabaseConfigured) return;
    setStatus(AUTH_STATUS.SAVING);
    const { error: saveError } = await savePersonalData(session.user.id, dataRef.current);
    const { error: profileError } = saveError ? { error: null } : await saveUserProfile(session.user, dataRef.current);
    if (saveError || profileError) { setError((saveError || profileError).message); setStatus(AUTH_STATUS.ERROR); }
    else { setError(''); setLastSyncAt(new Date().toISOString()); setStatus(AUTH_STATUS.SYNCED); }
  }, [session?.user?.id]);

  return { configured: isSupabaseConfigured, session, status, error, authReady, remoteReady, lastEmailSentTo, lastSyncAt, signIn, sendMagicLink, signOut, syncNow };
}
