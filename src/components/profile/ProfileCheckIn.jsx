import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LIFE_DIMENSIONS } from '../../utils/personalScore';

const QUESTIONS = ['What matters most now?', 'Which areas should your Garden show?', 'What habit style fits your life?', 'What capacity do you have right now?', 'How should coaching feel?'];
const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ProfileCheckIn({ data, setData, onClose }) {
  const current = data.personalization;
  const [form, setForm] = useState(current);
  const dialogRef = useRef(null);
  const openerRef = useRef(document.activeElement);
  const totalWeight = useMemo(() => form.activeDimensions.reduce((sum, key) => sum + Number(form.scoreWeights[key] || 0), 0), [form]);

  useEffect(() => {
    const firstInput = dialogRef.current?.querySelector(focusableSelector);
    firstInput?.focus();
    return () => openerRef.current?.focus?.();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll(focusableSelector) || [])].filter((item) => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const toggleDimension = (key) => setForm((previous) => {
    const active = previous.activeDimensions.includes(key) ? previous.activeDimensions.filter((item) => item !== key) : [...previous.activeDimensions, key];
    return active.length ? { ...previous, activeDimensions: active } : previous;
  });

  const save = () => {
    setData((previous) => ({ ...previous, personalization: { ...form, completed: true, updatedAt: new Date().toISOString() }, behaviorPreferences: { ...previous.behaviorPreferences, coachingTone: form.coachingTone } }));
    onClose();
  };

  return <div className="ux-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="ux-profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" ref={dialogRef} onKeyDown={handleKeyDown}>
      <header>
        <div>
          <small>YOUR GARDEN - FIVE QUESTIONS</small>
          <h2 id="profile-title">Make PersonalOS fit your life.</h2>
          <p>Optional, editable, and used only to personalize your system.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close profile check-in"><span className="material-symbols-rounded">close</span></button>
      </header>

      <div className="ux-question">
        <b>1. {QUESTIONS[0]}</b>
        <input aria-label="Primary priority" value={form.primaryPriority} onChange={(event) => setForm({ ...form, primaryPriority: event.target.value })} placeholder="Build energy, finish a project, reconnect..." />
        <textarea aria-label="Success definition" value={form.successDefinition} onChange={(event) => setForm({ ...form, successDefinition: event.target.value })} placeholder="What does progress look like for you?" />
      </div>

      <div className="ux-question">
        <b>2. {QUESTIONS[1]}</b>
        <div className="ux-choice-grid">
          {Object.entries(LIFE_DIMENSIONS).map(([key, item]) => {
            const selected = form.activeDimensions.includes(key);
            return <button type="button" key={key} className={selected ? 'selected' : ''} aria-pressed={selected} onClick={() => toggleDimension(key)}><span className="material-symbols-rounded">{item.icon}</span>{item.label}</button>;
          })}
        </div>
      </div>

      <div className="ux-question">
        <b>3. {QUESTIONS[2]}</b>
        <div className="ux-segmented">{['gentle', 'balanced', 'structured'].map((value) => <button type="button" key={value} className={form.habitStyle === value ? 'selected' : ''} aria-pressed={form.habitStyle === value} onClick={() => setForm({ ...form, habitStyle: value })}>{value}</button>)}</div>
      </div>

      <div className="ux-question">
        <b>4. {QUESTIONS[3]}</b>
        <div className="ux-segmented">{['light', 'moderate', 'full'].map((value) => <button type="button" key={value} className={form.capacity === value ? 'selected' : ''} aria-pressed={form.capacity === value} onClick={() => setForm({ ...form, capacity: value })}>{value}</button>)}</div>
      </div>

      <div className="ux-question">
        <b>5. {QUESTIONS[4]}</b>
        <div className="ux-segmented">{['gentle', 'supportive', 'direct'].map((value) => <button type="button" key={value} className={form.coachingTone === value ? 'selected' : ''} aria-pressed={form.coachingTone === value} onClick={() => setForm({ ...form, coachingTone: value })}>{value}</button>)}</div>
      </div>

      <details>
        <summary>Adjust score weights <span>{totalWeight} relative points</span></summary>
        <p className="ux-weight-note">Weights show relative importance. They are normalized automatically, so they do not need to total 100.</p>
        {form.activeDimensions.map((key) => <label className="ux-weight" key={key}><span>{LIFE_DIMENSIONS[key].label}</span><input type="range" min="0" max="100" value={form.scoreWeights[key] || 0} onChange={(event) => setForm({ ...form, scoreWeights: { ...form.scoreWeights, [key]: Number(event.target.value) } })} /><b>{form.scoreWeights[key] || 0}</b></label>)}
      </details>

      <footer><button type="button" className="secondary" onClick={onClose}>Not now</button><button type="button" className="primary" onClick={save}>Save my Garden</button></footer>
    </section>
  </div>;
}
