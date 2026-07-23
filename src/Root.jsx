import React, { useEffect, useState } from 'react';
import App from './App';
import Website from './components/website/Website';

export default function Root() {
  const getSurface = () => window.location.pathname.startsWith('/app') || window.location.hash.startsWith('#app') ? 'app' : 'website';
  const [surface, setSurface] = useState(getSurface);
  const showTestBadge = new URLSearchParams(window.location.search).get('qaBadge') === '1';

  useEffect(() => {
    const onPopState = () => setSurface(getSurface());
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  const openApp = () => {
    if (window.location.protocol === 'file:') window.location.hash = 'app';
    else window.history.pushState({}, '', '/app');
    setSurface('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <>
    {surface === 'app' ? <App /> : <Website onLaunch={openApp} />}
    {showTestBadge && <div className="test-version-badge" aria-label="Test version" style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999, borderRadius: 999, padding: '6px 10px', background: 'rgba(13,27,42,.9)', color: '#fff8e8', border: '1px solid rgba(255,255,255,.22)', font: '700 10px Arial, sans-serif', letterSpacing: '.08em', boxShadow: '0 4px 18px rgba(0,0,0,.18)', pointerEvents: 'none' }}>TEST VERSION</div>}
  </>;
}
