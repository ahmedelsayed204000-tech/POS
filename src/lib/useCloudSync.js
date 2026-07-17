import { useCallback, useEffect, useRef, useState } from 'react';
import { migrateData } from '../data/migrate';
import { isSupabaseConfigured, supabase } from './supabase';
import { loadPersonalData, savePersonalData } from './personalDataRepository';

export function useCloudSync({ data, loaded, replaceData }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local');
  const [error, setError] = useState('');
  const dataRef = useRef(data);
  const remoteReadyRef = useRef(false);
  dataRef.current = data;

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data: result, error: authError }) => {
      if (!active) return;
      if (authError) { setError(authError.message); setStatus('error'); return; }
      setSession(result.session);
      if (!result.session) setStatus('local');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      remoteReadyRef.current = false;
      setSession(nextSession);
      setError('');
      setStatus(nextSession ? 'connecting' : 'local');
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!loaded || !session?.user?.id || !isSupabaseConfigured) return undefined;
    let active = true;
    const loadRemote = async () => {
      setStatus('connecting');
      const { data: row, error: loadError } = await loadPersonalData(session.user.id);
      if (!active) return;
      if (loadError) { setError(loadError.message); setStatus('error'); return; }
      const restored = row?.payload && migrateData(row.payload);
      if (restored) replaceData(restored);
      else {
        const { error: createError } = await savePersonalData(session.user.id, dataRef.current);
        if (createError) { setError(createError.message); setStatus('error'); return; }
      }
      remoteReadyRef.current = true;
      setStatus('synced');
    };
    loadRemote();
    return () => { active = false; };
  }, [loaded, session?.user?.id, replaceData]);

  useEffect(() => {
    if (!loaded || !session?.user?.id || !remoteReadyRef.current || !isSupabaseConfigured) return undefined;
    setStatus('saving');
    const timer = window.setTimeout(async () => {
      const { error: saveError } = await savePersonalData(session.user.id, data);
      if (saveError) { setError(saveError.message); setStatus('error'); }
      else { setError(''); setStatus('synced'); }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [data, loaded, session?.user?.id]);

  const signIn = useCallback(async (provider) => {
    if (!isSupabaseConfigured) return;
    setStatus('connecting'); setError('');
    const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: provider === 'microsoft' ? 'azure' : 'google', options: { redirectTo: `${window.location.origin}/app` } });
    if (signInError) { setError(signInError.message); setStatus('error'); }
  }, []);
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) { setError(signOutError.message); setStatus('error'); }
    else { remoteReadyRef.current = false; setSession(null); setStatus('local'); }
  }, []);
  const syncNow = useCallback(async () => {
    if (!session?.user?.id || !isSupabaseConfigured) return;
    setStatus('saving');
    const { error: saveError } = await savePersonalData(session.user.id, dataRef.current);
    if (saveError) { setError(saveError.message); setStatus('error'); }
    else { setError(''); setStatus('synced'); }
  }, [session?.user?.id]);

  return { configured: isSupabaseConfigured, session, status, error, signIn, signOut, syncNow };
}
