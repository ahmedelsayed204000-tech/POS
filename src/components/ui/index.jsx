// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
// Import individual components:
//   import { Bar, Button, Input, ... } from '../ui';

import React, { useState, useRef, useEffect } from 'react';
import C from '../../constants/theme';

// ─── BAR ──────────────────────────────────────────────────────────────────────
export const Bar = ({ p, color = C.green, h = 6 }) => (
  <div style={{ background: C.g1, borderRadius: 99, height: h, overflow: 'hidden' }}>
    <div
      style={{
        background: color,
        width: `${Math.min(100, Math.max(0, p))}%`,
        height: '100%',
        borderRadius: 99,
        transition: 'width .35s ease',
      }}
    />
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  onClick,
  color    = C.navy2,
  small    = false,
  outline  = false,
  full     = false,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: outline ? 'transparent' : disabled ? '#E8ECF2' : color,
      color:      outline ? color         : disabled ? C.g2      : color === C.gold ? C.dark : '#fff',
      border:     `1.5px solid ${disabled ? '#E8ECF2' : color}`,
      borderRadius: 7,
      padding:    small ? '4px 12px' : '8px 18px',
      fontWeight: 700,
      fontSize:   small ? 11 : 12,
      cursor:     disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      width:      full ? '100%' : 'auto',
      transition: 'all .15s',
    }}
  >
    {children}
  </button>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ value, onChange, placeholder = '', type = 'text', style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      border: `1.5px solid ${C.border}`,
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      ...style,
    }}
  />
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ value, onChange, options, style = {} }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      border: `1.5px solid ${C.border}`,
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 12,
      fontFamily: 'inherit',
      background: '#fff',
      cursor: 'pointer',
      outline: 'none',
      ...style,
    }}
  >
    {options.map((o) => (
      <option key={o.v ?? o} value={o.v ?? o}>
        {o.l ?? o}
      </option>
    ))}
  </select>
);

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
export const Textarea = ({ value, onChange, placeholder = '', rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      border: `1.5px solid ${C.border}`,
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      lineHeight: 1.5,
    }}
  />
);

// ─── PILL ─────────────────────────────────────────────────────────────────────
export const Pill = ({ text, color = C.blue }) => (
  <span
    style={{
      background: color + '22',
      color,
      borderRadius: 5,
      padding: '2px 8px',
      fontWeight: 700,
      fontSize: 10,
      flexShrink: 0,
    }}
  >
    {text}
  </span>
);

// ─── LABEL ────────────────────────────────────────────────────────────────────
export const Label = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: C.g3, marginBottom: 3, letterSpacing: 0.3 }}>
    {children}
  </div>
);

// ─── CARD HEADER ──────────────────────────────────────────────────────────────
export const CardHeader = ({ icon, title, right, color = C.navy2 }) => (
  <div
    style={{
      background: color,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ color: color === C.gold ? C.dark : '#fff', fontWeight: 700, fontSize: 12 }}>{title}</span>
    </div>
    {right && <div>{right}</div>}
  </div>
);

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${C.g1}`,
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 11,
        boxShadow: '0 2px 8px rgba(0,0,0,.1)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
};

// ─── EDIT TEXT (double-click inline edit) ─────────────────────────────────────
export const EditText = ({ value, onSave, style = {}, placeholder = '' }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const ref                   = useRef();

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { onSave(val); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSave(val); setEditing(false); }
        }}
        style={{
          border: `1.5px solid ${C.blue}`,
          borderRadius: 5,
          padding: '2px 6px',
          fontSize: 11,
          fontFamily: 'inherit',
          outline: 'none',
          ...style,
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => { setVal(value); setEditing(true); }}
      title="Double-click to edit"
      style={{ cursor: 'pointer', ...style }}
    >
      {value || <span style={{ color: C.g2, fontStyle: 'italic' }}>{placeholder}</span>}
    </span>
  );
};
