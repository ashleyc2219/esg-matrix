// ── Drag & drop ───────────────────────────────────────────────────────────────
const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

function handleFile(input) {
  if (input.files[0]) processFile(input.files[0]);
}

function processFile(file) {
  showError('');
  const reader = new FileReader();
  const isCsv = file.name.toLowerCase().endsWith('.csv');
  reader.onload = e => {
    try {
      let rows;
      if (isCsv) {
        rows = e.target.result.trim().split('\n').map(r => r.split(','));
      } else {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      }

      // Validate
      if (rows.length < 2) throw new Error('檔案內容為空');
      const header = rows[0].map(h => String(h).trim());
      const required = ['議題', '面向', '衝擊程度', '發生機率'];
      const missing = required.filter(r => !header.includes(r));
      if (missing.length) throw new Error(`缺少欄位：${missing.join('、')}`);

      const iIssue  = header.indexOf('議題');
      const iCat    = header.indexOf('面向');
      const iImpact = header.indexOf('衝擊程度');
      const iProb   = header.indexOf('發生機率');

      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[iIssue]) continue;
        const cat = String(r[iCat]).trim().toUpperCase();
        if (!['G', 'E', 'S'].includes(cat))
          throw new Error(`第 ${i+1} 列「面向」欄位值無效（應為 G、E 或 S）：${r[iCat]}`);
        const impact = parseFloat(r[iImpact]);
        const prob   = parseFloat(r[iProb]);
        if (isNaN(impact) || isNaN(prob)) throw new Error(`第 ${i+1} 列數值格式錯誤`);
        data.push({ num: data.length + 1, name: String(r[iIssue]).trim(), cat, impact, prob });
      }
      if (data.length < 1)
        throw new Error('檔案中未包含任何有效資料');

      parsedData = data;
      zone.classList.add('has-file');
      const fn = document.getElementById('fileName');
      fn.style.display = 'block';
      fn.textContent = '✓ ' + file.name;
      document.getElementById('generateBtn').disabled = false;
      setStep(2);
    } catch (err) {
      showError(err.message);
      parsedData = null;
      document.getElementById('generateBtn').disabled = true;
    }
  };
  if (isCsv) reader.readAsText(file);
  else reader.readAsArrayBuffer(file);
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  if (msg) { box.style.display = 'block'; box.textContent = '⚠️ ' + msg; }
  else      { box.style.display = 'none'; }
}
