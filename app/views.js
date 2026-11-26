// DompetRumah — the pages. Dashboard, Planner, Goals and Guide, built
// from data.js through charts.js. The Planner, the expense log and the
// calculators keep their working state in this module and recompute on
// every keystroke: every control on the site does what it says.

import { ACTUALS, ACTUALS_AS_OF, BENCHMARKS, BILLS, CASHFLOW, CATEGORIES, DAYS_LEFT, EXPENSES, GOALS, GUIDE_RANGES, HOUSEHOLD, WARNING_SIGNS } from './data.js';
import { actualBars, cashflowChart, donut, esc, progress, rp, rpShort, splitMeter } from './charts.js';

const incomeOf = (earners) => earners.reduce((a, e) => a + e.amount, 0);
const totalIncome = incomeOf(HOUSEHOLD.earners);
const catTotal = CATEGORIES.reduce((a, c) => a + c.amount, 0);
const groupTotal = (g) => CATEGORIES.filter((c) => c.group === g).reduce((a, c) => a + c.amount, 0);
const GROUP_NAMES = { needs: 'Needs', wants: 'Wants', future: 'Future' };
const catName = (id) => (CATEGORIES.find((c) => c.id === id) || { name: id }).name;

// The expense tracker's working copy: starts as the household's actuals
// and the expenses they have written down, and grows while you use it.
const actuals = Object.fromEntries(ACTUALS.map((a) => [a.id, a.spent]));
const expenses = EXPENSES.map((e) => ({ ...e }));

/* ---------------- Dashboard ---------------- */

function actualsSummary() {
  const spent = Object.values(actuals).reduce((a, v) => a + v, 0);
  const over = CATEGORIES.filter((c) => actuals[c.id] > c.amount);
  return { spent, left: totalIncome - spent, over };
}

function actualsBody() {
  const s = actualsSummary();
  const rows = CATEGORIES.map((c) => ({ name: c.name, budget: c.amount, spent: actuals[c.id] || 0 }));
  const log = expenses
    .map(
      (e) => `<li><span class="exp-date">${esc(e.date)}</span><span class="exp-note">${esc(e.note)}</span><span class="exp-cat">${esc(catName(e.category))}</span><b>${rp(e.amount)}</b></li>`,
    )
    .join('');
  return `
  <div class="actuals-summary">
    <div class="sum-cell"><span>Spent so far</span><b>${rp(s.spent)}</b></div>
    <div class="sum-cell ${s.left < 0 ? 'bad' : 'good'}"><span>${s.left < 0 ? 'Over the month' : 'Still unspent'}</span><b>${rp(Math.abs(s.left))}</b></div>
    <div class="sum-cell"><span>Lines over budget</span><b>${s.over.length} of ${CATEGORIES.length}</b></div>
  </div>
  ${actualBars(rows)}
  <p class="note" id="actuals-note">${s.over.length
    ? `${s.over.map((c) => `${esc(c.name)} is over by ${rp(actuals[c.id] - c.amount)}`).join(' and ')}. The money has to come from somewhere — groceries still hold ${rp(CATEGORIES.find((c) => c.id === 'groceries').amount - actuals.groceries)}.`
    : 'Every line is still inside its budget.'}
  ${DAYS_LEFT} days left in the month. Log an expense below and this panel updates at once.</p>
  <h3 class="subhead">Log an expense</h3>
  <form class="expense-form" id="expense-form">
    <label class="ctl">Category
      <select id="exp-cat">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
    <label class="ctl">Amount (Rp)
      <input type="number" min="1" step="1000" id="exp-amt" placeholder="50000" required></label>
    <label class="ctl grow">What was it?
      <input type="text" id="exp-note" placeholder="e.g. Pasar: beras dan ayam" maxlength="80" required></label>
    <button type="submit" class="btn">Catat</button>
  </form>
  <p class="form-msg" id="exp-msg" role="status"></p>
  <h3 class="subhead">Recently written down</h3>
  <ul class="expense-log" id="expense-log">${log}</ul>
  <p class="more"><button type="button" class="linkbtn" id="actuals-reset">Back to the household's example figures</button></p>`;
}

