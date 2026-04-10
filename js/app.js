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

// ── Generate chart ────────────────────────────────────────────────────────────
function generateChart() {
  if (!parsedData) return;
  setStep(3);

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  document.getElementById('spinner').style.display = 'block';
  document.getElementById('generateLabel').textContent = '產生中…';

  setTimeout(() => {
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
