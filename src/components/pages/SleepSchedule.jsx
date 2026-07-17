import React from 'react';
import C from '../../constants/theme';
import { CardHeader } from '../ui';
import { getSleepSchedule } from '../../utils/sleepSchedule';

const colors = { recovery: C.red, lighter: C.orange, ready: C.green, unknown: C.g3 };
export default function SleepSchedule({ data }) {
  const guidance = getSleepSchedule(data.health?.records?.[0], data.automations || {}); const color = colors[guidance.level];
  return <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}><CardHeader icon="😴" title="SLEEP-AWARE SCHEDULE" color={color} /><div style={{ padding: 13 }}><div style={{ color, fontWeight: 800, fontSize: 13 }}>{guidance.title}</div><div style={{ color: C.g3, fontSize: 11, lineHeight: 1.55, marginTop: 5 }}>{guidance.message}</div><div style={{ marginTop: 8, fontSize: 10 }}><b>Suggested focus start:</b> {guidance.focusStart}{guidance.reminder ? ` · ${guidance.reminder}` : ''}</div></div></div>;
}