export function dashboardPage() {
  const future = groupTotal('future');
  const billsPaid = BILLS.filter((b) => b.paid);
  const donutParts = CATEGORIES.map((c) => ({ name: c.name, value: c.amount }));
  const goalCards = GOALS.map(
    (g) => `<article class="goal-mini">
  <div class="goal-name">${esc(g.name)}</div>
  ${progress(g.saved, g.target)}
</article>`,
  ).join('');
  const billRows = BILLS.map(
    (b, i) => `<li class="bill">
  <label><input type="checkbox" data-bill="${i}" ${b.paid ? 'checked' : ''}>
  <span class="bill-name">${esc(b.name)}</span></label>
  <span class="bill-due">due ${esc(b.due)}</span>
  <span class="bill-amt">${rp(b.amount)}</span>
</li>`,
  ).join('');
  return `
<section class="hero">
  <p class="eyebrow">Household budget · Jakarta</p>
  <h1>${esc(HOUSEHOLD.name)}</h1>
  <p class="lede">${esc(HOUSEHOLD.members)}. Two incomes, eleven budget lines, one rule:
  savings move out on payday, before anything else is spent. This is their month, in full.</p>
</section>
<section class="kpi-grid">
  <article class="kpi"><div class="kpi-label">Money in</div>
    <div class="kpi-value">${rp(totalIncome)}</div>
    <div class="kpi-note">${HOUSEHOLD.earners.map((e) => `${esc(e.who.split('—')[0].trim())} ${rpShort(e.amount)}`).join(' · ')}</div></article>
  <article class="kpi"><div class="kpi-label">Planned spending</div>
    <div class="kpi-value">${rp(catTotal - future)}</div>
    <div class="kpi-note">Needs ${rpShort(groupTotal('needs'))} · wants ${rpShort(groupTotal('wants'))}</div></article>
  <article class="kpi"><div class="kpi-label">Toward the future</div>
    <div class="kpi-value">${((future / totalIncome) * 100).toFixed(1)}%</div>
    <div class="kpi-note">${rp(future)} to savings and the cicilan, every month</div></article>
  <article class="kpi"><div class="kpi-label">Left unassigned</div>
    <div class="kpi-value">${rp(totalIncome - catTotal)}</div>
    <div class="kpi-note">Every rupiah has a job — the plan balances exactly</div></article>
</section>
<div class="cols">
  <section class="panel">
    <header class="panel-head"><h2>Where the money goes</h2><span class="src">The monthly plan</span></header>
    ${donut(donutParts, rpShort(totalIncome), 'per month')}
    ${splitMeter(groupTotal('needs'), groupTotal('wants'), future)}
    <p class="note">Needs run to 76% — far above the 50% rule of thumb. That is Jakarta, not
    carelessness: BPS puts average spending at Rp1.57 million per person, so four people
    need about Rp6.28 million before a single rupiah is saved.</p>
  </section>
  <section class="panel">
    <header class="panel-head"><h2>This month's bills</h2><span class="src" id="bill-count"></span></header>
    <ul class="bills">${billRows}</ul>
    <p class="note" id="bill-note"></p>
    <h3 class="subhead">Savings goals</h3>
    <div class="goal-minis">${goalCards}</div>
    <p class="more"><a href="#/goals">The goals, with calculators &rarr;</a></p>
  </section>
</div>
<section class="panel" id="actuals-panel">
  <header class="panel-head"><h2>Spent so far vs the budget</h2><span class="src">As of ${esc(ACTUALS_AS_OF)}</span></header>
  <div id="actuals-body">${actualsBody()}</div>
</section>
<section class="panel">
  <header class="panel-head"><h2>Six months of cash flow</h2><span class="src">July – December 2026</span></header>
  ${cashflowChart(CASHFLOW)}
  <p class="note">December's bonus lands in income and the holiday lands in spending. Across the
  six months the household kept Rp1.359.380 — the emergency fund growing quietly in the background.</p>
</section>
<p class="fineprint">DompetRumah is a worked example with real arithmetic: change any figure in the
<a href="#/planner">Planner</a> and the whole plan rebalances. Benchmarks in the <a href="#/guide">Guide</a>
are BPS figures, so you can judge this household against the country.</p>`;
}

