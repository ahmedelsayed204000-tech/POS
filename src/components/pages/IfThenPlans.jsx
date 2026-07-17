import React, { useMemo, useState } from 'react';
import C from '../../constants/theme';
import { planSentence, suggestIfThenPlans } from '../../utils/ifThenPlans';
import { Button, CardHeader, Input, Label, Select } from '../ui';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const initialForm = { type: 'action', cue: '', response: '', taskId: null };

export default function IfThenPlans({ data, setData }) {
  const [form, setForm] = useState(initialForm);
  const plans = data.ifThenPlans || [];
  const suggestions = useMemo(() => suggestIfThenPlans(data.tasks || [], data.behaviorPreferences || {}), [data.tasks, data.behaviorPreferences]);
  const addEvent = (previous, event) => previous.behaviorPreferences?.consent?.behaviorEvents ? [...(previous.behaviorEvents || []), event] : (previous.behaviorEvents || []);
  const saveDraft = () => {
    if (!form.cue.trim() || !form.response.trim()) return;
    const now = new Date().toISOString();
    const id = globalThis.crypto?.randomUUID?.() || `plan-${Date.now()}`;
    const plan = { id, type: form.type, cue: form.cue.trim(), response: form.response.trim(), taskId: form.taskId || null, status: 'draft', confirmedAt: null, createdAt: now, updatedAt: now };
    setData((previous) => ({ ...previous, ifThenPlans: [plan, ...(previous.ifThenPlans || [])], behaviorEvents: addEvent(previous, { id: `${now}-plan-draft`, type: 'if_then_plan_created', occurredAt: now, entityType: 'ifThenPlan', entityId: id, metadata: { planType: plan.type } }) }));
    setForm(initialForm);
  };
  const confirm = (plan) => {
    const now = new Date().toISOString();
    setData((previous) => ({ ...previous, ifThenPlans: (previous.ifThenPlans || []).map((item) => item.id === plan.id ? { ...item, status: 'active', confirmedAt: now, updatedAt: now } : item), behaviorEvents: addEvent(previous, { id: `${now}-plan-confirmed`, type: 'if_then_plan_confirmed', occurredAt: now, entityType: 'ifThenPlan', entityId: plan.id, metadata: {} }) }));
  };
  const remove = (id) => setData((previous) => ({ ...previous, ifThenPlans: (previous.ifThenPlans || []).filter((plan) => plan.id !== id) }));
  const useSuggestion = (suggestion) => setForm({ ...suggestion });

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) 340px', gap: 12, alignItems: 'start' }}><div style={{ display: 'grid', gap: 12 }}>
    <div style={card}><CardHeader icon="✨" title="EDITABLE SUGGESTIONS" color={C.purple} /><div style={{ padding: 13, display: 'grid', gap: 8 }}>{suggestions.map((suggestion, index) => <div key={`${suggestion.type}-${suggestion.taskId}-${index}`} style={{ border: `1px solid ${C.g1}`, borderRadius: 8, padding: 10 }}><div style={{ fontSize: 10, lineHeight: 1.5 }}>{planSentence(suggestion)}</div><Button onClick={() => useSuggestion(suggestion)} color={C.purple} small outline>Use and edit</Button></div>)}{!suggestions.length && <div style={{ color: C.g3, fontSize: 10 }}>Add an open task to receive an editable schedule-based suggestion.</div>}</div></div>
    {plans.map((plan) => <div key={plan.id} style={card}><CardHeader icon={plan.type === 'action' ? '→' : '↪'} title={`${plan.type.toUpperCase()} PLAN · ${plan.status.toUpperCase()}`} color={plan.status === 'active' ? C.green : C.orange} /><div style={{ padding: 13, display: 'grid', gap: 9 }}><div style={{ fontSize: 12, lineHeight: 1.6 }}>{planSentence(plan)}</div>{plan.status === 'draft' && <div style={{ background: C.lblue, color: C.blue, borderRadius: 8, padding: 9, fontSize: 10 }}>Read the sentence once. Confirm only if this is the response you genuinely choose.</div>}<div style={{ display: 'flex', gap: 6 }}>{plan.status === 'draft' && <Button onClick={() => confirm(plan)} color={C.green} small>I choose this plan</Button>}<Button onClick={() => remove(plan.id)} color={C.red} small outline>Remove</Button></div></div></div>)}
  </div><div style={card}><CardHeader icon="＋" title="CREATE IF–THEN PLAN" color={C.navy2} /><div style={{ padding: 13, display: 'grid', gap: 9 }}><div><Label>PLAN TYPE</Label><Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} options={[{ v: 'action', l: 'Action plan' }, { v: 'coping', l: 'Coping plan' }]} /></div><div><Label>{form.type === 'action' ? 'WHEN THIS SITUATION OCCURS' : 'IF THIS OBSTACLE APPEARS'}</Label><Input value={form.cue} onChange={(event) => setForm({ ...form, cue: event.target.value })} placeholder={form.type === 'action' ? 'When I sit at my desk at 9:00' : 'If I want to check social media'} /></div><div><Label>THEN I WILL</Label><Input value={form.response} onChange={(event) => setForm({ ...form, response: event.target.value })} placeholder="Open the proposal and work for ten minutes" /></div>{form.cue && form.response && <div style={{ background: C.lblue, borderRadius: 8, padding: 9, color: C.blue, fontSize: 10, lineHeight: 1.5 }}>{planSentence(form)}</div>}<Button onClick={saveDraft} color={C.navy2} full>Save as draft</Button></div></div></div>;
}
