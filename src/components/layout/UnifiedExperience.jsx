import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTH_STATUS, authStatusLabels, canEditProfile } from '../../lib/authStatus';
import { LIFE_DIMENSIONS } from '../../utils/personalScore';
import ProfileCheckIn from '../profile/ProfileCheckIn';
import './unified-experience.css';

const Icon = ({ children }) => <span className="material-symbols-rounded" aria-hidden="true">{children}</span>;

const CORE = [
  ['dashboard', 'home', 'Today'],
  ['compass', 'explore', 'Compass'],
  ['tasks', 'checklist', 'Tasks'],
  ['focus', 'timer', 'Focus'],
  ['habits', 'routine', 'Habits'],
];

const MORE_GROUPS = [
  ['Plan', [['plans', 'alt_route', 'If-Then'], ['habitbuilder', 'psychiatry', 'Builder'], ['goals', 'track_changes', 'Goals']]],
  ['Track', [['timelog', 'schedule', 'Time'], ['finance', 'account_balance_wallet', 'Money'], ['health', 'favorite', 'Health']]],
  ['Life Areas', [['learning', 'menu_book', 'Learning'], ['sports', 'sports_soccer', 'Sports'], ['workcareer', 'work', 'Career']]],
  ['Review & System', [['reports', 'monitoring', 'Reports'], ['review', 'event_available', 'Review'], ['settings', 'settings', 'Settings']]],
];
const MORE_VIEWS = MORE_GROUPS.flatMap(([, items]) => items.map(([itemView]) => itemView));

const profileFromLocation = () => new URLSearchParams(window.location.search).get('profile') === '1';

const writeProfileToUrl = (open, mode = 'push') => {
  const method = mode === 'replace' ? 'replaceState' : 'pushState';
  const url = new URL(window.location.href);
  if (open) url.searchParams.set('profile', '1');
  else url.searchParams.delete('profile');
  if (url.href !== window.location.href) window.history[method]({}, '', url);
};