export function mountDashboard() {
  const boxes = document.querySelectorAll('[data-bill]');
  const count = document.getElementById('bill-count');
  const note = document.getElementById('bill-note');
  if (boxes.length && count && note) {
    const apply = () => {
      let paid = 0;
      let paidAmt = 0;
      let dueAmt = 0;
      boxes.forEach((box) => {
        const bill = BILLS[Number(box.dataset.bill)];
        if (box.checked) { paid += 1; paidAmt += bill.amount; } else { dueAmt += bill.amount; }
        box.closest('.bill').classList.toggle('is-paid', box.checked);
      });
      count.textContent = `${paid} of ${BILLS.length} paid`;
      note.textContent = paid === BILLS.length
        ? `All ${BILLS.length} bills settled: ${rp(paidAmt)} out the door.`
        : `${rp(paidAmt)} settled so far; ${rp(dueAmt)} still to go out this month. Tick a bill as you pay it.`;
    };
    boxes.forEach((box) => box.addEventListener('change', apply));
    apply();
  }
  const body = document.getElementById('actuals-body');
  if (!body) return;
  const redraw = () => { body.innerHTML = actualsBody(); wireActuals(); };
  const wireActuals = () => {
    const form = document.getElementById('expense-form');
    if (form) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const cat = document.getElementById('exp-cat').value;
        const amt = Math.floor(Number(document.getElementById('exp-amt').value) || 0);
        const noteText = document.getElementById('exp-note').value.trim();
        const msg = document.getElementById('exp-msg');
        if (amt <= 0 || !noteText) {
          if (msg) msg.textContent = 'Fill in an amount above zero and say what it was.';
          return;
        }
        actuals[cat] = (actuals[cat] || 0) + amt;
        expenses.unshift({ date: 'Today', category: cat, note: noteText, amount: amt });
        redraw();
        const fresh = document.getElementById('exp-msg');
        if (fresh) fresh.textContent = `${rp(amt)} added to ${catName(cat)} — the bars above moved.`;
      });
    }
    const reset = document.getElementById('actuals-reset');
    if (reset) {
      reset.addEventListener('click', () => {
        ACTUALS.forEach((a) => { actuals[a.id] = a.spent; });
        expenses.length = 0;
        EXPENSES.forEach((e) => expenses.push({ ...e }));
        redraw();
      });
    }
  };
  wireActuals();
}

/* ---------------- Planner ---------------- */

// The planner's working state: starts as the sample household, editable.
const planner = {
  earners: HOUSEHOLD.earners.map((e) => e.amount),
  amounts: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.amount])),
};

const PRESETS = {
  family: {
    label: 'Family of four · Jakarta',
    earners: [5729876, 4200000],
    amounts: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.amount])),
  },
  single: {
    label: 'Single · Jakarta minimum wage',
    earners: [5729876, 0],
    amounts: { rent: 1500000, groceries: 1100000, transport: 450000, utilities: 450000, education: 150000, health: 175000, parents: 300000, eatingout: 400000, extras: 250000, savings: 700000, cicilan: 254876 },
  },
  smallcity: {
    label: 'Family of four · smaller city',
    earners: [3200000, 1600000],
    amounts: { rent: 800000, groceries: 1600000, transport: 350000, utilities: 400000, education: 300000, health: 250000, parents: 200000, eatingout: 200000, extras: 100000, savings: 400000, cicilan: 200000 },
  },
};

