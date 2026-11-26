// DompetRumah — the wiring. One state object holds the live plan; the router
// swaps pages into #view on every hash change; each page's controls re-render
// the numbers they own. Nothing here leaves the browser: no fetch, no storage,
// no network of any kind.

import {
  ACTUALS, BILLS, CASHFLOW, CATEGORIES, DONUT_COLORS, GOALS, INCOMES, LEDGER, PRESETS,
} from './data.js';
import { drawCashflow, drawDonut } from './charts.js';
import { fmt, fmtShort, groupTotals, pct, renderDashboard, renderGoals, renderGuide, renderPlanner } from './views.js';

const view = document.getElementById('view');
const navLinks = [...document.querySelectorAll('.nav a')];

function freshState() {
  return {
    presetId: 'jakarta-family',
    incomes: INCOMES.map((inc) => ({ ...inc })),
    amounts: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.amount])),
    bills: BILLS.map((b) => ({ ...b })),
    ledger: LEDGER.map((e) => ({ ...e })),
    actuals: { ...ACTUALS },
    goalExtra: Object.fromEntries(GOALS.map((g) => [g.id, 0])),
    emergency: { spend: 9930000, months: 3, monthly: 1000000 },
    anyGoal: { target: 9000000, saved: 2700000, monthly: 200000 },
  };
}

let state = freshState();

function totalIncome() {
  return state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
}

function totalPlanned() {
  return CATEGORIES.reduce((sum, cat) => sum + (state.amounts[cat.id] || 0), 0);
}

