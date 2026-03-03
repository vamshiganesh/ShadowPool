/**
 * ShadowPool design tokens — single source of truth for theme values.
 */

export const colors = {
  background: {
    base: '#080608',
    elevated: '#0D0A0C',
    surface: '#121014',
    overlay: 'rgba(8, 6, 8, 0.85)',
  },
  orange: {
    deep: '#AA2608',
    primary: '#C4390F',
    warm: '#B76653',
    glow: 'rgba(196, 57, 15, 0.45)',
    glowSoft: 'rgba(183, 102, 83, 0.25)',
    beam: 'rgba(196, 57, 15, 0.65)',
  },
  text: {
    primary: '#F5F0EE',
    secondary: 'rgba(245, 240, 238, 0.72)',
    muted: 'rgba(245, 240, 238, 0.48)',
    faint: 'rgba(245, 240, 238, 0.28)',
    inverse: '#080608',
  },
  border: {
    subtle: 'rgba(245, 240, 238, 0.06)',
    default: 'rgba(245, 240, 238, 0.1)',
    strong: 'rgba(245, 240, 238, 0.16)',
    orange: 'rgba(196, 57, 15, 0.35)',
    orangeStrong: 'rgba(196, 57, 15, 0.55)',
  },
  status: {
    success: '#4ADE80',
    successMuted: 'rgba(74, 222, 128, 0.15)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',
    errorMuted: 'rgba(248, 113, 113, 0.15)',
    info: '#B76653',
    infoMuted: 'rgba(183, 102, 83, 0.15)',
    pending: 'rgba(196, 57, 15, 0.85)',
    pendingMuted: 'rgba(196, 57, 15, 0.12)',
  },
} as const

export const gradients = {
  orangePrimary: 'linear-gradient(135deg, #AA2608 0%, #C4390F 50%, #B76653 100%)',
  orangeButton: 'linear-gradient(180deg, #C4390F 0%, #AA2608 100%)',
  orangeRadialTop: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(196, 57, 15, 0.35) 0%, transparent 70%)',
  orangeRadialCenter: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(196, 57, 15, 0.12) 0%, transparent 70%)',
  orangeBeam: 'conic-gradient(from 0deg, transparent, #C4390F, #B76653, transparent, transparent)',
  glassHighlight: 'linear-gradient(135deg, rgba(245, 240, 238, 0.08) 0%, transparent 50%)',
  textShimmer: 'linear-gradient(90deg, rgba(245,240,238,0.4) 0%, rgba(245,240,238,0.9) 50%, rgba(245,240,238,0.4) 100%)',
} as const

export const glass = {
  fill: 'rgba(18, 16, 20, 0.55)',
  fillStrong: 'rgba(18, 16, 20, 0.72)',
  fillLight: 'rgba(245, 240, 238, 0.03)',
  blur: '16px',
  blurStrong: '24px',
  blurLight: '8px',
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 16px rgba(0, 0, 0, 0.45)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.55)',
  glow: '0 0 40px rgba(196, 57, 15, 0.2)',
  glowStrong: '0 0 60px rgba(196, 57, 15, 0.35)',
  inner: 'inset 0 1px 0 rgba(245, 240, 238, 0.06)',
} as const

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  pill: '9999px',
} as const

export const fonts = {
  heading: '"Plus Jakarta Sans", system-ui, sans-serif',
  body: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", ui-monospace, monospace',
} as const

export const blur = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
} as const

export const motion = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  slower: '600ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const layout = {
  maxWidth: '1280px',
  navHeight: '64px',
  sidebarWidth: '240px',
  statusBarHeight: '36px',
} as const

export const tokens = {
  colors,
  gradients,
  glass,
  shadows,
  radii,
  fonts,
  blur,
  motion,
  layout,
} as const

export default tokens
