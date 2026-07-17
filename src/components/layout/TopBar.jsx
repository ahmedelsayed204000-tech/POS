import React from 'react';
import C from '../../constants/theme';
import NAV from '../../constants/nav';

export default function TopBar({ view, setView, lifeScore, saved, onUndo, canUndo, dateContext }) {
  const activeNav = NAV.find((n) => n.id === view) || NAV[0];
  const now       = dateContext?.now || new Date();

  return (
    <div
      className="topbar"
      style={{
        background: '#fff',
        borderBottom: `1px solid ${C.border}`,
        padding: '9px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 17 }}>{activeNav.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{activeNav.label}</div>
          <div style={{ fontSize: 8, color: C.g2 }}>
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })} ·{' '}
            {now.toLocaleDateString('en', { weekday: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {canUndo && <button onClick={onUndo} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.navy2, borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Undo</button>}
        {/* Auto-save indicator */}
        {saved && (
          <span
            style={{
              fontSize: 9,
              color: C.green,
              fontWeight: 700,
              background: C.lgreen,
              padding: '2px 9px',
              borderRadius: 20,
            }}
          >
            ✓ Saved
          </span>
        )}

        {/* Quick-nav icon strip */}
        <div
          className="quick-nav"
          style={{
            display: 'flex',
            gap: 1,
            background: C.g0,
            borderRadius: 7,
            padding: '2px 3px',
          }}
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              title={n.label}
              style={{
                background: view === n.id ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 5,
                padding: '3px 4px',
                cursor: 'pointer',
                fontSize: 10,
                transition: 'all .12s',
                boxShadow: view === n.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              }}
            >
              {n.icon}
            </button>
          ))}
        </div>

        {/* Life score badge */}
        <div
          style={{
            background: C.g0,
            borderRadius: 7,
            padding: '4px 11px',
            fontSize: 10,
            fontWeight: 700,
            color: C.navy2,
          }}
        >
          Score:{' '}
          <span style={{ color: activeNav.color }}>{lifeScore.toFixed(1)}</span>/10
        </div>
      </div>
    </div>
  );
}