export default function UnifiedExperience({ view, data, setData, navigate, preloadView, dateContext, saved, canUndo, onUndo, cloud, children }) {
  const [profileOpen, setProfileOpen] = useState(profileFromLocation);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const profileBlocked = profileOpen && !canEditProfile(cloud);
  const profileAuthError = profileOpen && cloud.configured && cloud.status === AUTH_STATUS.ERROR && !cloud.session;
  const profileName = data.settings?.name || 'You';
  const moreActive = MORE_VIEWS.includes(view);
  const dimensionNav = useMemo(() => (data.personalization.activeDimensions || [])
    .map((key) => [LIFE_DIMENSIONS[key].view, LIFE_DIMENSIONS[key].icon, LIFE_DIMENSIONS[key].label])
    .filter(([itemView]) => !CORE.some(([coreView]) => coreView === itemView)), [data.personalization.activeDimensions]);

  const resetScroll = () => requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  const warmView = (nextView) => preloadView?.(nextView);
  const openProfile = useCallback(() => {
    setMoreOpen(false);
    setProfileOpen(true);
    writeProfileToUrl(true);
  }, []);
  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    writeProfileToUrl(false, 'replace');
  }, []);
  const goTo = (nextView) => {
    setMoreOpen(false);
    navigate(nextView);
    resetScroll();
  };
  const goHome = () => {
    setMoreOpen(false);
    navigate('dashboard');
    resetScroll();
  };
  const renderNavItems = (items) => items.map(([itemView, icon, label]) => {
    const active = view === itemView;
    return (
      <button
        key={`${itemView}-${label}`}
        className={active ? 'active' : ''}
        onClick={() => goTo(itemView)}
        onPointerEnter={() => warmView(itemView)}
        onFocus={() => warmView(itemView)}
        onTouchStart={() => warmView(itemView)}
        title={label}
        aria-current={active ? 'page' : undefined}
        aria-label={`Open ${label}`}
      >
        <Icon>{icon}</Icon><span>{label}</span>
      </button>
    );
  });

  useEffect(() => {
    const syncProfileFromUrl = () => setProfileOpen(profileFromLocation());
    window.addEventListener('popstate', syncProfileFromUrl);
    return () => window.removeEventListener('popstate', syncProfileFromUrl);
  }, []);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const closeOnOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [moreOpen]);

  return <div className={`ux-shell ${data.behaviorPreferences?.accessibility?.reducedMotion ? 'reduce-motion' : ''}`}>
    <aside className="ux-nav">
      <button className="ux-brand" onClick={() => goTo('dashboard')} onPointerEnter={() => warmView('dashboard')} onFocus={() => warmView('dashboard')} aria-label="Open Today home">
        <span><Icon>eco</Icon></span>
        <b>PERSONAL OS<small>Life Garden</small></b>
      </button>
      <nav aria-label="Unified PersonalOS navigation">
        <div className="ux-nav-section">
          <div className="ux-nav-label">Daily Flow</div>
          {renderNavItems(CORE)}
        </div>
        {dimensionNav.length > 0 && <div className="ux-nav-section">
          <div className="ux-nav-label">Life Areas</div>
          {renderNavItems(dimensionNav)}
        </div>}
        <div className="ux-nav-section ux-more-wrap" ref={moreRef}>
          <div className="ux-nav-label">More Tools</div>
          <button className={moreOpen || moreActive ? 'active' : ''} onPointerEnter={() => MORE_VIEWS.slice(0, 3).forEach(warmView)} onFocus={() => MORE_VIEWS.slice(0, 3).forEach(warmView)} onClick={() => setMoreOpen((value) => !value)} aria-current={moreActive ? 'page' : undefined} aria-expanded={moreOpen} aria-haspopup="menu" aria-label={moreOpen ? 'Close more tools' : 'Open more tools'}>
            <Icon>apps</Icon><span>More</span>
          </button>
          {moreOpen && <div className="ux-more" role="menu">
            {MORE_GROUPS.map(([group, items]) => <div className="ux-more-group" key={group}>
              <div className="ux-more-label">{group}</div>
              {items.map(([itemView, icon, label]) => {
                const active = view === itemView;
                return (
                  <button key={itemView} className={active ? 'active' : ''} role="menuitem" onPointerEnter={() => warmView(itemView)} onFocus={() => warmView(itemView)} onTouchStart={() => warmView(itemView)} onClick={() => goTo(itemView)} aria-current={active ? 'page' : undefined} aria-label={`Open ${label}`}>
                    <Icon>{icon}</Icon>{label}
                  </button>
                );
              })}
            </div>)}
          </div>}
        </div>
      </nav>
      <button className="ux-garden-settings" onClick={openProfile} aria-label="Open Your Garden settings">
        <Icon>tune</Icon><span>Your Garden<small>View & adjust</small></span>
      </button>
    </aside>

    <div className="ux-stage">
      <header className="ux-topbar">
        <div><Icon>light_mode</Icon><span><b>{dateContext.now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b><small>One clear step at a time.</small></span></div>
        <div className="ux-top-actions">
          {view !== 'dashboard' && <button className="ux-home-return" onPointerEnter={() => warmView('dashboard')} onFocus={() => warmView('dashboard')} onClick={goHome} aria-label="Return to Today home"><Icon>home</Icon><span>Today</span></button>}
          {canUndo && <button className="ux-undo-action" onClick={onUndo}><Icon>undo</Icon>Undo</button>}
          <button onClick={openProfile} aria-label={`Open ${profileName} profile and Your Garden settings`}><span className="ux-avatar">{profileName[0]}</span><span>{profileName}<small>{cloud.session ? 'Cloud connected' : saved ? 'Saved locally' : 'Your Garden'}</small></span><Icon>expand_more</Icon></button>
        </div>
      </header>
      <main className={view === 'dashboard' ? 'ux-main-home' : 'ux-main-workspace'}>
        {view === 'dashboard' && React.isValidElement(children) ? React.cloneElement(children, { onEditProfile: openProfile }) : children}
      </main>
    </div>

    {profileBlocked && <div className="ux-modal-backdrop" role="presentation"><section className="ux-profile-modal ux-auth-wait" role="dialog" aria-modal="true" aria-labelledby="auth-wait-title"><header><div><small>SECURE SIGN-IN</small><h2 id="auth-wait-title">Loading your cloud data.</h2><p>Your profile questions will unlock after your saved PersonalOS data finishes loading.</p></div></header><div className="ux-auth-state"><span className="material-symbols-rounded" aria-hidden="true">sync</span><b>{authStatusLabels[cloud.status] || 'Loading cloud data'}</b><p>This prevents new profile answers from overwriting data from another device.</p></div></section></div>}
    {profileAuthError && <div className="ux-modal-backdrop" role="presentation"><section className="ux-profile-modal ux-auth-wait" role="dialog" aria-modal="true" aria-labelledby="auth-error-title"><header><div><small>SECURE SIGN-IN</small><h2 id="auth-error-title">This sign-in link did not work.</h2><p>{cloud.error || 'Request a new email link and use the newest message.'}</p></div><button onClick={closeProfile} aria-label="Close sign-in error"><Icon>close</Icon></button></header></section></div>}
    {profileOpen && !profileBlocked && !profileAuthError && <ProfileCheckIn data={data} setData={setData} onClose={closeProfile} />}
  </div>;
}
