// DompetRumah — the four pages as HTML strings. These functions only describe
// what a page looks like; main.js decides when to call them and wires the controls
// they return. All figures come from data.js or from the live planner state.

import {
  ACTUALS, BENCHMARKS, BILLS, CASHFLOW, CATEGORIES, DONUT_COLORS, GOALS,
  GROUP_LABELS, GROUP_ORDER, HOUSEHOLD, INCOMES, LEDGER, PRESETS, WARNING_SIGNS,
} from './data.js';

export function fmt(n) {
  return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function fmtShort(n) {
  if (n >= 1000000) {
    const jt = n / 1000000;
    return 'Rp' + (Number.isInteger(jt) ? jt : jt.toFixed(2).replace(/0$/, '')) + ' jt';
  }
  return 'Rp' + Math.round(n / 1000) + ' rb';
}

export function pct(part, whole) {
  if (!whole) return '0%';
  return ((part / whole) * 100).toFixed(1).replace(/\.0$/, '') + '%';
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function totalIncome(state) {
  return state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
}

function totalPlanned(state) {
  return CATEGORIES.reduce((sum, cat) => sum + (state.amounts[cat.id] || 0), 0);
}

export function groupTotals(state) {
  const out = { needs: 0, wants: 0, future: 0 };
  for (const cat of CATEGORIES) out[cat.group] += state.amounts[cat.id] || 0;
  return out;
}

function splitMeter(state) {
  const income = totalIncome(state);
  const groups = groupTotals(state);
  const rows = GROUP_ORDER.map((g) => {
    const share = income ? (groups[g] / income) * 100 : 0;
    return `<div class="meter-seg meter-${g}" style="width:${share.toFixed(2)}%">` +
      (share >= 20 ? `<span>${GROUP_LABELS[g]} ${share.toFixed(0)}%</span>` : '') + '</div>';
  }).join('');
  const caption = GROUP_ORDER.map((g) => `${GROUP_LABELS[g]} ${pct(groups[g], income)}`).join(' · ');
  return `<div class="meter" role="img" aria-label="${esc(caption)}">${rows}</div>
    <p class="meter-caption">${esc(caption)} of income. The marks show the classic 50 / 30 / 20 rule: needs 50%, wants 30%, future 20%.</p>`;
}

function pageHead(kicker, title, intro) {
  return `<p class="kicker">${esc(kicker)}</p><h1>${esc(title)}</h1><p class="lede">${esc(intro)}</p>`;
}

// ---------------------------------------------------------------- dashboard

function dashboardKpis(state) {
  const income = totalIncome(state);
  const planned = totalPlanned(state);
  const groups = groupTotals(state);
  const futureShare = pct(groups.future, income);
  const left = income - planned;
  return `<section class="kpis" aria-label="Month at a glance">
    <div class="kpi"><p class="kpi-label">Money in</p><p class="kpi-big">${fmt(income)}</p>
      <p class="kpi-sub"><span class="nowrap">Earner 1 ${fmtShort(INCOMES[0].amount)}</span> · <span class="nowrap">Earner 2 ${fmtShort(INCOMES[1].amount)}</span></p></div>
    <div class="kpi"><p class="kpi-label">Planned spending</p><p class="kpi-big">${fmt(planned)}</p>
      <p class="kpi-sub"><span class="nowrap">Needs ${fmtShort(groups.needs)}</span> · <span class="nowrap">wants ${fmtShort(groups.wants)}</span></p></div>
    <div class="kpi"><p class="kpi-label">Toward the future</p><p class="kpi-big">${futureShare}</p>
      <p class="kpi-sub">${fmt(groups.future)} to savings and the cicilan, every month</p></div>
    <div class="kpi"><p class="kpi-label">Left unassigned</p><p class="kpi-big">${fmt(left)}</p>
      <p class="kpi-sub">${left === 0 ? 'Every rupiah has a job — the plan balances exactly' : 'Assign it a job in the Planner before the month starts'}</p></div>
  </section>`;
}

function dashboardDonut(state) {
  const slices = CATEGORIES.map((cat, i) => ({
    label: cat.name, value: state.amounts[cat.id] || 0, color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
  const legend = slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>
    <span class="legend-name">${esc(s.label)}</span><span class="legend-amount">${fmtShort(s.value)}</span></li>`).join('');
  return `<section class="card" aria-label="Where the money goes">
    <h2>Where the money goes</h2><p class="card-note">The monthly plan</p>
    <div class="donut-wrap"><canvas id="donut" width="260" height="260" aria-label="Donut chart of the eleven budget lines"></canvas>
    <ul class="legend">${legend}</ul></div></section>`;
}

function dashboardBills(state) {
  const paid = state.bills.filter((b) => b.paid).length;
  const rows = state.bills.map((b) => `<li class="${b.paid ? 'paid' : ''}">
    <label><input type="checkbox" data-bill="${b.id}" ${b.paid ? 'checked' : ''}>
    <span class="bill-name">${esc(b.name)}</span></label>
    <span class="bill-due">${esc(b.due)}</span><span class="bill-amount">${fmt(b.amount)}</span></li>`).join('');
  const total = BILLS.reduce((sum, b) => sum + b.amount, 0);
  return `<section class="card" aria-label="This month's bills">
    <h2>This month's bills</h2><p class="card-note"><span id="bill-count">${paid} of ${state.bills.length} paid</span> · ${fmt(total)} in all</p>
    <ul class="bills">${rows}</ul>
    <p class="card-foot">Tick a bill when it is paid. The counter above moves with you.</p></section>`;
}

function dashboardGoals(state) {
  const cards = GOALS.map((g) => {
    const share = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<li><div class="goal-mini-head"><span>${esc(g.name)}</span><strong>${share}%</strong></div>
      <div class="bar"><span style="width:${share}%"></span></div>
      <p class="goal-mini-sub">${fmt(g.saved)} of ${fmt(g.target)}</p></li>`;
  }).join('');
  return `<section class="card" aria-label="Savings goals">
    <h2>What the savings are for</h2><p class="card-note">Four goals, one household</p>
    <ul class="goal-minis">${cards}</ul>
    <p class="card-foot"><a href="#/goals">Open the Goals page to add extra and move the finish dates →</a></p></section>`;
}

function dashboardFlow() {
  return `<section class="card" aria-label="Cash flow">
    <h2>Money in, money out</h2><p class="card-note">July – December 2026 · green is income, amber is spending</p>
    <canvas id="cashflow" height="220" aria-label="Bar chart of monthly income and spending"></canvas>
    <p class="card-foot">December jumps on the year-end bonus — and on holiday spending. September's extra income was a big freelance month.</p></section>`;
}

function dashboardSpent(state) {
  const rows = CATEGORIES.map((cat) => {
    const plan = state.amounts[cat.id] || 0;
    const spent = ACTUALS[cat.id] || 0;
    const over = spent - plan;
    const fill = plan > 0 ? Math.min(100, (spent / plan) * 100) : 0;
    const status = over > 0
      ? `<span class="over">over by ${fmt(over)}</span>`
      : `<span class="left">${fmt(plan - spent)} left</span>`;
    return `<li><span class="spent-name">${esc(cat.name)}</span>
      <span class="spent-bar"><span style="width:${fill}%"></span></span>
      <span class="spent-nums">${fmt(spent)} / ${fmt(plan)}</span>${status}</li>`;
  }).join('');
  const spentTotal = Object.values(ACTUALS).reduce((a, b) => a + b, 0);
  const income = totalIncome(state);
  return `<section class="card wide" aria-label="Spent versus planned">
    <h2>Spent vs planned — ${esc(HOUSEHOLD.monthLabel)}</h2>
    <p class="card-note">As of ${esc(HOUSEHOLD.asOf)} · ${HOUSEHOLD.daysLeft} days left in the month</p>
    <ul class="spent">${rows}</ul>
    <p class="spent-total">Spent so far <strong>${fmt(spentTotal)}</strong> · still in hand <strong>${fmt(income - spentTotal)}</strong></p></section>`;
}

function dashboardLedger(state) {
  const options = CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const entries = state.ledger.map((e) => {
    const cat = CATEGORIES.find((c) => c.id === e.category);
    return `<li><span class="ledger-date">${esc(e.date)}</span><span class="ledger-cat">${esc(cat ? cat.name : e.category)}</span>
      <span class="ledger-note">${esc(e.note)}</span><span class="ledger-amount">${fmt(e.amount)}</span></li>`;
  }).join('');
  return `<section class="card wide" aria-label="Recent spending">
    <h2>Recent spending</h2><p class="card-note">Newest first — write it down the day it happens</p>
    <form id="expense-form" class="expense-form">
      <label>Category<select name="category" required>${options}</select></label>
      <label>What was it?<input name="note" type="text" required maxlength="80" placeholder="e.g. Pasar: beras 5 kg"></label>
      <label>Amount (Rp)<input name="amount" type="number" min="1" required placeholder="185000"></label>
      <button type="submit">Add expense</button>
    </form>
    <ul class="ledger">${entries}</ul></section>`;
}

export function renderDashboard(state) {
  return pageHead(
    'Household budget · Jakarta',
    `The ${HOUSEHOLD.name} household`,
    `${HOUSEHOLD.members} · ${HOUSEHOLD.home}. Two incomes, eleven budget lines, one rule: savings move out on payday, before anything else is spent. This is their month, in full.`,
  ) + dashboardKpis(state) +
    `<div class="two-col">${dashboardDonut(state)}${dashboardBills(state)}</div>` +
    `<div class="two-col">${dashboardGoals(state)}${dashboardFlow()}</div>` +
    dashboardSpent(state) + dashboardLedger(state);
}

// ---------------------------------------------------------------- planner

function plannerSummary(state) {
  const income = totalIncome(state);
  const planned = totalPlanned(state);
  const left = income - planned;
  const groups = groupTotals(state);
  return `<div class="summary">
    <div><p class="kpi-label">Money in</p><p class="summary-big">${fmt(income)}</p></div>
    <div><p class="kpi-label">Planned</p><p class="summary-big">${fmt(planned)}</p></div>
    <div><p class="kpi-label">Left to assign</p><p class="summary-big ${left < 0 ? 'bad' : ''}">${fmt(left)}</p></div>
    <div><p class="kpi-label">Toward the future</p><p class="summary-big">${pct(groups.future, income)}</p></div>
    <div class="summary-meter">${splitMeter(state)}</div>
  </div>
  <p id="planner-warning" class="warning" hidden></p>`;
}

function plannerRows(state) {
  const income = totalIncome(state);
  const rows = CATEGORIES.map((cat) => {
    const amount = state.amounts[cat.id] || 0;
    const share = income ? (amount / income) * 100 : 0;
    const inRange = share >= cat.guideLo && share <= cat.guideHi;
    const flag = inRange
      ? `<span class="flag ok">within ${cat.guideLo}–${cat.guideHi}%</span>`
      : `<span class="flag ${share > cat.guideHi ? 'high' : 'low'}">${share.toFixed(1)}% — guide ${cat.guideLo}–${cat.guideHi}%</span>`;
    const warn = share > 50 ? `<span class="flag high">over half the income</span>` : '';
    return `<tr>
      <td><strong>${esc(cat.name)}</strong><br><span class="row-hint">${esc(cat.hint)}</span></td>
      <td><input type="number" min="0" step="1000" data-cat="${cat.id}" value="${amount}" aria-label="Amount for ${esc(cat.name)}"></td>
      <td class="num">${share.toFixed(1)}%</td>
      <td>${flag} ${warn}</td>
    </tr>`;
  }).join('');
  return `<table class="plan-table"><thead><tr>
    <th>Category</th><th>Amount (Rp)</th><th>Share</th><th>Against guide</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderPlanner(state) {
  const presets = PRESETS.map((p) => `<button type="button" class="preset ${state.presetId === p.id ? 'active' : ''}" data-preset="${p.id}">
    <strong>${esc(p.name)}</strong><span>${esc(p.blurb)}</span></button>`).join('');
  const incomeFields = state.incomes.map((inc, i) => {
    const base = INCOMES[i];
    return `<div><label for="income-${inc.id}">${esc(inc.label)}</label>
      <input type="number" id="income-${inc.id}" min="0" step="1000" data-income="${inc.id}" value="${inc.amount}">
      <p class="field-note">${esc(base ? base.note : '')}</p></div>`;
  }).join('');
  return pageHead(
    'Planner',
    'Build the month, rupiah by rupiah',
    'Change any income or budget line and the plan rebalances as you type: shares, guide ranges and what is left. Start from a preset, then make it yours.',
  ) + `<section class="card wide" aria-label="Planner">
    <h2>Start from a preset</h2><div class="presets">${presets}</div>
    <div class="income-grid">${incomeFields}</div>
    ${plannerSummary(state)}
    <div class="plan-actions">
      <button type="button" id="copy-plan" class="btn-primary">Copy the plan as text</button>
      <button type="button" id="reset-plan" class="btn-ghost">Back to the example household</button>
      <span id="copy-note" class="copy-note" role="status"></span>
    </div>
  </section>
  <section class="card wide" aria-label="The budget lines">
    <h2>The budget lines</h2><p class="card-note">Guide = a healthy share of income</p>
    ${plannerRows(state)}
  </section>`;
}

// ---------------------------------------------------------------- goals

function monthsToGo(goal, extra) {
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / Math.max(1, goal.monthly + extra));
}

function goalCards(state) {
  return GOALS.map((g) => {
    const extra = state.goalExtra[g.id] || 0;
    const share = Math.min(100, Math.round((g.saved / g.target) * 100));
    const months = monthsToGo(g, extra);
    return `<article class="card goal-card">
      <h2>${esc(g.name)}</h2>
      <div class="bar big"><span style="width:${share}%"></span></div>
      <p class="goal-amounts">${fmt(g.saved)} of ${fmt(g.target)} — <strong>${share}%</strong></p>
      <p>${esc(g.note)}</p>
      <p><strong>${fmt(g.target - g.saved)} to go</strong> · at ${fmt(g.monthly + extra)} a month, done in about <strong>${months} months</strong></p>
      <label>Add extra each month (Rp)
        <input type="number" min="0" step="50000" data-goal-extra="${g.id}" value="${extra}">
      </label>
    </article>`;
  }).join('');
}

function emergencyCalculator(state) {
  const calc = state.emergency;
  const needed = calc.spend * calc.months;
  const months = calc.monthly > 0 ? Math.ceil(needed / calc.monthly) : 0;
  return `<section class="card" aria-label="Emergency fund calculator">
    <h2>Emergency fund calculator</h2>
    <p>How much does your household spend in a month? Multiply it by the months of cover you want, then divide by what you can save each month.</p>
    <label>Monthly spending (Rp)<input type="number" min="0" step="100000" data-calc="spend" value="${calc.spend}"></label>
    <label>Months of cover<input type="number" min="1" max="12" data-calc="months" value="${calc.months}"></label>
    <label>Monthly saving (Rp)<input type="number" min="0" step="50000" data-calc="monthly" value="${calc.monthly}"></label>
    <p class="calc-result">You need <strong>${fmt(needed)}</strong> — at ${fmt(calc.monthly)} a month that takes about <strong>${months} months</strong>.</p>
  </section>`;
}

function anyGoalCalculator(state) {
  const calc = state.anyGoal;
  const remaining = Math.max(0, calc.target - calc.saved);
  const months = calc.monthly > 0 ? Math.ceil(remaining / calc.monthly) : 0;
  const done = new Date(2026, 10 + months, 26);
  const doneLabel = months === 0 ? 'already there' : done.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return `<section class="card" aria-label="Any goal calculator">
    <h2>Any goal calculator</h2>
    <p>Size any goal of your own — a wedding, a motorbike, a shop deposit.</p>
    <label>Target (Rp)<input type="number" min="0" step="100000" data-any="target" value="${calc.target}"></label>
    <label>Saved so far (Rp)<input type="number" min="0" step="100000" data-any="saved" value="${calc.saved}"></label>
    <label>Monthly saving (Rp)<input type="number" min="0" step="50000" data-any="monthly" value="${calc.monthly}"></label>
    <p class="calc-result"><strong>${fmt(remaining)} to go</strong> · about <strong>${months} months</strong> · done around <strong>${doneLabel}</strong>.</p>
  </section>`;
}

export function renderGoals(state) {
  return pageHead(
    'Goals',
    'What the savings are for',
    'A budget holds when the savings have names. These are the Prameswari household\u2019s four — and below, the two calculators they used to size them. Try adding extra to a goal and watch its finish date move closer.',
  ) + `<div class="goal-grid">${goalCards(state)}</div>
  <div class="two-col">${emergencyCalculator(state)}${anyGoalCalculator(state)}</div>`;
}

// ---------------------------------------------------------------- guide

function guideRanges() {
  const rows = CATEGORIES.map((cat) => `<tr>
    <td><strong>${esc(cat.name)}</strong></td><td>${GROUP_LABELS[cat.group]}</td>
    <td class="num">${cat.guideLo}–${cat.guideHi}%</td>
    <td class="num">${fmt(cat.amount)}</td><td class="num">${pct(cat.amount, 9929876)}</td>
  </tr>`).join('');
  return `<section class="card wide" aria-label="Healthy ranges">
    <h2>Healthy ranges, line by line</h2>
    <p>What share of income each line usually takes in a Jakarta household — and what the Prameswari plan actually gives it.</p>
    <table class="plan-table"><thead><tr>
      <th>Category</th><th>Group</th><th>Healthy range</th><th>This plan</th><th>Share</th>
    </tr></thead><tbody>${rows}</tbody></table></section>`;
}

function guideVerdict() {
  return `<section class="card" aria-label="The 50 30 20 verdict">
    <h2>50 / 30 / 20, honestly</h2>
    <p>The classic rule says needs 50%, wants 30%, future 20%. The Prameswari plan runs <strong>75,5% needs, 9,4% wants, 15,1% future</strong> — and that is not a failure, it is Jakarta.</p>
    <p>At the 2026 minimum wage, rent and food alone take 46% of income. A household that forced needs down to 50% would be skipping meals or moving far from work. The honest version of the rule for this city: keep wants small, protect the future line first, and let needs be what they are.</p>
    <p>The number that matters most is the future line. At 15,1% this household saves more than the 10% floor — and that, more than any ratio, is what keeps a bad month from becoming a bad year.</p>
  </section>`;
}

function paydayRoutine() {
  const steps = [
    ['Payday, before anything else', 'Move Rp1.000.000 to the separate savings account. The rest of the month is planned on what remains.'],
    ['Pay the fixed bills', 'Rent, BPJS and SPP go out in the first ten days. Tick them off on the dashboard as they leave.'],
    ['Fill the kitchen envelope', 'Rp2.400.000 for the month, split into four weekly shops. A week that ends early eats the next week, not the savings.'],
    ['Write down every spend', 'One line a day, however small. Five minutes at night; the ledger on the dashboard is where it lives.'],
    ['Sunday check, five minutes', 'Add up the week. If a line is running hot, move money between lines in the Planner — openly, on the page, not in your head.'],
  ];
  return `<section class="card" aria-label="Payday routine">
    <h2>The payday routine, in five steps</h2>
    <ol class="steps">${steps.map(([title, text]) => `<li><strong>${esc(title)}</strong><br>${esc(text)}</li>`).join('')}</ol>
  </section>`;
}

function guideBenchmarks() {
  const b = BENCHMARKS;
  return `<section class="card wide" aria-label="Benchmarks">
    <h2>How this household compares — BPS figures</h2>
    <div class="bench-grid">
      <div><p class="bench-big">${fmt(b.perCapita)}</p><p>${esc(b.perCapitaNote)}</p></div>
      <div><p class="bench-big">${fmt(b.jakartaPerCapita)}</p><p>Jakarta per person — food ${fmt(b.jakartaFood)} of it, ${b.jakartaFoodShare}%</p></div>
      <div><p class="bench-big">${fmt(b.averageWage)}</p><p>${esc(b.averageWageNote)}</p></div>
      <div><p class="bench-big">${fmt(b.ump2026)}</p><p>Jakarta UMP 2026, up from ${fmt(b.ump2025)} in 2025</p></div>
      <div><p class="bench-big">${fmt(b.povertyLine)}</p><p>${esc(b.povertyNote)}</p></div>
      <div><p class="bench-big">${fmt(9929876 / 4)}</p><p>This household, per person per month — below the Jakarta average, which is what four people sharing one roof buys you</p></div>
    </div>
    <p class="card-foot">Sources: BPS Susenas March 2025, Sakernas August 2025, Jakarta UMP 2026. At Rp2,48 jt a head this household spends less per person than the Jakarta average — and still ends the month with Rp240.000 in hand.</p>
  </section>`;
}

function guideWarnings() {
  const cards = WARNING_SIGNS.map((w, i) => `<article class="card warn-card">
    <p class="warn-num">${i + 1}</p><h3>${esc(w.title)}</h3>
    <p><strong>Why it matters:</strong> ${esc(w.why)}</p>
    <p><strong>What to do:</strong> ${esc(w.fix)}</p></article>`).join('');
  return `<section aria-label="Warning signs">
    <h2>Five signs a budget is in trouble</h2>
    <p class="lede">Any one of these is a warning. Two at once means the plan needs rewriting this week, not next month.</p>
    <div class="warn-grid">${cards}</div></section>`;
}

export function renderGuide() {
  return pageHead(
    'Guide',
    'The guide: ranges, routines, reality',
    'Healthy shares for every line, an honest word on the 50 / 30 / 20 rule, the five-step payday routine, and the national figures this household is measured against.',
  ) + guideRanges() + `<div class="two-col">${guideVerdict()}${paydayRoutine()}</div>` +
    guideBenchmarks() + guideWarnings();
}
