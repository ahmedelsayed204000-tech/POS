import React, { useState } from 'react';
import C from '../../constants/theme';
import { EXP_CATS } from '../../constants/nav';
import { Bar, Button, CardHeader, Input, Select, Label } from '../ui';
import { scoreFinance, netWorth } from '../../utils/scores';
import InvestmentPlan from './InvestmentPlan';

const money = (n, cur = 'EGP') => `${Number(n || 0).toLocaleString()} ${cur}`;

export default function Finance({ data, setData, dateContext }) {
  const { today: TODAY, monthPrefix: MOPFX } = dateContext;
  const [tab,       setTab]       = useState('ie');
  const [incForm,   setIncForm]   = useState({ date: TODAY, src: '', amt: '' });
  const [expForm,   setExpForm]   = useState({ date: TODAY, cat: 'Food & Groceries', sub: '', amt: '' });
  const [assetForm, setAssetForm] = useState({ name: '', cat: 'Cash',      value:  '' });
  const [liabForm,  setLiabForm]  = useState({ name: '', cat: 'Education', amount: '' });

  const cur    = data.settings?.currency   || 'EGP';
  const goalNW = data.settings?.goalNetWorth || 100000;
  const fin    = data.finance;

  const mIncome   = (fin.income    || []).filter(e => e.date.startsWith(MOPFX)).reduce((s, e) => s + e.amt, 0);
  const mExpenses = (fin.expenses  || []).filter(e => e.date.startsWith(MOPFX)).reduce((s, e) => s + e.amt, 0);
  const savings   = mIncome - mExpenses;
  const savingsR  = mIncome ? savings / mIncome * 100 : 0;
  const NW        = netWorth(fin);
  const totalA    = (fin.assets      || []).reduce((s, a) => s + a.value,  0);
  const totalL    = (fin.liabilities || []).reduce((s, l) => s + l.amount, 0);
  const nwPct     = Math.min(100, Math.max(0, NW / goalNW * 100));
  const history = [...(data.netWorthHistory || [])].slice(-12);

  // ── Income ────────────────────────────────────────────────────────────────
  const addIncome = () => {
    if (!incForm.amt) return;
    setData(p => ({ ...p, finance: { ...p.finance, income: [{ id: Date.now(), ...incForm, amt: parseFloat(incForm.amt) || 0 }, ...p.finance.income] } }));
    setIncForm(f => ({ ...f, src: '', amt: '' }));
  };
  const delIncome = (id) => setData(p => ({ ...p, finance: { ...p.finance, income: p.finance.income.filter(x => x.id !== id) } }));

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense = () => {
    if (!expForm.amt) return;
    setData(p => ({ ...p, finance: { ...p.finance, expenses: [{ id: Date.now(), ...expForm, amt: parseFloat(expForm.amt) || 0 }, ...p.finance.expenses] } }));
    setExpForm(f => ({ ...f, sub: '', amt: '' }));
  };
  const delExpense = (id) => setData(p => ({ ...p, finance: { ...p.finance, expenses: p.finance.expenses.filter(x => x.id !== id) } }));

  // ── Assets ────────────────────────────────────────────────────────────────
  const addAsset = () => {
    if (!assetForm.name || !assetForm.value) return;
    setData(p => ({ ...p, finance: { ...p.finance, assets: [...(p.finance.assets || []), { id: Date.now(), ...assetForm, value: parseFloat(assetForm.value) || 0 }] } }));
    setAssetForm({ name: '', cat: 'Cash', value: '' });
  };
  const delAsset = (id) => setData(p => ({ ...p, finance: { ...p.finance, assets: (p.finance.assets || []).filter(x => x.id !== id) } }));

  // ── Liabilities ───────────────────────────────────────────────────────────
  const addLiab = () => {
    if (!liabForm.name || !liabForm.amount) return;
    setData(p => ({ ...p, finance: { ...p.finance, liabilities: [...(p.finance.liabilities || []), { id: Date.now(), ...liabForm, amount: parseFloat(liabForm.amount) || 0 }] } }));
    setLiabForm({ name: '', cat: 'Education', amount: '' });
  };
  const delLiab = (id) => setData(p => ({ ...p, finance: { ...p.finance, liabilities: (p.finance.liabilities || []).filter(x => x.id !== id) } }));

  // ── Budget vs actual ──────────────────────────────────────────────────────
  const bgt       = fin.budget || {};
  const expByCat  = EXP_CATS.reduce((acc, c) => {
    acc[c] = (fin.expenses || []).filter(e => e.date.startsWith(MOPFX) && e.cat === c).reduce((s, e) => s + e.amt, 0);
    return acc;
  }, {});

  const TAB_BTN = (k, label) => (
    <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? C.navy2 : C.g0, color: tab === k ? '#fff' : C.g3, border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── SUMMARY ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { l: 'Monthly Income',   v: money(mIncome,  cur), c: C.green,                   bg: C.lgreen },
          { l: 'Monthly Expenses', v: money(mExpenses,cur), c: C.red,                     bg: C.lred   },
          { l: 'Net Savings',      v: money(savings,  cur), c: savings >= 0 ? C.blue : C.red, bg: C.lblue },
          { l: 'Net Worth',        v: money(NW,       cur), c: NW >= 0 ? C.green : C.red,    bg: NW >= 0 ? C.lgreen : C.lred },
        ].map(k => (
          <div key={k.l} style={{ background: k.bg, borderRadius: 10, padding: '11px 13px', borderLeft: `3px solid ${k.c}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: k.c, marginBottom: 2 }}>{k.l}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Sub-tab nav */}
      <div style={{ display: 'flex', gap: 7 }}>
        {TAB_BTN('ie',     '💰 Income & Expenses')}
        {TAB_BTN('budget', '📊 Budget vs Actual')}
        {TAB_BTN('nw',     '🏦 Net Worth Tracker')}
        {TAB_BTN('history', '📈 History')}
        {TAB_BTN('invest', '🎯 Investments')}
      </div>

      {/* ══════ TAB: INCOME & EXPENSES ══════ */}
      {tab === 'ie' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>

          {/* Income */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📈" title="INCOME" color={C.green} />
            <div style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                <div><Label>DATE</Label><Input type="date" value={incForm.date} onChange={e => setIncForm(x => ({ ...x, date: e.target.value }))} /></div>
                <div><Label>AMT ({cur})</Label><Input type="number" value={incForm.amt} onChange={e => setIncForm(x => ({ ...x, amt: e.target.value }))} placeholder="0" /></div>
              </div>
              <div><Label>SOURCE</Label><Input value={incForm.src} onChange={e => setIncForm(x => ({ ...x, src: e.target.value }))} placeholder="Salary, freelance…" /></div>
              <Button onClick={addIncome} color={C.green} full>Add Income</Button>
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {(fin.income || []).map((e, i) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 11px', background: i % 2 === 0 ? '#fff' : C.g0, fontSize: 10, alignItems: 'center', borderBottom: `1px solid ${C.g1}` }}>
                  <div><div style={{ fontWeight: 600 }}>{e.src}</div><div style={{ fontSize: 8, color: C.g3 }}>{e.date}</div></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: C.green }}>+{e.amt.toLocaleString()}</span>
                    <button onClick={() => delIncome(e.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 11 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📉" title="EXPENSES" color={C.red} />
            <div style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                <div><Label>DATE</Label><Input type="date" value={expForm.date} onChange={e => setExpForm(x => ({ ...x, date: e.target.value }))} /></div>
                <div><Label>AMT ({cur})</Label><Input type="number" value={expForm.amt} onChange={e => setExpForm(x => ({ ...x, amt: e.target.value }))} placeholder="0" /></div>
              </div>
              <div><Label>CATEGORY</Label><Select value={expForm.cat} onChange={e => setExpForm(x => ({ ...x, cat: e.target.value }))} options={EXP_CATS} /></div>
              <Button onClick={addExpense} color={C.red} full>Add Expense</Button>
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {(fin.expenses || []).map((e, i) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 11px', background: i % 2 === 0 ? '#fff' : C.g0, fontSize: 10, alignItems: 'center', borderBottom: `1px solid ${C.g1}` }}>
                  <div><div style={{ fontWeight: 600 }}>{e.cat}{e.sub ? ` · ${e.sub}` : ''}</div><div style={{ fontSize: 8, color: C.g3 }}>{e.date}</div></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: C.red }}>-{e.amt.toLocaleString()}</span>
                    <button onClick={() => delExpense(e.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 11 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB: BUDGET VS ACTUAL ══════ */}
      {tab === 'budget' && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
          <CardHeader icon="📊" title="BUDGET VS ACTUAL" color={C.navy2} />
          <div style={{ padding: 13 }}>
            {EXP_CATS.filter(c => bgt[c] || expByCat[c]).map(cat => {
              const act    = expByCat[cat] || 0;
              const budget = bgt[cat]       || 0;
              const pct    = budget ? Math.min(120, act / budget * 100) : 0;
              const over   = act > budget && budget > 0;
              return (
                <div key={cat} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{cat}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: over ? C.red : C.green }}>
                      {act.toLocaleString()}/{budget.toLocaleString()} {cur}{over ? ' ⚠️' : ''}
                    </span>
                  </div>
                  <Bar p={pct} color={over ? C.red : C.green} h={6} />
                </div>
              );
            })}
            {/* Summary */}
            <div style={{ marginTop: 10, padding: '8px 10px', background: C.g0, borderRadius: 7 }}>
              {[
                { l: 'Income',       v: `+${money(mIncome,  cur)}`, c: C.green },
                { l: 'Expenses',     v: `-${money(mExpenses, cur)}`, c: C.red   },
                { l: 'Net Savings',  v: money(savings, cur),        c: savings >= 0 ? C.blue : C.red },
                { l: 'Savings Rate', v: `${savingsR.toFixed(1)}%`,  c: savingsR >= 20 ? C.green : C.orange },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid ${C.g1}` }}>
                  <span style={{ fontSize: 9, color: C.g3 }}>{s.l}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: s.c }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}><CardHeader icon="📈" title="NET-WORTH HISTORY" color={C.green} /><div style={{ padding: 13 }}><div style={{ color: C.g3, fontSize: 10, marginBottom: 10 }}>One snapshot is saved per day. Your first comparison appears after the next day’s snapshot.</div>{history.length ? history.map((snapshot, index) => { const prior = history[index - 1]; const change = prior ? snapshot.netWorth - prior.netWorth : 0; return <div key={snapshot.date} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.g1}`, fontSize: 10 }}><b>{snapshot.date}</b><span>Assets {money(snapshot.assets, cur)}</span><span>Liabilities {money(snapshot.liabilities, cur)}</span><b style={{ color: change >= 0 ? C.green : C.red }}>{money(snapshot.netWorth, cur)} {prior ? `(${change >= 0 ? '+' : ''}${money(change, cur)})` : ''}</b></div>; }) : <div style={{ color: C.g2, fontSize: 11 }}>No snapshots yet.</div>}</div></div>}
      {tab === 'invest' && <InvestmentPlan data={data} setData={setData} />}

      {/* ══════ TAB: NET WORTH ══════ */}
      {tab === 'nw' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Assets */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📈" title="ASSETS" color={C.green} right={<span style={{ color: 'rgba(255,255,255,.6)', fontSize: 10 }}>{money(totalA, cur)}</span>} />
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                <Input value={assetForm.name}  onChange={e => setAssetForm(x => ({ ...x, name:  e.target.value }))} placeholder="Asset name" style={{ flex: 1, minWidth: 90 }} />
                <Select value={assetForm.cat}  onChange={e => setAssetForm(x => ({ ...x, cat:   e.target.value }))} options={['Cash', 'Investment', 'Property', 'Vehicle', 'Other']} style={{ width: 100 }} />
                <Input type="number" value={assetForm.value} onChange={e => setAssetForm(x => ({ ...x, value: e.target.value }))} placeholder="Value" style={{ width: 80 }} />
                <Button onClick={addAsset} color={C.green} small>+</Button>
              </div>
              {(fin.assets || []).map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', background: i % 2 === 0 ? '#fff' : C.g0, borderRadius: 5, marginBottom: 2 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700 }}>{a.name}</div>
                    <div style={{ fontSize: 8, color: C.g3 }}>{a.cat}</div>
                  </div>
                  <span style={{ fontWeight: 800, color: C.green, fontSize: 11 }}>{a.value.toLocaleString()}</span>
                  <button onClick={() => delAsset(a.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities + NW Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
              <CardHeader icon="📉" title="LIABILITIES" color={C.red} right={<span style={{ color: 'rgba(255,255,255,.6)', fontSize: 10 }}>{money(totalL, cur)}</span>} />
              <div style={{ padding: 10 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                  <Input value={liabForm.name}   onChange={e => setLiabForm(x => ({ ...x, name:   e.target.value }))} placeholder="Liability name" style={{ flex: 1, minWidth: 90 }} />
                  <Select value={liabForm.cat}   onChange={e => setLiabForm(x => ({ ...x, cat:    e.target.value }))} options={['Education', 'Mortgage', 'Credit', 'Car', 'Other']} style={{ width: 100 }} />
                  <Input type="number" value={liabForm.amount} onChange={e => setLiabForm(x => ({ ...x, amount: e.target.value }))} placeholder="Amount" style={{ width: 80 }} />
                  <Button onClick={addLiab} color={C.red} small>+</Button>
                </div>
                {(fin.liabilities || []).map((l, i) => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', background: i % 2 === 0 ? '#fff' : C.g0, borderRadius: 5, marginBottom: 2 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>{l.name}</div>
                      <div style={{ fontSize: 8, color: C.g3 }}>{l.cat}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: C.red, fontSize: 11 }}>{l.amount.toLocaleString()}</span>
                    <button onClick={() => delLiab(l.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 12 }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Worth summary card */}
            <div style={{ background: `linear-gradient(135deg,${C.navy2},${C.green})`, borderRadius: 11, padding: '16px 18px', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>NET WORTH</div>
              <div style={{ color: NW >= 0 ? '#fff' : C.lred, fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{money(NW, cur)}</div>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 9, marginTop: 3, marginBottom: 10 }}>
                Assets {totalA.toLocaleString()} − Liabilities {totalL.toLocaleString()}
              </div>
              <Bar p={nwPct} color={C.gold} h={8} />
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 9, marginTop: 5 }}>{nwPct.toFixed(0)}% of {money(goalNW, cur)} goal</div>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                Need {money(Math.max(0, goalNW - NW), cur)} more to reach goal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
