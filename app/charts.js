// DompetRumah — formatting and the charts. Everything here is plain SVG
// and HTML built from the data in data.js: no chart library, no canvas,
// no network, so the whole site works from its own files alone.

// Escape a value for use as HTML text.
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// 9929876 -> "Rp9.929.876" (Indonesian grouping: dots for thousands).
export function rp(n) {
  const neg = n < 0;
  const digits = String(Math.round(Math.abs(n)));
  return `${neg ? '−Rp' : 'Rp'}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// 9929876 -> "Rp9,93 jt", for chart labels too tight for the full figure.
export function rpShort(n) {
  if (Math.abs(n) >= 1000000) {
    return `Rp${(n / 1000000).toFixed(2).replace('.', ',')} jt`;
  }
  return rp(n);
}

// A donut of parts [{name, value}] in a warm earth palette, with the total
// in the middle and a legend with amounts. The ring always shows every
// part, however small its slice.
const PALETTE = [
  '#1d7a4f', '#d97706', '#2f6fb2', '#b44a6e', '#7a5c2e', '#4a7c59',
  '#c2611d', '#5b6abf', '#8a8d3a', '#946b54', '#3a7ca5',
];
export function donut(parts, centerTop, centerSub) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const R = 84;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = parts
    .map((p, i) => {
      const frac = p.value / total;
      const seg = `<circle cx="110" cy="110" r="${R}" class="donut-seg" stroke="${PALETTE[i % PALETTE.length]}" stroke-dasharray="${Math.max(0, frac * C - 1.5).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-offset * C).toFixed(1)}"><title>${esc(p.name)}: ${rp(p.value)} (${(frac * 100).toFixed(1)}%)</title></circle>`;
      offset += frac;
      return seg;
    })
    .join('');
  const legend = parts
    .map(
      (p, i) =>
        `<li><span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="lg-name">${esc(p.name)}</span><b>${rpShort(p.value)}</b></li>`,
    )
    .join('');
  return `<div class="donut-wrap">
  <svg class="donut" viewBox="0 0 220 220" role="img" aria-label="Donut chart of the budget">${segs}
    <text x="110" y="103" class="donut-total">${esc(centerTop)}</text>
    <text x="110" y="125" class="donut-sub">${esc(centerSub)}</text>
  </svg>
  <ul class="legend">${legend}</ul>
</div>`;
}

// Paired bars for the cash-flow months: money in (green) against money out
// (amber), scaled to the largest figure, with the month's leftover noted.
export function cashflowChart(rows) {
  const max = Math.max(...rows.map((r) => Math.max(r.income, r.spent)));
  const bar = (v, cls) =>
    `<div class="cf-track"><div class="cf-fill ${cls}" style="width:${Math.max(1, (v / max) * 100).toFixed(1)}%"></div></div>`;
  return `<div class="cf">${rows
    .map((r) => {
      const left = r.income - r.spent;
      return `<div class="cf-row">
  <div class="cf-month">${esc(r.month)}</div>
  <div class="cf-bars">${bar(r.income, 'in')}${bar(r.spent, 'out')}</div>
  <div class="cf-nums"><span class="cf-in">${rpShort(r.income)}</span><span class="cf-out">${rpShort(r.spent)}</span></div>
  <div class="cf-left ${left >= 0 ? 'pos' : 'neg'}">${left >= 0 ? '+' : ''}${rpShort(left)} left</div>
</div>`;
    })
    .join('')}</div>
<p class="cf-key"><span class="swatch" style="background:var(--green)"></span>Money in
<span class="swatch" style="background:var(--amber)"></span>Money out</p>`;
}

// One segmented bar for the needs / wants / future split, with the marks
// of the classic 50 / 30 / 20 rule drawn underneath for comparison. A
// segment only carries its name when it is wide enough to hold it; the
// caption below always spells out all three shares in full.
export function splitMeter(needs, wants, future) {
  const total = needs + wants + future || 1;
  const pn = (needs / total) * 100;
  const pw = (wants / total) * 100;
  const pf = (future / total) * 100;
  const label = (name, p) => (p >= 22 ? `${name} ${p.toFixed(0)}%` : p >= 7 ? `${p.toFixed(0)}%` : '');
  return `<div class="split">
  <div class="split-bar">
    <div class="split-seg needs" style="width:${pn.toFixed(1)}%">${label('Needs', pn)}</div>
    <div class="split-seg wants" style="width:${pw.toFixed(1)}%">${label('Wants', pw)}</div>
    <div class="split-seg future" style="width:${pf.toFixed(1)}%">${label('Future', pf)}</div>
  </div>
  <div class="split-target"><span style="left:50%"></span><span style="left:80%"></span></div>
  <div class="split-caption">Needs ${pn.toFixed(0)}% · wants ${pw.toFixed(0)}% · future ${pf.toFixed(0)}% of income.
  The marks show the classic 50 / 30 / 20 rule: needs 50%, wants 30%, future 20%.</div>
</div>`;
}

// A progress bar with a percent label, for the savings goals.
export function progress(saved, target) {
  const pct = Math.min(100, (saved / target) * 100);
  return `<div class="prog"><div class="prog-fill" style="width:${pct.toFixed(1)}%"></div></div>
  <div class="prog-label">${rp(saved)} of ${rp(target)} — <b>${pct.toFixed(0)}%</b></div>`;
}

// Actual spending against the budget, one row per category. The pale track
// is the budget; the fill is what is already spent. A line that has passed
// its budget fills in red and says by how much.
export function actualBars(rows) {
  const max = Math.max(...rows.map((r) => Math.max(r.budget, r.spent)));
  return `<div class="actuals">${rows
    .map((r) => {
      const over = r.spent - r.budget;
      const pct = Math.min(100, (r.spent / max) * 100);
      const budgetPct = Math.min(100, (r.budget / max) * 100);
      return `<div class="act-row ${over > 0 ? 'is-over' : ''}">
  <div class="act-name">${esc(r.name)}</div>
  <div class="act-track" style="--fill:${pct.toFixed(1)}%; --mark:${budgetPct.toFixed(1)}%">
    <div class="act-fill"></div><span class="act-mark"></span>
  </div>
  <div class="act-nums"><b>${rpShort(r.spent)}</b><span>of ${rpShort(r.budget)}</span>${over > 0 ? `<em>over by ${rp(over)}</em>` : ''}</div>
</div>`;
    })
    .join('')}</div>
<p class="cf-key"><span class="swatch" style="background:var(--green)"></span>Spent so far
<span class="swatch" style="background:var(--panel-2); border:1px solid var(--line)"></span>Budget line
<span class="swatch" style="background:var(--red)"></span>Over budget</p>`;
}
