import React, { useMemo, useState } from 'react';
import './website.css';

const modules = {
  planning: { icon: 'calendar_month', eyebrow: 'DAILY COMMAND CENTER', title: 'Turn priorities into a day you can actually finish.', copy: 'Shape today, this week and this month around your available time, sleep and energy.', stats: [['3', 'priority outcomes'], ['6.5h', 'focus capacity'], ['82%', 'plan confidence']], color: '#e6f4ec' },
  finance: { icon: 'account_balance_wallet', eyebrow: 'MONEY GROWTH', title: 'See your cash flow—and give every surplus a job.', copy: 'Connect income, spending, balance sheets, savings goals and investment allocations in one calm view.', stats: [['24.8k', 'net worth'], ['43%', 'savings rate'], ['3', 'investment goals']], color: '#f4ecd6' },
  sports: { icon: 'sports_soccer', eyebrow: 'ATHLETE CENTER', title: 'Train smarter across any sport.', copy: 'Plan sessions, monitor intensity, log food and hydration, and bring wearable metrics into the same timeline.', stats: [['4', 'weekly sessions'], ['320', 'training minutes'], ['7.6', 'readiness']], color: '#e1f1f1' },
  career: { icon: 'work', eyebrow: 'WORK & CAREER', title: 'Make shifts, study and career growth work together.', copy: 'Track working hours, courses, certifications, postgraduate study and every opportunity in your pipeline.', stats: [['40h', 'weekly target'], ['2', 'active courses'], ['4', 'open opportunities']], color: '#eee8f5' },
};

const assistantPlans = {
  week: { title: 'A balanced week', steps: ['Protect two 90-minute deep-work blocks', 'Schedule four training sessions around your energy', 'Complete one money review on Friday'] },
  habit: { title: 'A gentle reset plan', steps: ['Name the trigger and remove one source of friction', 'Replace the urge with a two-minute action', 'Review wins after seven days—not every setback'] },
  balance: { title: 'Work and training balance', steps: ['Keep intense sessions away from night shifts', 'Use recovery days for study and mobility', 'Batch meal preparation before your busiest workday'] },
};

