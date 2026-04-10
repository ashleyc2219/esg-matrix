// ── Chart color palette (single source of truth: css/main.css :root) ─────────
const _css   = getComputedStyle(document.documentElement);
const COLOR  = {
  G: _css.getPropertyValue('--G').trim(),
  E: _css.getPropertyValue('--E').trim(),
  S: _css.getPropertyValue('--S').trim(),
};
const BG_NEG = _css.getPropertyValue('--bg-neg').trim();
const BG_POS = _css.getPropertyValue('--bg-pos').trim();

// ── Canvas / axis configuration ───────────────────────────────────────────────
const CFG = {
  W: 1800, H: 980,        // canvas px
  PAD_L: 70, PAD_R: 340,  // right panel width = 340
  PAD_T: 60, PAD_B: 70,
  X_MIN: -2.2, X_MAX: 3.4,
  Y_MIN: 1.5,  Y_MAX: 3.3,
};