export function plannerPage() {
  const earnerInputs = HOUSEHOLD.earners
    .map(
      (e, i) => `<label class="ctl grow">${esc(e.who)}
  <input type="number" min="0" step="1000" id="earn-${i}" value="${planner.earners[i]}">
  <span class="ctl-note">${esc(e.note)}</span></label>`,
    )
    .join('');
  const rows = CATEGORIES.map(
    (c) => `<tr data-cat="${c.id}">
  <td class="cat-name">${esc(c.name)}<span class="chip ${c.group}">${GROUP_NAMES[c.group]}</span>
    <div class="cat-note">${esc(c.note)}</div></td>
  <td><input type="number" min="0" step="10000" id="amt-${c.id}" value="${planner.amounts[c.id]}" aria-label="Amount for ${esc(c.name)}"></td>
  <td class="num" id="pct-${c.id}"></td>
  <td id="guide-${c.id}"></td>
</tr>`,
  ).join('');
  return `
<section class="page-head">
  <p class="eyebrow">Planner</p>
  <h1>Build the month, rupiah by rupiah</h1>
  <p class="lede">Change any income or budget line and the plan rebalances as you type:
  shares, guide ranges and what is left. Start from a preset, then make it yours.</p>
</section>
<section class="panel">
  <header class="panel-head"><h2>Start from a preset</h2></header>
  <div class="presets">${Object.entries(PRESETS)
    .map(([key, p]) => `<button type="button" class="preset" data-preset="${key}">${esc(p.label)}</button>`)
    .join('')}</div>
  <div class="controls wrap">${earnerInputs}</div>
  <div class="summary" id="planner-summary"></div>
  <p class="warn" id="planner-warn" role="status"></p>
  <div class="plan-actions">
    <button type="button" class="btn" id="copy-plan">Copy the plan as text</button>
    <button type="button" class="btn ghost" id="reset-plan">Back to the example household</button>
    <span class="form-msg" id="copy-msg" role="status"></span>
  </div>
</section>
<section class="panel">
  <header class="panel-head"><h2>The budget lines</h2><span class="src">Guide = a healthy share of income</span></header>
  <div class="table-wrap"><table class="plan-table">
    <thead><tr><th>Category</th><th>Amount (Rp)</th><th class="num">Share</th><th>Against guide</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="note">“Above guide” is not a scolding — Jakarta rent and food sit above the textbook
  ranges for most families. It is a flag for where a change would free the most money.</p>
</section>`;
}

function plannerSummary() {
  const income = incomeOf(planner.earners.map((amount) => ({ amount })));
  const planned = CATEGORIES.reduce((a, c) => a + (planner.amounts[c.id] || 0), 0);
  const left = income - planned;
  const g = (name) =>
    CATEGORIES.filter((c) => c.group === name).reduce((a, c) => a + (planner.amounts[c.id] || 0), 0);
  const savingsRate = income > 0 ? (g('future') / income) * 100 : 0;
  return { income, planned, left, needs: g('needs'), wants: g('wants'), future: g('future'), savingsRate };
}

