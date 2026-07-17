import React from 'react';
import C from '../../constants/theme';
import { Button, CardHeader, Input, Label, Select } from '../ui';

const profiles = {
  conservative: { label: 'Conservative', note: 'Prioritises capital stability and cash reserves.', targets: { Cash: 45, Bonds: 35, Equity: 15, Alternatives: 5 } },
  balanced: { label: 'Balanced', note: 'Balances near-term stability with long-term growth.', targets: { Cash: 20, Bonds: 25, Equity: 45, Alternatives: 10 } },
  growth: { label: 'Growth', note: 'Emphasises long-term growth and higher volatility.', targets: { Cash: 10, Bonds: 10, Equity: 70, Alternatives: 10 } },
};

export default function InvestmentPlan({ data, setData }) {
  const plan = data.investmentPlan || { profile: 'balanced', monthlyContribution: 0, targets: profiles.balanced.targets };
  const profile = profiles[plan.profile] || profiles.balanced;
  const investments = (data.finance.assets || []).filter((asset) => asset.cat === 'Investment');
  const total = investments.reduce((sum, asset) => sum + Number(asset.value || 0), 0);
  const update = (patch) => setData((previous) => ({ ...previous, investmentPlan: { ...plan, ...patch } }));
  const changeProfile = (key) => update({ profile: key, targets: profiles[key].targets });
  return <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}><CardHeader icon="📈" title="INVESTMENT PLAN" color={C.purple} /><div style={{ padding: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}><div><Label>RISK PROFILE</Label><Select value={plan.profile} onChange={(event) => changeProfile(event.target.value)} options={Object.entries(profiles).map(([value, item]) => ({ v: value, l: item.label }))} /><div style={{ fontSize: 10, color: C.g3, lineHeight: 1.5, marginTop: 7 }}>{profile.note} This is a planning preference, not investment advice.</div><div style={{ marginTop: 10 }}><Label>MONTHLY INVESTMENT CONTRIBUTION</Label><Input type="number" value={plan.monthlyContribution || ''} onChange={(event) => update({ monthlyContribution: Math.max(0, Number(event.target.value) || 0) })} /></div></div><div><div style={{ fontSize: 10, fontWeight: 800, color: C.g3, marginBottom: 7 }}>TARGET ALLOCATION</div>{Object.entries(plan.targets || {}).map(([assetClass, percentage]) => <div key={assetClass} style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 8, alignItems: 'center', marginBottom: 5 }}><span style={{ fontSize: 10 }}>{assetClass}</span><Input type="number" value={percentage} onChange={(event) => update({ targets: { ...plan.targets, [assetClass]: Math.max(0, Math.min(100, Number(event.target.value) || 0)) } })} style={{ padding: '4px 6px' }} /></div>)}<div style={{ fontSize: 9, color: C.g3, marginTop: 5 }}>Current investment assets: {total.toLocaleString()} · Target percentages should total 100%.</div></div></div></div>;
}