function cleanAmount(raw) {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function route() {
  const hash = (location.hash || '#/dashboard').replace(/^#\/?/, '');
  return ['dashboard', 'planner', 'goals', 'guide'].includes(hash) ? hash : 'dashboard';
}

function render() {
  const page = route();
  if (page === 'dashboard') view.innerHTML = renderDashboard(state);
  else if (page === 'planner') view.innerHTML = renderPlanner(state);
  else if (page === 'goals') view.innerHTML = renderGoals(state);
  else view.innerHTML = renderGuide();
  for (const link of navLinks) {
    const target = link.getAttribute('href').replace(/^#\/?/, '');
    const active = target === page;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (page === 'dashboard') drawDashboardCharts();
  if (page === 'planner') refreshPlannerWarning();
  window.scrollTo(0, 0);
}

function drawDashboardCharts() {
  const donut = document.getElementById('donut');
  if (donut) {
    const slices = CATEGORIES.map((cat, i) => ({
      value: state.amounts[cat.id] || 0,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
    drawDonut(donut, slices, fmtShort(totalIncome()), 'per month');
  }
  const flow = document.getElementById('cashflow');
  if (flow) drawCashflow(flow, CASHFLOW);
}

// ------------------------------------------------------------ planner logic

function applyPreset(presetId) {
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  state.presetId = preset.id;
  state.incomes = preset.incomes.map((inc) => ({ ...inc }));
  state.amounts = { ...preset.amounts };
  render();
}

function refreshPlannerWarning() {
  const note = document.getElementById('planner-warning');
  if (!note) return;
  const income = totalIncome();
  const planned = totalPlanned();
  const messages = [];
  if (planned > income) messages.push(`The plan is ${fmt(planned - income)} over income — trim a line or raise an income.`);
  const biggest = CATEGORIES.reduce((top, cat) => (state.amounts[cat.id] > (state.amounts[top.id] || 0) ? cat : top), CATEGORIES[0]);
  if (income > 0 && state.amounts[biggest.id] / income > 0.5) {
    messages.push(`${biggest.name} alone takes more than half the income — worth a second look.`);
  }
  note.hidden = messages.length === 0;
  note.textContent = messages.join(' ');
}

function planAsText() {
  const income = totalIncome();
  const groups = groupTotals(state);
  const lines = [
    `DompetRumah — monthly plan (${fmt(income)} in)`,
    ...state.incomes.map((inc) => `  ${inc.label}: ${fmt(inc.amount)}`),
    ...CATEGORIES.map((cat) => `  ${cat.name}: ${fmt(state.amounts[cat.id] || 0)} (${pct(state.amounts[cat.id] || 0, income)} of income)`),
    `  Planned ${fmt(totalPlanned())} · left to assign ${fmt(income - totalPlanned())}`,
    `  Needs ${pct(groups.needs, income)} · wants ${pct(groups.wants, income)} · future ${pct(groups.future, income)}`,
  ];
  return lines.join('\n');
}

async function copyPlan() {
  const note = document.getElementById('copy-note');
  const text = planAsText();
  try {
    await navigator.clipboard.writeText(text);
    if (note) note.textContent = 'Copied — paste it anywhere.';
  } catch {
    const box = document.createElement('textarea');
    box.value = text;
    document.body.appendChild(box);
    box.select();
    document.execCommand('copy');
    box.remove();
    if (note) note.textContent = 'Copied — paste it anywhere.';
  }
}

// ------------------------------------------------------------ page wiring

function wireDashboard() {
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const amount = cleanAmount(data.get('amount'));
      const note = String(data.get('note') || '').trim();
      const category = String(data.get('category') || 'extras');
      if (!amount || !note) return;
      state.ledger.unshift({ date: '26 Nov', category, note, amount });
      state.actuals[category] = (state.actuals[category] || 0) + amount;
      render();
    });
  }
}

function wirePlanner() {
  const presetButtons = [...document.querySelectorAll('[data-preset]')];
  for (const button of presetButtons) {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  }
  for (const input of document.querySelectorAll('[data-income]')) {
    input.addEventListener('input', () => {
      const inc = state.incomes.find((i) => i.id === input.dataset.income);
      if (inc) inc.amount = cleanAmount(input.value);
      state.presetId = '';
      refreshPlannerLive();
    });
  }
  for (const input of document.querySelectorAll('[data-cat]')) {
    input.addEventListener('input', () => {
      state.amounts[input.dataset.cat] = cleanAmount(input.value);
      state.presetId = '';
      refreshPlannerLive();
    });
  }
  const copyButton = document.getElementById('copy-plan');
  if (copyButton) copyButton.addEventListener('click', copyPlan);
  const resetButton = document.getElementById('reset-plan');
  if (resetButton) resetButton.addEventListener('click', () => applyPreset('jakarta-family'));
}

// Recompute the planner's summary and per-row shares without rebuilding the page,
// so the input being typed in never loses focus.
function refreshPlannerLive() {
  const summary = view.querySelector('.summary');
  if (!summary) return;
  const income = totalIncome();
  const planned = totalPlanned();
  const groups = groupTotals(state);
  const bigs = summary.querySelectorAll('.summary-big');
  if (bigs.length >= 4) {
    bigs[0].textContent = fmt(income);
    bigs[1].textContent = fmt(planned);
    bigs[2].textContent = fmt(income - planned);
    bigs[2].classList.toggle('bad', income - planned < 0);
    bigs[3].textContent = pct(groups.future, income);
  }
  const meter = summary.querySelector('.summary-meter');
  if (meter) {
    const caption = ['needs', 'wants', 'future']
      .map((g) => `${g[0].toUpperCase() + g.slice(1)} ${pct(groups[g], income)}`)
      .join(' · ');
    const segs = ['needs', 'wants', 'future'].map((g) => {
      const share = income ? (groups[g] / income) * 100 : 0;
      return `<div class="meter-seg meter-${g}" style="width:${share.toFixed(2)}%">` +
        (share >= 20 ? `<span>${g[0].toUpperCase() + g.slice(1)} ${share.toFixed(0)}%</span>` : '') + '</div>';
    }).join('');
    meter.innerHTML = `<div class="meter" role="img" aria-label="${caption}">${segs}</div>
      <p class="meter-caption">${caption} of income. The marks show the classic 50 / 30 / 20 rule: needs 50%, wants 30%, future 20%.</p>`;
  }
  for (const input of document.querySelectorAll('[data-cat]')) {
    const row = input.closest('tr');
    if (!row) continue;
    const amount = state.amounts[input.dataset.cat] || 0;
    const share = income ? (amount / income) * 100 : 0;
    const shareCell = row.children[2];
    if (shareCell) shareCell.textContent = share.toFixed(1) + '%';
    const cat = CATEGORIES.find((c) => c.id === input.dataset.cat);
    const flagCell = row.children[3];
    if (cat && flagCell) {
      const inRange = share >= cat.guideLo && share <= cat.guideHi;
      flagCell.innerHTML = inRange
        ? `<span class="flag ok">within ${cat.guideLo}–${cat.guideHi}%</span>`
        : `<span class="flag ${share > cat.guideHi ? 'high' : 'low'}">${share.toFixed(1)}% — guide ${cat.guideLo}–${cat.guideHi}%</span>` +
          (share > 50 ? ' <span class="flag high">over half the income</span>' : '');
    }
  }
  refreshPlannerWarning();
}

function wireGoals() {
  for (const input of document.querySelectorAll('[data-goal-extra]')) {
    input.addEventListener('input', () => {
      state.goalExtra[input.dataset.goalExtra] = cleanAmount(input.value);
      const card = input.closest('.goal-card');
      if (!card) return;
      const goal = GOALS.find((g) => g.id === input.dataset.goalExtra);
      if (!goal) return;
      const extra = state.goalExtra[goal.id];
      const remaining = goal.target - goal.saved;
      const months = remaining <= 0 ? 0 : Math.ceil(remaining / Math.max(1, goal.monthly + extra));
      const lines = card.querySelectorAll('p');
      for (const p of lines) {
        if (p.textContent.includes('to go')) {
          p.innerHTML = `<strong>${fmt(remaining)} to go</strong> · at ${fmt(goal.monthly + extra)} a month, done in about <strong>${months} months</strong>`;
        }
      }
    });
  }
  for (const input of document.querySelectorAll('[data-calc]')) {
    input.addEventListener('input', () => {
      state.emergency[input.dataset.calc] = cleanAmount(input.value);
      const card = input.closest('.card');
      const result = card && card.querySelector('.calc-result');
      if (result) {
        const needed = state.emergency.spend * state.emergency.months;
        const months = state.emergency.monthly > 0 ? Math.ceil(needed / state.emergency.monthly) : 0;
        result.innerHTML = `You need <strong>${fmt(needed)}</strong> — at ${fmt(state.emergency.monthly)} a month that takes about <strong>${months} months</strong>.`;
      }
    });
  }
  for (const input of document.querySelectorAll('[data-any]')) {
    input.addEventListener('input', () => {
      state.anyGoal[input.dataset.any] = cleanAmount(input.value);
      const card = input.closest('.card');
      const result = card && card.querySelector('.calc-result');
      if (result) {
        const remaining = Math.max(0, state.anyGoal.target - state.anyGoal.saved);
        const months = state.anyGoal.monthly > 0 ? Math.ceil(remaining / state.anyGoal.monthly) : 0;
        const done = new Date(2026, 10 + months, 26);
        const label = months === 0 ? 'already there' : done.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        result.innerHTML = `<strong>${fmt(remaining)} to go</strong> · about <strong>${months} months</strong> · done around <strong>${label}</strong>.`;
      }
    });
  }
}

view.addEventListener('change', (event) => {
  const box = event.target.closest('[data-bill]');
  if (!box) return;
  const bill = state.bills.find((b) => b.id === box.dataset.bill);
  if (!bill) return;
  bill.paid = box.checked;
  const counter = document.getElementById('bill-count');
  if (counter) counter.textContent = `${state.bills.filter((b) => b.paid).length} of ${state.bills.length} paid`;
  box.closest('li').classList.toggle('paid', bill.paid);
});

window.addEventListener('hashchange', render);

render();

// Re-wire after every render, since render() replaces the page's nodes.
// The observer only sees mutations made after it starts watching, so the
// first wiring below covers the initial page and the observer covers the rest.
const observer = new MutationObserver(() => {
  wireDashboard();
  wirePlanner();
  wireGoals();
});
observer.observe(view, { childList: true });
wireDashboard();
wirePlanner();
wireGoals();