export function mountPlanner() {
  const summary = document.getElementById('planner-summary');
  if (!summary) return;
  const warn = document.getElementById('planner-warn');
  const clamp = (input) => {
    const v = Number(input.value);
    if (Number.isNaN(v) || v < 0) { input.value = 0; return 0; }
    return Math.floor(v);
  };
  const refresh = () => {
    const s = plannerSummary();
    summary.innerHTML = `
  <div class="sum-cell"><span>Money in</span><b>${rp(s.income)}</b></div>
  <div class="sum-cell"><span>Planned</span><b>${rp(s.planned)}</b></div>
  <div class="sum-cell ${s.left < 0 ? 'bad' : 'good'}"><span>${s.left < 0 ? 'Over budget' : 'Left to assign'}</span><b>${rp(Math.abs(s.left))}</b></div>
  <div class="sum-cell"><span>Toward the future</span><b>${s.savingsRate.toFixed(1)}%</b></div>
  <div class="sum-split">${splitMeter(s.needs, s.wants, s.future)}</div>`;
    for (const c of CATEGORIES) {
      const amt = planner.amounts[c.id] || 0;
      const pct = s.income > 0 ? (amt / s.income) * 100 : 0;
      const pctCell = document.getElementById(`pct-${c.id}`);
      const guideCell = document.getElementById(`guide-${c.id}`);
      if (pctCell) pctCell.textContent = `${pct.toFixed(1)}%`;
      if (guideCell) {
        const [lo, hi] = c.guide;
        const state = pct < lo ? 'below' : pct > hi ? 'above' : 'within';
        guideCell.innerHTML = `<span class="guide ${state}">${state === 'within' ? 'Within' : state === 'above' ? 'Above' : 'Below'} guide ${lo}–${hi}%</span>`;
      }
    }
    if (warn) {
      const hogs = CATEGORIES.filter((c) => s.income > 0 && (planner.amounts[c.id] || 0) / s.income > 0.5);
      warn.textContent = s.income <= 0
        ? 'Income is zero, so shares cannot be worked out. Put in at least one income first.'
        : hogs.length
          ? `${hogs.map((c) => c.name).join(' and ')} take${hogs.length > 1 ? '' : 's'} more than half the income on ${hogs.length > 1 ? 'their own' : 'its own'} — no household survives that for long.`
          : s.left < 0
            ? `The plan spends ${rp(-s.left)} more than the money coming in. Trim a line or raise an income before the month starts.`
            : '';
    }
  };
  HOUSEHOLD.earners.forEach((_, i) => {
    const input = document.getElementById(`earn-${i}`);
    if (input) input.addEventListener('input', () => { planner.earners[i] = clamp(input); refresh(); });
  });
  for (const c of CATEGORIES) {
    const input = document.getElementById(`amt-${c.id}`);
    if (input) input.addEventListener('input', () => { planner.amounts[c.id] = clamp(input); refresh(); });
  }
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.preset];
      planner.earners = [...preset.earners];
      planner.amounts = { ...preset.amounts };
      planner.earners.forEach((v, i) => { const el = document.getElementById(`earn-${i}`); if (el) el.value = v; });
      for (const c of CATEGORIES) { const el = document.getElementById(`amt-${c.id}`); if (el) el.value = planner.amounts[c.id]; }
      refresh();
    });
  });
  const copyBtn = document.getElementById('copy-plan');
  const copyMsg = document.getElementById('copy-msg');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const s = plannerSummary();
      const lines = [
        'DompetRumah — my monthly plan',
        `Money in: ${rp(s.income)} · Planned: ${rp(s.planned)} · Left to assign: ${rp(s.left)}`,
        ...CATEGORIES.map((c) => `${c.name}: ${rp(planner.amounts[c.id] || 0)}`),
        `Needs ${((s.needs / s.income) * 100 || 0).toFixed(0)}% · wants ${((s.wants / s.income) * 100 || 0).toFixed(0)}% · future ${s.savingsRate.toFixed(1)}%`,
      ];
      const text = lines.join('\n');
      let done = false;
      try {
        await navigator.clipboard.writeText(text);
        done = true;
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { done = document.execCommand('copy'); } catch { done = false; }
        ta.remove();
      }
      if (copyMsg) copyMsg.textContent = done ? 'Plan copied — paste it anywhere.' : 'Copy did not work in this browser; the plan is still on screen.';
    });
  }
  const resetBtn = document.getElementById('reset-plan');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      planner.earners = HOUSEHOLD.earners.map((e) => e.amount);
      planner.amounts = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.amount]));
      planner.earners.forEach((v, i) => { const el = document.getElementById(`earn-${i}`); if (el) el.value = v; });
      for (const c of CATEGORIES) { const el = document.getElementById(`amt-${c.id}`); if (el) el.value = planner.amounts[c.id]; }
      refresh();
    });
  }
  refresh();
}

/* ---------------- Goals ---------------- */

