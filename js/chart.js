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
  canvas.width  = CFG.W;
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

  // ── Detect overlapping points ──────────────────────────────────────────────
  const groups = {};
  data.forEach(d => {
    const key = `${d.prob.toFixed(4)},${d.impact.toFixed(4)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(d.num);
  });
  const overlapSet = new Set();
  const overlapGroups = [];
  Object.values(groups).forEach(nums => {
    if (nums.length > 1) {
      nums.forEach(n => overlapSet.add(n));
      overlapGroups.push(nums);
    }
  });

  // Pre-compute label positions for overlapping points
  const overlapOffsets = {};
  overlapGroups.forEach(nums => {
    const d0 = data.find(d => d.num === nums[0]);
    const [px, py] = dataToCanvas(d0.prob, d0.impact);
    const dirs = [
      [-55, -45], [55, 45], [-50, 50], [50, -50],
      [0, -60], [0, 60], [-60, 0], [60, 0],
    ];
    nums.forEach((n, i) => {
      const [dx, dy] = dirs[i % dirs.length];
      overlapOffsets[n] = [px + dx, py + dy];
    });
  });

  // ── Draw points & labels ───────────────────────────────────────────────────
  data.forEach(d => {
    const [px, py] = dataToCanvas(d.prob, d.impact);
    const col = COLOR[d.cat];

    // Draw marker
    ctx.save();
    ctx.fillStyle = col;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    if (d.cat === 'G') {
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (d.cat === 'E') {
      // Diamond
      ctx.beginPath();
      ctx.moveTo(px, py - 11); ctx.lineTo(px + 11, py); ctx.lineTo(px, py + 11); ctx.lineTo(px - 11, py);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      // Triangle
      ctx.beginPath();
      ctx.moveTo(px, py - 12); ctx.lineTo(px + 11, py + 8); ctx.lineTo(px - 11, py + 8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();

    // Label position
    const isOverlap = overlapSet.has(d.num);
    let lx, ly;

    if (isOverlap) {
      [lx, ly] = overlapOffsets[d.num];
      // Draw leader line
      ctx.save();
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.restore();
    } else {
      lx = px + 8;
      ly = py - 8;
    }

    // Number badge
    const label = String(d.num);
    ctx.font = 'bold 17px "Noto Sans TC", sans-serif';
    const tw = ctx.measureText(label).width;
    const bw = tw + 12, bh = 22;
    const bx = lx - (isOverlap ? bw / 2 : 0);
    const by = ly - (isOverlap ? bh / 2 : bh);

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, by, bw, bh, 4);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#222222';
    ctx.textAlign = 'center';
    ctx.fillText(label, bx + bw / 2, by + bh - 5);
    ctx.restore();
  });

  // ── Right panel: reference table ──────────────────────────────────────────
  const panelX = CFG.W - CFG.PAD_R + 16;
  const panelW = CFG.PAD_R - 24;
  const panelY = CFG.PAD_T;
  const ROW_H  = plotH / 17;
  const FONT_SIZE = Math.min(15, ROW_H * 0.48);
  const colW   = panelW / 2;

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
      ctx.beginPath();
      ctx.arc(baseX + 32, ry + ROW_H * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#333333';
      ctx.font = `${FONT_SIZE}px "Noto Sans TC", sans-serif`;
      const maxW = colW - 44;
      let name = d.name;
      while (ctx.measureText(name).width > maxW && name.length > 2) {
        name = name.slice(0, -1);
      }
      if (name !== d.name) name = name.slice(0, -1) + '…';
      ctx.fillText(name, baseX + 40, ry + ROW_H * 0.68);
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

  drawRefRows(data.slice(0, 15),  panelX);
  drawRefRows(data.slice(15, 30), panelX + colW);

  // Legend at bottom of panel
  const legendY = panelY + ROW_H * 17 + 10;
  const legendItems = [['G', '治理/經濟'], ['E', '環境'], ['S', '社會']];
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
