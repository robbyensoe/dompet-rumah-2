// DompetRumah — the two canvas drawings: the budget donut and the cash-flow bars.
// Both take plain arrays and draw with the 2d context only; no library, no text
// outside the canvas, so the page stays readable even if a canvas fails.

function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

function rupiahShort(n) {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' jt';
  if (n >= 1000) return 'Rp' + Math.round(n / 1000) + ' rb';
  return 'Rp' + n;
}

// A ring of slices with the total written in the middle.
export function drawDonut(canvas, slices, centreTop, centreBottom) {
  const { ctx, width, height } = setupCanvas(canvas);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 6;
  const inner = outer * 0.62;
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = total > 0 ? (slice.value / total) * Math.PI * 2 : 0;
    if (sweep <= 0) continue;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf7';
  ctx.fill();
  ctx.fillStyle = '#2b2a24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 17px Georgia, serif';
  ctx.fillText(centreTop, cx, cy - 10);
  ctx.font = '12px Georgia, serif';
  ctx.fillStyle = '#6d675a';
  ctx.fillText(centreBottom, cx, cy + 12);
}

// Paired bars: income in green, spending in amber, one pair per month.
export function drawCashflow(canvas, rows) {
  const { ctx, width, height } = setupCanvas(canvas);
  const topPad = 18;
  const bottomPad = 24;
  const plotH = height - topPad - bottomPad;
  const maxVal = Math.max(...rows.flatMap((r) => [r.income, r.spend]));
  const gap = width / rows.length;
  const barW = Math.min(22, (gap - 14) / 2);
  rows.forEach((row, i) => {
    const groupX = gap * i + gap / 2;
    const incomeH = (row.income / maxVal) * plotH;
    const spendH = (row.spend / maxVal) * plotH;
    const base = topPad + plotH;
    ctx.fillStyle = '#1f6b4a';
    ctx.fillRect(groupX - barW - 2, base - incomeH, barW, incomeH);
    ctx.fillStyle = '#c47f17';
    ctx.fillRect(groupX + 2, base - spendH, barW, spendH);
    const diff = row.income - row.spend;
    ctx.fillStyle = diff >= 0 ? '#1f6b4a' : '#b3543f';
    ctx.font = '700 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText((diff >= 0 ? '+' : '−') + rupiahShort(Math.abs(diff)).slice(2), groupX, topPad - 4);
    ctx.fillStyle = '#6d675a';
    ctx.font = '12px Georgia, serif';
    ctx.textBaseline = 'top';
    ctx.fillText(row.month, groupX, base + 6);
  });
}