export function goalsPage() {
  const cards = GOALS.map((g, i) => {
    const left = g.target - g.saved;
    const months = Math.ceil(left / g.monthly);
    return `<article class="goal-card">
  <div class="goal-name">${esc(g.name)}</div>
  ${progress(g.saved, g.target)}
  <p>${esc(g.note)}</p>
  <div class="goal-next" id="goal-next-${i}">${rp(left)} to go · at ${rp(g.monthly)} a month, done in about <b>${months} months</b></div>
  <label class="ctl goal-extra">Add extra each month (Rp)
    <input type="number" min="0" step="50000" value="0" data-goal="${i}" aria-label="Extra monthly saving for ${esc(g.name)}"></label>
</article>`;
  }).join('');
  return `
<section class="page-head">
  <p class="eyebrow">Goals</p>
  <h1>What the savings are for</h1>
  <p class="lede">A budget holds when the savings have names. These are the Prameswari
  household's four — and below, the two calculators they used to size them. Try adding
  extra to a goal and watch its finish date move closer.</p>
</section>
<section class="goal-grid">${cards}</section>
<div class="cols">
  <section class="panel">
    <header class="panel-head"><h2>Emergency fund calculator</h2></header>
    <div class="controls stack">
      <label class="ctl grow">Monthly spending (Rp)
        <input type="number" min="0" step="10000" id="ef-spend" value="9930000"></label>
      <label class="ctl grow">Months of cover
        <select id="ef-months">
          <option value="3" selected>3 months — the starter fund</option>
          <option value="6">6 months — one income is freelance</option>
          <option value="9">9 months</option>
          <option value="12">12 months — the full cushion</option>
        </select></label>
      <label class="ctl grow">You can save each month (Rp)
        <input type="number" min="0" step="10000" id="ef-save" value="1000000"></label>
    </div>
    <div class="calc-out" id="ef-out"></div>
    <p class="note">One income in this house is freelance, so the family aims at six months,
    not three: about Rp59.6 million at their current spending.</p>
  </section>
  <section class="panel">
    <header class="panel-head"><h2>Any goal, monthly</h2></header>
    <div class="controls stack">
      <label class="ctl grow">The goal costs (Rp)
        <input type="number" min="0" step="100000" id="goal-target" value="25000000"></label>
      <label class="ctl grow">Months from now
        <input type="number" min="1" step="1" id="goal-months" value="24"></label>
    </div>
    <div class="calc-out" id="goal-out"></div>
    <p class="note">The honest test of a goal is the monthly figure: if it does not fit the
    plan, move the date — not the savings line for everything else.</p>
  </section>
</div>`;
}

export function mountGoals() {
  document.querySelectorAll('[data-goal]').forEach((input) => {
    input.addEventListener('input', () => {
      const i = Number(input.dataset.goal);
      const g = GOALS[i];
      const extra = Math.max(0, Math.floor(Number(input.value) || 0));
      const left = g.target - g.saved;
      const per = g.monthly + extra;
      const months = Math.ceil(left / per);
      const out = document.getElementById(`goal-next-${i}`);
      if (out) {
        out.innerHTML = `${rp(left)} to go · at ${rp(per)} a month${extra > 0 ? ` (including ${rp(extra)} extra)` : ''}, done in about <b>${months} months</b>`;
      }
    });
  });
  const efOut = document.getElementById('ef-out');
  if (efOut) {
    const spend = document.getElementById('ef-spend');
    const months = document.getElementById('ef-months');
    const save = document.getElementById('ef-save');
    const apply = () => {
      const target = (Number(spend.value) || 0) * Number(months.value);
      const per = Number(save.value) || 0;
      const eta = per > 0 ? Math.ceil(target / per) : null;
      efOut.innerHTML = `Your emergency fund target is <b>${rp(target)}</b>.` +
        (eta ? ` Saving ${rp(per)} a month, you are covered in <b>${eta} months</b>.` : ' Set a monthly saving above zero to see the date.');
    };
    [spend, months, save].forEach((el) => el && el.addEventListener('input', apply));
    apply();
  }
  const goalOut = document.getElementById('goal-out');
  if (goalOut) {
    const target = document.getElementById('goal-target');
    const months = document.getElementById('goal-months');
    const apply = () => {
      const t = Number(target.value) || 0;
      const m = Math.max(1, Number(months.value) || 1);
      const per = t / m;
      goalOut.innerHTML = `Put by <b>${rp(Math.ceil(per))} a month</b> — about ${rp(Math.ceil(per / 30))} a day — and the ${rp(t)} is there in ${m} months.`;
    };
    [target, months].forEach((el) => el && el.addEventListener('input', apply));
    apply();
  }
}