export default function Website({ onLaunch }) {
  const [activeModule, setActiveModule] = useState('planning');
  const [habits, setHabits] = useState(65);
  const [sleep, setSleep] = useState(7.2);
  const [savings, setSavings] = useState(28);
  const [assistant, setAssistant] = useState('week');
  const score = useMemo(() => Math.min(10, ((habits / 100) * 4 + (sleep / 8) * 3 + (Math.min(savings, 50) / 50) * 3)).toFixed(1), [habits, sleep, savings]);
  const module = modules[activeModule];
  const plan = assistantPlans[assistant];

  return <div className="pos-site">
    <header className="site-header">
      <a href="#top" className="site-brand" aria-label="PersonalOS home"><span className="material-symbols-rounded">psychiatry</span><span><b>Life Garden</b><small>PersonalOS</small></span></a>
      <nav aria-label="Website navigation"><a href="#system">The system</a><a href="#demo">Live demo</a><a href="#assistant">Assistant</a></nav>
      <button className="site-launch compact" onClick={onLaunch}>Open your OS <span className="material-symbols-rounded">arrow_forward</span></button>
    </header>

    <main id="top">
      <section className="site-hero">
        <div className="site-hero-copy">
          <span className="site-kicker"><i /> YOUR LIFE, WORKING TOGETHER</span>
          <h1>Grow the life you’re already building.</h1>
          <p>PersonalOS brings your daily plan, habits, money, health, sports, work and learning into one adaptive command center.</p>
          <div className="site-hero-actions"><button className="site-launch" onClick={onLaunch}>Enter PersonalOS <span className="material-symbols-rounded">arrow_forward</span></button><a href="#demo">Try the live demo <span className="material-symbols-rounded">south</span></a></div>
          <div className="site-trust"><span><i className="material-symbols-rounded">lock</i> Private by design</span><span><i className="material-symbols-rounded">cloud_done</i> Local + cloud backup</span><span><i className="material-symbols-rounded">devices</i> Works on every screen</span></div>
        </div>
        <div className="site-hero-visual" aria-label="PersonalOS life garden preview">
          <div className="site-score-orbit"><small>LIFE SCORE</small><strong>{score}</strong><span>/10</span></div>
          <img src="/life-garden-hero.png" alt="A growing tree representing a balanced personal operating system" />
          <div className="site-float-card habits"><span className="material-symbols-rounded">routine</span><b>Habits</b><strong>{habits}%</strong></div>
          <div className="site-float-card money"><span className="material-symbols-rounded">savings</span><b>Money</b><strong>{savings}%</strong></div>
          <div className="site-float-card energy"><span className="material-symbols-rounded">ecg_heart</span><b>Sleep</b><strong>{sleep}h</strong></div>
        </div>
      </section>

      <section className="site-section" id="system">
        <div className="site-section-head"><span>ONE CONNECTED SYSTEM</span><h2>Every important part of life finally speaks the same language.</h2><p>Choose a workspace to see what PersonalOS brings together.</p></div>
        <div className="site-module-tabs" role="tablist" aria-label="PersonalOS modules">{Object.entries(modules).map(([key, item]) => <button key={key} role="tab" aria-selected={activeModule === key} className={activeModule === key ? 'active' : ''} onClick={() => setActiveModule(key)}><span className="material-symbols-rounded">{item.icon}</span>{key[0].toUpperCase() + key.slice(1)}</button>)}</div>
        <div className="site-module-panel" style={{ '--module-bg': module.color }}>
          <div><span className="module-icon material-symbols-rounded">{module.icon}</span><small>{module.eyebrow}</small><h3>{module.title}</h3><p>{module.copy}</p><button onClick={onLaunch}>Explore in the app <span className="material-symbols-rounded">arrow_forward</span></button></div>
          <div className="module-preview">{module.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span><i><b style={{ width: `${45 + value.length * 8}%` }} /></i></div>)}</div>
        </div>
      </section>

      <section className="site-demo" id="demo">
        <div className="site-section-head light"><span>INTERACTIVE LIFE CHECK</span><h2>See how small changes compound.</h2><p>Move the sliders. Your score responds as habits, recovery and money improve together.</p></div>
        <div className="site-demo-grid">
          <div className="site-controls">
            <ScoreControl label="Habit consistency" value={habits} min="0" max="100" suffix="%" onChange={setHabits} />
            <ScoreControl label="Average sleep" value={sleep} min="4" max="9" step="0.1" suffix=" hours" onChange={setSleep} />
            <ScoreControl label="Savings rate" value={savings} min="0" max="50" suffix="%" onChange={setSavings} />
          </div>
          <div className="site-live-score"><span>Your connected score</span><strong>{score}</strong><small>/10</small><div className="score-ring" style={{ '--score': `${Number(score) * 10}%` }}><i /></div><p>{score >= 8 ? 'You have a strong, sustainable rhythm.' : score >= 6 ? 'You’re building momentum—protect your next small win.' : 'Start gently. One repeatable action can change the direction.'}</p></div>
        </div>
      </section>

      <section className="site-assistant" id="assistant">
        <div className="assistant-copy"><span>PERSONAL PLANNING ASSISTANT</span><h2>Ask for direction.<br />Get a plan that fits real life.</h2><p>The assistant can balance daily, weekly and monthly priorities around work shifts, training, sleep and financial goals.</p><div className="assistant-prompts">{[['week','Plan my week'],['habit','Help me break a bad habit'],['balance','Balance work and training']].map(([key,label]) => <button key={key} className={assistant === key ? 'active' : ''} onClick={() => setAssistant(key)}>{label}</button>)}</div></div>
        <div className="assistant-card"><div className="assistant-top"><span className="material-symbols-rounded">auto_awesome</span><div><small>YOUR ASSISTANT</small><b>{plan.title}</b></div><i>Ready</i></div><ol>{plan.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol><button onClick={onLaunch}>Build this plan in PersonalOS <span className="material-symbols-rounded">arrow_forward</span></button></div>
      </section>

      <section className="site-cta"><span className="material-symbols-rounded">psychiatry</span><h2>Your next chapter needs one clear system.</h2><p>Start with today. PersonalOS will help you connect the rest.</p><button className="site-launch" onClick={onLaunch}>Open your PersonalOS <span className="material-symbols-rounded">arrow_forward</span></button></section>
    </main>
    <footer><div className="site-brand"><span className="material-symbols-rounded">psychiatry</span><span><b>Life Garden</b><small>PersonalOS</small></span></div><p>Plan gently. Track what matters. Grow deliberately.</p><span>© {new Date().getFullYear()} PersonalOS</span></footer>
  </div>;
}

function ScoreControl({ label, value, suffix, onChange, ...props }) {
  return <label className="score-control"><span>{label}<strong>{value}{suffix}</strong></span><input type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} {...props} /></label>;
}
