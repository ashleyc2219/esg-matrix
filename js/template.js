// ── Template download ─────────────────────────────────────────────────────────
function downloadTemplate() {
  const a = document.createElement('a');
  a.href = 'template.csv';
  a.download = '重大性矩陣_範本.csv';
  a.click();
}
