/**
 * Soft Organic Card UI — single source of truth for every client.
 * Web consumes these through the Tailwind preset; mobile reads them directly.
 */

export const palette = {
  light: {
    ground: '#F0F3EC',
    surface: '#FFFFFF',
    ink: '#20261E',
    inkSoft: '#6E7A6B',
    line: '#E4EADD',
    mint: '#B5DCA0',
    mintTint: '#EAF3E2',
    mintDeep: '#47763A',
    onMint: '#16240F',
    skySoft: '#E3ECF9',
    skyDeep: '#44699F',
    safe: '#2F855A',
    safeSoft: '#E9F6EE',
    danger: '#C05046',
    dangerSoft: '#FAEBE9',
  },
  dark: {
    ground: '#151A13',
    surface: '#1E2419',
    ink: '#E9EFE3',
    inkSoft: '#9DAA95',
    line: '#2C3527',
    mint: '#7FA968',
    mintTint: '#26301F',
    mintDeep: '#A9D48E',
    onMint: '#101708',
    skySoft: '#1D2735',
    skyDeep: '#8FB0E3',
    safe: '#63C892',
    safeSoft: '#14261B',
    danger: '#E58B82',
    dangerSoft: '#33201D',
  },
} as const;

/** Pastel tints reserved for category color-coding; always paired with an icon and label. */
export const categoryTints = {
  blossom: '#F2D8E1',
  butter: '#F4E9C8',
  lilac: '#E4DDF2',
} as const;

export const radii = {
  card: 28,
  lg: 22,
  chat: 22,
  pill: 999,
} as const;

/**
 * Asymmetric radii approximating the organic halo blob on platforms
 * without the CSS two-axis `border-radius` syntax (React Native).
 */
export const haloCorners = {
  topLeft: 46,
  topRight: 54,
  bottomRight: 52,
  bottomLeft: 48,
} as const;

export const haloRadiusCss = '46% 54% 52% 48% / 52% 46% 54% 48%';

export const shadows = {
  soft: '0 2px 6px rgba(31, 42, 26, 0.05), 0 12px 32px rgba(31, 42, 26, 0.09)',
  lift: '0 4px 10px rgba(31, 42, 26, 0.06), 0 18px 44px rgba(31, 42, 26, 0.12)',
  softDark: '0 2px 6px rgba(0, 0, 0, 0.35), 0 12px 32px rgba(0, 0, 0, 0.3)',
  liftDark: '0 4px 10px rgba(0, 0, 0, 0.4), 0 18px 44px rgba(0, 0, 0, 0.38)',
} as const;

export const motion = {
  enterMs: 220,
  exitMs: 150,
  pressScale: 0.98,
  staggerMs: 40,
} as const;

export const typography = {
  display: '"Varela Round", "SF Pro Rounded", ui-rounded, "Nunito", system-ui, sans-serif',
  body: '"Nunito Sans", "Avenir Next", "Segoe UI", system-ui, sans-serif',
  baseSizePx: 16,
  bodyLineHeight: 1.6,
  displayTracking: '-0.015em',
  labelTracking: '0.09em',
} as const;

export type PaletteMode = keyof typeof palette;
export type ColorToken = keyof (typeof palette)['light'];