/* ---------------- Guide ---------------- */

export function guidePage() {
  const bench = BENCHMARKS.map(
    (b) => `<article class="fact">
  <div class="fact-value">${esc(b.value)}</div>
  <div class="fact-label">${esc(b.label)}</div>
  <p>${esc(b.note)}</p>
  <div class="src">${esc(b.source)}</div>
</article>`,
  ).join('');
  const ranges = GUIDE_RANGES.map(
    (g) => `<tr><td class="cat-name">${esc(g.name)}</td><td class="num range">${esc(g.range)}</td><td>${esc(g.tip)}</td></tr>`,
  ).join('');
  const signs = WARNING_SIGNS.map(
    (w) => `<li><b>${esc(w.sign)}</b><span>${esc(w.why)}</span></li>`,
  ).join('');
  return `
<section class="page-head">
  <p class="eyebrow">Guide</p>
  <h1>What a healthy budget looks like here</h1>
  <p class="lede">Rules of thumb travel badly. These are the ranges that fit Indonesian
  households, checked against what BPS measures the country actually spends.</p>
</section>
<section class="fact-grid">${bench}</section>
<section class="panel">
  <header class="panel-head"><h2>The 50 / 30 / 20 rule, honestly</h2></header>
  <p>The classic rule gives 50% of income to needs, 30% to wants and 20% to savings and debt.
  In Jakarta it fails on contact: BPS counts average spending at Rp1.57 million per person a month,
  and rent for a family home starts near Rp2 million. The Prameswari plan runs 76 / 9 / 15 —
  needs heavy, wants lean, future protected. Treat the rule as a compass, not a verdict:
  what matters is that the future line is paid first and never raided quietly.</p>
  ${splitMeter(groupTotal('needs'), groupTotal('wants'), groupTotal('future'))}
</section>
<section class="panel">
  <header class="panel-head"><h2>Healthy ranges, category by category</h2><span class="src">Share of take-home income</span></header>
  <div class="table-wrap"><table class="plan-table">
    <thead><tr><th>Category</th><th class="num">Range</th><th>What to know</th></tr></thead>
    <tbody>${ranges}</tbody>
  </table></div>
</section>
<section class="panel">
  <header class="panel-head"><h2>Five signs the budget is quietly failing</h2></header>
  <ul class="signs">${signs}</ul>
  <p class="note">One sign is a warning; three together mean the plan needs rewriting, not
  more willpower. Start with the smallest fix — a weekly grocery cap, or moving savings
  to payday — and let the record on the dashboard prove it works.</p>
</section>
<section class="panel">
  <header class="panel-head"><h2>The payday routine</h2></header>
  <ol class="routine">
    <li><b>Day 1 — pay the future first.</b> Move savings and the emergency-fund line to the separate account before any bill is touched.</li>
    <li><b>Day 1 — settle the fixed bills.</b> Rent, phone packages and anything due by the 10th (BPJS, school) go out in one sitting; tick them off on the dashboard.</li>
    <li><b>Weekly — the kitchen envelope.</b> Groceries get a weekly cash or e-wallet cap (here, Rp600.000); when it is gone, the market list shrinks, not the savings.</li>
    <li><b>Mid-month — a ten-minute check.</b> Compare the plan against the bank balance. A line that is over by the 15th gets trimmed while there is still month left.</li>
    <li><b>Month-end — sweep and write it down.</b> Whatever is left joins the emergency fund, and the month joins the cash-flow record — six honest months teach more than any rule.</li>
  </ol>
</section>
<p class="fineprint">Benchmarks: BPS Susenas March 2025 and Sakernas August 2025; Jakarta's UMP from the
Governor's decrees for 2025 and 2026. Ranges are guidance for a renting family in a large city, not financial advice.</p>`;
}

/* ---------------- Missing ---------------- */

export function missingPage() {
  return `<section class="page-head">
  <h1>Not found</h1>
  <p class="lede">There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>
</section>`;
}
