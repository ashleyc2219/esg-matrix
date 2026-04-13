// ── Global state ──────────────────────────────────────────────────────────────
let parsedData = null;

// ── Step indicator ────────────────────────────────────────────────────────────
function setStep(active) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step' + i);
    el.classList.remove('active', 'done');
    if (i < active)      el.classList.add('done');
    else if (i === active) el.classList.add('active');
  }
}

// ── Axis limit resolution: fixed if data fits, data-driven otherwise ──────────
function resolveAxisLimits(data) {
  Object.assign(CFG, CFG_FIXED); // reset to fixed limits first

  const inBounds = data.every(d =>
    d.prob   >= CFG.X_MIN && d.prob   <= CFG.X_MAX &&
    d.impact >= CFG.Y_MIN && d.impact <= CFG.Y_MAX
  );
  if (inBounds) return;

  // Option B: derive limits from data with padding, snapped to 0.5 grid
  const probs   = data.map(d => d.prob);
  const impacts = data.map(d => d.impact);
  const xMin = Math.min(...probs),   xMax = Math.max(...probs);
  const yMin = Math.min(...impacts), yMax = Math.max(...impacts);
  const xPad = Math.max((xMax - xMin) * 0.15, 0.3);
  const yPad = Math.max((yMax - yMin) * 0.15, 0.3);

  CFG.X_MIN = Math.floor((xMin - xPad) * 2) / 2;
  CFG.X_MAX = Math.ceil( (xMax + xPad) * 2) / 2;
  CFG.Y_MIN = Math.floor((yMin - yPad) * 2) / 2;
  CFG.Y_MAX = Math.ceil( (yMax + yPad) * 2) / 2;
}

// ── Generate chart ────────────────────────────────────────────────────────────
function generateChart() {
  if (!parsedData) return;
  setStep(3);

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  document.getElementById('spinner').style.display = 'block';
  document.getElementById('generateLabel').textContent = '產生中…';

  setTimeout(() => {
    resolveAxisLimits(parsedData);
    drawMatrix(parsedData);
    btn.disabled = false;
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('generateLabel').textContent = '重新產生';
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('resultMeta').textContent = `共 ${parsedData.length} 個議題`;
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStep(4);
  }, 100);
}

// ── Download PNG ──────────────────────────────────────────────────────────────
function downloadPNG() {
  const canvas = document.getElementById('matrixCanvas');
  const link = document.createElement('a');
  link.download = '重大性矩陣圖.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
