// ── Coordinate conversion ─────────────────────────────────────────────────────
function dataToCanvas(x, y) {
  const plotW = CFG.W - CFG.PAD_L - CFG.PAD_R;
  const plotH = CFG.H - CFG.PAD_T - CFG.PAD_B;
  const cx = CFG.PAD_L + (x - CFG.X_MIN) / (CFG.X_MAX - CFG.X_MIN) * plotW;
  const cy = CFG.PAD_T + (1 - (y - CFG.Y_MIN) / (CFG.Y_MAX - CFG.Y_MIN)) * plotH;
  return [cx, cy];
}

// ── Matrix drawing ────────────────────────────────────────────────────────────
function drawMatrix(data) {
  const canvas = document.getElementById('matrixCanvas');
  canvas.width = CFG.W;
  canvas.height = CFG.H;
  const ctx = canvas.getContext('2d');

  const plotW = CFG.W - CFG.PAD_L - CFG.PAD_R;
  const plotH = CFG.H - CFG.PAD_T - CFG.PAD_B;
  const [x0] = dataToCanvas(0, CFG.Y_MIN); // vertical divider x

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CFG.W, CFG.H);

  // Left (negative) background
  ctx.fillStyle = BG_NEG;
  ctx.fillRect(CFG.PAD_L, CFG.PAD_T, x0 - CFG.PAD_L, plotH);

  // Right (positive) background
  ctx.fillStyle = BG_POS;
  ctx.fillRect(x0, CFG.PAD_T, CFG.PAD_L + plotW - x0, plotH);

  // Grid lines
  ctx.strokeStyle = '#DDDDDD';
  ctx.lineWidth = 0.8;
  for (let v = Math.ceil(CFG.Y_MIN * 2) / 2; v <= CFG.Y_MAX; v += 0.5) {
    const [, cy] = dataToCanvas(0, v);
    ctx.beginPath(); ctx.moveTo(CFG.PAD_L, cy); ctx.lineTo(CFG.PAD_L + plotW, cy); ctx.stroke();
  }
  for (let v = Math.ceil(CFG.X_MIN * 2) / 2; v <= CFG.X_MAX; v += 0.5) {
    const [cx] = dataToCanvas(v, 0);
    ctx.beginPath(); ctx.moveTo(cx, CFG.PAD_T); ctx.lineTo(cx, CFG.PAD_T + plotH); ctx.stroke();
  }

  // Vertical divider
  ctx.strokeStyle = '#AAAAAA';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, CFG.PAD_T); ctx.lineTo(x0, CFG.PAD_T + plotH); ctx.stroke();

  // Axes box
  ctx.strokeStyle = '#BBBBBB';
  ctx.lineWidth = 1;
  ctx.strokeRect(CFG.PAD_L, CFG.PAD_T, plotW, plotH);

  // X-axis labels
  ctx.fillStyle = '#555555';
  ctx.font = '500 24px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';

  // Negative side
  [[-2.0, '高'], [-1.5, ''], [-1.0, '中'], [-0.5, '']].forEach(([v, lbl]) => {
    const [cx] = dataToCanvas(v, 0);
    if (lbl) { ctx.fillText(lbl, cx, CFG.PAD_T + plotH + 38); }
  });
  // Positive side
  [[0.5, ''], [1.0, '低'], [1.5, ''], [2.0, '中'], [2.5, ''], [3.0, '高']].forEach(([v, lbl]) => {
    const [cx] = dataToCanvas(v, 0);
    if (lbl) { ctx.fillText(lbl, cx, CFG.PAD_T + plotH + 38); }
  });
  // "低" at center
  const [cx0] = dataToCanvas(-0.5, 0);
  ctx.fillText('低', cx0, CFG.PAD_T + plotH + 38);

  // X-axis numeric labels (every 0.5 step)
  ctx.font = '400 16px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  for (let v = CFG.X_MIN; v <= CFG.X_MAX + 0.01; v += 0.5) {
    const val = Math.round(v * 10) / 10;
    const [cx] = dataToCanvas(val, 0);
    ctx.fillText(val.toFixed(1), cx, CFG.PAD_T + plotH + 60);
  }

  // Y-axis labels
  ctx.textAlign = 'left';
  ctx.font = '400 22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#AAAAAA';
  [[3.0, '大'], [2.5, '中'], [2.0, '小']].forEach(([v, lbl]) => {
    const [, cy] = dataToCanvas(0, v);
    ctx.fillText(lbl, CFG.PAD_L + 6, cy + 8);
  });

  // Y-axis numeric labels (below 大/中/小)
  ctx.font = '400 16px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#BBBBBB';
  [[3.0, '3.0'], [2.5, '2.5'], [2.0, '2.0']].forEach(([v, num]) => {
    const [, cy] = dataToCanvas(0, v);
    ctx.fillText(num, CFG.PAD_L + 6, cy + 26);
  });

  // Axis titles
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 26px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('發生機率', CFG.PAD_L + plotW / 2, CFG.H - 14);

  ctx.save();
  ctx.translate(22, CFG.PAD_T + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('衝擊程度', 0, 0);
  ctx.restore();

  // 負面 / 正面 labels
  ctx.font = 'bold 26px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#777777';
  ctx.textAlign = 'center';
  const negMid = (CFG.PAD_L + x0) / 2;
  const posMid = (x0 + CFG.PAD_L + plotW) / 2;
  ctx.fillText('負面', negMid, CFG.PAD_T + plotH - 14);
  ctx.fillText('正面', posMid, CFG.PAD_T + plotH - 14);

  // Chart title
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 34px "DM Serif Display", "Noto Sans TC", serif';
  ctx.textAlign = 'left';
  ctx.fillText('重大性矩陣圖', CFG.PAD_L, CFG.PAD_T - 18);

  // ── Phase 1: draw dots ────────────────────────────────────────────────────
  data.forEach(d => {
    const [px, py] = dataToCanvas(d.prob, d.impact);
    const col = COLOR[d.cat];
    ctx.save();
    ctx.fillStyle = col;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    if (d.cat === 'G') {
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (d.cat === 'E') {
      ctx.beginPath();
      ctx.moveTo(px, py - 11); ctx.lineTo(px + 11, py); ctx.lineTo(px, py + 11); ctx.lineTo(px - 11, py);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(px, py - 12); ctx.lineTo(px + 11, py + 8); ctx.lineTo(px - 11, py + 8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  });

  // ── Phase 2: measure badge sizes & set initial positions ─────────────────
  // Labels sharing the same anchor are fanned out so repulsion has a non-zero
  // direction to work with from the very first iteration.
  const INIT_DIRS = [
    [10, -10], [-10, -10], [10, 10], [-10, 10],
    [0, -14], [14, 0], [0, 14], [-14, 0],
  ];
  const anchorCount = {};
  ctx.font = 'bold 17px "Noto Sans TC", sans-serif';
  const labels = data.map(d => {
    const [ax, ay] = dataToCanvas(d.prob, d.impact);
    const key = `${ax.toFixed(1)},${ay.toFixed(1)}`;
    const idx = anchorCount[key] = (anchorCount[key] ?? 0);
    anchorCount[key]++;
    const [odx, ody] = INIT_DIRS[idx % INIT_DIRS.length];
    const w = ctx.measureText(String(d.num)).width + 12, h = 22;
    return { num: d.num, cat: d.cat, ax, ay, x: ax + odx, y: ay + ody - h, w, h };
  });

  // ── Phase 3: force-directed label placement ───────────────────────────────
  const ITERS = 300;
  const SPRING_K = 0.03;
  const SPRING_REST = 18;
  const DOT_RADIUS = 14;

  for (let iter = 0; iter < ITERS; iter++) {
    // Label–label repulsion
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + 3;
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + 3;
        if (ox > 0 && oy > 0) {
          let dx = (a.x + a.w / 2) - (b.x + b.w / 2);
          let dy = (a.y + a.h / 2) - (b.y + b.h / 2);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          dx /= dist; dy /= dist;
          const f = Math.min(ox, oy) * 0.6;
          a.x += dx * f; a.y += dy * f;
          b.x -= dx * f; b.y -= dy * f;
        }
      }
    }

    // Label–dot repulsion
    for (const l of labels) {
      for (const d of data) {
        const [dpx, dpy] = dataToCanvas(d.prob, d.impact);
        let dx = (l.x + l.w / 2) - dpx, dy = (l.y + l.h / 2) - dpy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = DOT_RADIUS + Math.max(l.w, l.h) / 2;
        if (dist < minDist) {
          dx /= dist; dy /= dist;
          const f = (minDist - dist) * 0.5;
          l.x += dx * f; l.y += dy * f;
        }
      }
    }

    // Spring back toward anchor
    for (const l of labels) {
      let dx = (l.x + l.w / 2) - l.ax, dy = (l.y + l.h / 2) - l.ay;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist > SPRING_REST) {
        const pull = SPRING_K * (dist - SPRING_REST);
        l.x -= (dx / dist) * pull; l.y -= (dy / dist) * pull;
      }
    }

    // Clamp to plot area
    for (const l of labels) {
      l.x = Math.max(CFG.PAD_L + 2, Math.min(l.x, CFG.PAD_L + plotW - l.w - 2));
      l.y = Math.max(CFG.PAD_T + 2, Math.min(l.y, CFG.PAD_T + plotH - l.h - 2));
    }
  }

  // ── Phase 4: draw leader lines & badges ──────────────────────────────────
  labels.forEach(l => {
    const lcx = l.x + l.w / 2, lcy = l.y + l.h / 2;
    const dist = Math.sqrt((lcx - l.ax) ** 2 + (lcy - l.ay) ** 2);
    if (dist > SPRING_REST) {
      ctx.save();
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(l.ax, l.ay); ctx.lineTo(lcx, lcy); ctx.stroke();
      ctx.restore();
    }
    const col = COLOR[l.cat];
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    roundRect(ctx, l.x, l.y, l.w, l.h, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 17px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(l.num), lcx, l.y + l.h - 5);
    ctx.restore();
  });

  // ── Right panel: reference table ──────────────────────────────────────────
  const panelX = CFG.W - CFG.PAD_R + 16;
  const panelW = CFG.PAD_R - 24;
  const panelY = CFG.PAD_T;
  const half = Math.ceil(data.length / 2);
  const ROW_H = plotH / (half + 1);
  const FONT_SIZE = Math.min(15, ROW_H * 0.48);
  const colW = panelW / 2;

  // Panel title
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('議題編號對照表', panelX + panelW / 2, panelY - 10);

  function drawRefRows(rows, baseX) {
    rows.forEach((d, i) => {
      const ry = panelY + ROW_H * (i + 1);
      ctx.fillStyle = i % 2 === 0 ? '#F7F7F7' : '#FFFFFF';
      ctx.fillRect(baseX, ry, colW - 4, ROW_H);

      ctx.font = `bold ${FONT_SIZE}px "Noto Sans TC", sans-serif`;
      ctx.fillStyle = COLOR[d.cat];
      ctx.textAlign = 'left';
      ctx.fillText(String(d.num).padStart(2, '0'), baseX + 4, ry + ROW_H * 0.68);

      ctx.fillStyle = COLOR[d.cat];
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const ix = baseX + 32, iy = ry + ROW_H * 0.5;
      ctx.beginPath();
      if (d.cat === 'G') {
        ctx.arc(ix, iy, 5, 0, Math.PI * 2);
      } else if (d.cat === 'E') {
        ctx.moveTo(ix, iy - 6); ctx.lineTo(ix + 6, iy); ctx.lineTo(ix, iy + 6); ctx.lineTo(ix - 6, iy);
        ctx.closePath();
      } else {
        ctx.moveTo(ix, iy - 6); ctx.lineTo(ix + 6, iy + 5); ctx.lineTo(ix - 6, iy + 5);
        ctx.closePath();
      }
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#333333';
      ctx.font = `${FONT_SIZE}px "Noto Sans TC", sans-serif`;
      ctx.fillText(d.name, baseX + 40, ry + ROW_H * 0.68);
    });
  }

  // Column headers
  ctx.fillStyle = '#2F4F7F';
  ctx.fillRect(panelX, panelY, colW - 4, ROW_H);
  ctx.fillRect(panelX + colW, panelY, colW - 4, ROW_H);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${FONT_SIZE}px "Noto Sans TC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('編號　議題', panelX + colW / 2, panelY + ROW_H * 0.68);
  ctx.fillText('編號　議題', panelX + colW + colW / 2, panelY + ROW_H * 0.68);

  drawRefRows(data.slice(0, half), panelX);
  drawRefRows(data.slice(half), panelX + colW);

  // Legend at bottom of panel
  const legendY = panelY + ROW_H * (half + 1) + 10;
  const legendItems = [['G', 'G 治理/經濟'], ['E', 'E 環境'], ['S', 'S 社會']];
  ctx.font = `500 18px "Noto Sans TC", sans-serif`;
  ctx.textAlign = 'left';
  let lx2 = panelX;
  legendItems.forEach(([cat, lbl]) => {
    ctx.fillStyle = COLOR[cat];
    ctx.beginPath(); ctx.arc(lx2 + 8, legendY + 9, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555555';
    ctx.fillText(lbl, lx2 + 18, legendY + 15);
    lx2 += ctx.measureText(lbl).width + 50;
  });
}

// ── Utility: rounded rectangle path ──────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
