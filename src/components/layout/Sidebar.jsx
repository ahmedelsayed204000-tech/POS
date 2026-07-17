import React from 'react';
import C from '../../constants/theme';
import { Bar } from '../ui';
import NAV from '../../constants/nav';

export default function Sidebar({ view, setView, lifeScore, userName, slim, setSlim }) {
  return (
    <div
      className="app-sidebar"
      style={{
        width: slim ? 56 : 212,
        background: C.navy,
        transition: 'width .2s ease',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: slim ? '11px 7px' : '12px 13px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
        }}
      >
        {slim ? (
          <div style={{ color: C.gold, fontWeight: 900, fontSize: 16, textAlign: 'center' }}>⚡</div>
        ) : (
          <div>
            <div style={{ color: C.gold, fontWeight: 800, fontSize: 12, letterSpacing: 0.5 }}>
              PERSONAL OS
            </div>
            <div style={{ color: '#2D4A66', fontSize: 9, marginTop: 1 }}>
              {userName} · {new Date().getFullYear()} · ✔ FINAL
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, paddingTop: 3, overflowY: 'auto' }}>
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: slim ? '9px 0' : '7px 10px',
                background: active ? 'rgba(255,255,255,.09)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderLeft: `3px solid ${active ? n.color : 'transparent'}`,
                transition: 'all .12s',
                justifyContent: slim ? 'center' : 'flex-start',
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{n.icon}</span>
              {!slim && (
                <span
                  style={{
                    color: active ? '#fff' : '#4A6080',
                    fontWeight: active ? 700 : 400,
                    fontSize: 11,
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {n.label}
                </span>
              )}
              {!slim && active && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: n.color }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Life Score card */}
      {!slim && (
        <div
          style={{
            margin: '6px 8px',
            background: 'rgba(196,163,90,.1)',
            borderRadius: 8,
            padding: '8px 10px',
            border: '1px solid rgba(196,163,90,.1)',
          }}
        >
          <div style={{ color: C.gold, fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>
            LIFE SCORE
          </div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, lineHeight: 1, marginTop: 1 }}>
            {lifeScore.toFixed(1)}
          </div>
          <div style={{ marginTop: 4 }}>
            <Bar p={lifeScore * 10} color={C.gold} h={3} />
          </div>
          <div style={{ color: '#2D4A66', fontSize: 8, marginTop: 2 }}>
            out of 10 · target ≥ 8.0
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setSlim((s) => !s)}
        style={{
          background: 'rgba(255,255,255,.04)',
          border: 'none',
          color: '#2D4A66',
          cursor: 'pointer',
          padding: 7,
          fontSize: 11,
          fontFamily: 'inherit',
        }}
      >
        {slim ? '▶' : '◀ Collapse'}
      </button>
    </div>
  );
}
