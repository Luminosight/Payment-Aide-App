/**
 * Centralized color palette — Twitter Dim dark theme.
 * Import `Colors` in every file instead of hardcoding hex values.
 *
 * To update the app theme, change values here only.
 */
export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────
  background: '#15202B',
  surface: '#192734',
  surfaceHover: '#22303C',
  inputBg: '#202E3A',

  // ── Accent / Brand ──────────────────────────────────────
  accent: '#1D9BF0',
  accentHover: '#1A8CD8',

  // ── Text ────────────────────────────────────────────────
  textPrimary: '#E7E9EA',
  textSecondary: '#8B98A5',
  textTertiary: '#536471',

  // ── Borders ─────────────────────────────────────────────
  border: '#38444D',
  borderSubtle: '#2C3A47',

  // ── Semantic ────────────────────────────────────────────
  success: '#00BA7C',
  warning: '#FFD400',
  danger: '#F4212E',
  orange: '#FF7A00',

  // ── Static ──────────────────────────────────────────────
  white: '#FFFFFF',

  // ── Overlays / Alpha ────────────────────────────────────
  backdrop: 'rgba(0,0,0,0.6)',
  dangerBg: 'rgba(244,33,46,0.12)',
  warningBg: 'rgba(255,212,0,0.12)',
  orangeBg: 'rgba(255,122,0,0.12)',
  successBgLight: 'rgba(0,186,124,0.1)',
} as const;

export type ColorKey = keyof typeof Colors;
