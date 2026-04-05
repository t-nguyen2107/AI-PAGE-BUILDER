/**
 * Shared constants used across the application.
 * Single source of truth — no duplication.
 */

/** Default color palette for StyleGuide */
export const DEFAULT_COLORS: Record<string, string> = {
  primary: '#22746e',
  secondary: '#081b22',
  accent: '#e39c37',
  background: '#ffffff',
  surface: '#f5f6f7',
  text: '#0d1f24',
  textMuted: '#6b7d83',
  border: '#d3dcdf',
  success: '#1b6d3c',
  error: '#ba1a1a',
  warning: '#8b5e00',
};

/**
 * Alternative default primary used by the project creation route.
 * Used by isDefaultStyleguide() to detect unmodified styleguides.
 */
export const PROJECT_ROUTE_DEFAULT_PRIMARY = '#081b22';

/** Gradient patterns for project thumbnails */
export const PROJECT_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
] as const;

/** Google Fonts available for StyleGuide */
export const GOOGLE_FONTS = [
  'Inter', 'Plus Jakarta Sans', 'Poppins', 'Nunito', 'DM Sans',
  'Manrope', 'Work Sans', 'Space Grotesk', 'Outfit', 'Sora',
  'Lexend', 'Epilogue', 'Spline Sans', 'Public Sans', 'Be Vietnam Pro',
  'Montserrat', 'Source Sans 3', 'IBM Plex Sans', 'Arimo', 'Rubik',
  'Geist', 'Hanken Grotesk', 'Newsreader', 'Noto Serif', 'Domine',
  'Libre Caslon Text', 'EB Garamond', 'Literata',
] as const;
