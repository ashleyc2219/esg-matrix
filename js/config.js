// ── Chart color palette (single source of truth: css/main.css :root) ─────────
const _css = getComputedStyle(document.documentElement);
const COLOR = {
  G: _css.getPropertyValue('--G').trim(),
  E: _css.getPropertyValue('--E').trim(),
  S: _css.getPropertyValue('--S').trim(),
};
const BG_NEG = _css.getPropertyValue('--bg-neg').trim();
const BG_POS = _css.getPropertyValue('--bg-pos').trim();

// ── Canvas / axis configuration ───────────────────────────────────────────────
const CFG = {
  W: 2040, H: 980,        // canvas px
  PAD_L: 70, PAD_R: 580,  // right panel width = 580
  PAD_T: 60, PAD_B: 100,
  X_MIN: -2.5, X_MAX: 3.5,
  Y_MIN: 1.5, Y_MAX: 3.5,
};

// Snapshot of fixed limits — used to reset before each render
const CFG_FIXED = { X_MIN: CFG.X_MIN, X_MAX: CFG.X_MAX, Y_MIN: CFG.Y_MIN, Y_MAX: CFG.Y_MAX };
