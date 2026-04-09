/**
 * Design Knowledge — static constants extracted from ui-ux-pro-max reference data.
 *
 * Zero latency, zero cost — injected directly into prompts at build time.
 * Covers: color palettes, design styles, landing patterns, typography, and product reasoning.
 *
 * Source: .ref_stuff/ui-ux-pro-max-skill/src/ui-ux-pro-max/data/
 */

// ─── Color Palettes (from colors.csv) ─────────────────────────────────────────
// Maps detected business types → complete shadcn-compatible color token system.
// All colors are WCAG-compliant with on-color pairings pre-validated.

export interface ColorPalette {
  primary: string;
  onPrimary: string;
  secondary: string;
  accent: string;
  onAccent: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  note: string;
}

export const PRODUCT_COLOR_PALETTES: Record<string, ColorPalette> = {
  'SaaS/technology': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#1E293B', card: '#FFFFFF', muted: '#E9EFF8',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Trust blue + orange CTA contrast',
  },
  'e-commerce/store': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#ECFDF5',
    foreground: '#064E3B', card: '#FFFFFF', muted: '#E8F1F3',
    mutedForeground: '#64748B', border: '#A7F3D0',
    note: 'Success green + urgency orange',
  },
  'e-commerce/luxury': {
    primary: '#1C1917', onPrimary: '#FFFFFF', secondary: '#44403C',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FAFAF9',
    foreground: '#0C0A09', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#D6D3D1',
    note: 'Premium dark + gold accent',
  },
  'restaurant/dining': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#F87171',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FEF2F2',
    foreground: '#450A0A', card: '#FFFFFF', muted: '#F0EDF1',
    mutedForeground: '#64748B', border: '#FECACA',
    note: 'Appetizing red + warm gold',
  },
  'bakery/pastry shop': {
    primary: '#92400E', onPrimary: '#FFFFFF', secondary: '#B45309',
    accent: '#92400E', onAccent: '#FFFFFF', background: '#FEF3C7',
    foreground: '#78350F', card: '#FFFFFF', muted: '#EDEEF0',
    mutedForeground: '#64748B', border: '#FDE68A',
    note: 'Warm brown + cream white, artisanal feel',
  },
  'coffee shop/cafe': {
    primary: '#92400E', onPrimary: '#FFFFFF', secondary: '#B45309',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FEF3C7',
    foreground: '#78350F', card: '#FFFFFF', muted: '#EDEEF0',
    mutedForeground: '#64748B', border: '#FDE68A',
    note: 'Warm brown + fresh green, cozy feel',
  },
  'spa/wellness': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F9A8D4',
    accent: '#8B5CF6', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F1EEF5',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Soft pink + lavender luxury',
  },
  'fitness/gym': {
    primary: '#F97316', onPrimary: '#0F172A', secondary: '#FB923C',
    accent: '#22C55E', onAccent: '#0F172A', background: '#1F2937',
    foreground: '#F8FAFC', card: '#313742', muted: '#37414F',
    mutedForeground: '#94A3B8', border: '#374151',
    note: 'Energy orange + success green on dark',
  },
  'real estate': {
    primary: '#0F766E', onPrimary: '#FFFFFF', secondary: '#14B8A6',
    accent: '#0369A1', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F0F3',
    mutedForeground: '#64748B', border: '#99F6E4',
    note: 'Trust teal + professional blue',
  },
  'education/training': {
    primary: '#4F46E5', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#1E1B4B', card: '#FFFFFF', muted: '#EBEEF8',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Playful indigo + energetic orange',
  },
  'healthcare/medical': {
    primary: '#0891B2', onPrimary: '#FFFFFF', secondary: '#22D3EE',
    accent: '#059669', onAccent: '#FFFFFF', background: '#ECFEFF',
    foreground: '#164E63', card: '#FFFFFF', muted: '#E8F1F6',
    mutedForeground: '#64748B', border: '#A5F3FC',
    note: 'Calm cyan + health green',
  },
  'fashion/clothing': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F1EEF5',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Bold pink + cyan accent',
  },
  'travel/hospitality': {
    primary: '#0EA5E9', onPrimary: '#0F172A', secondary: '#38BDF8',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E8F2F8',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Sky blue + adventure orange',
  },
  'law firm/legal': {
    primary: '#1E3A8A', onPrimary: '#FFFFFF', secondary: '#1E40AF',
    accent: '#B45309', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#E9EEF5',
    mutedForeground: '#64748B', border: '#CBD5C1',
    note: 'Authority navy + trust gold',
  },
  'construction/architecture': {
    primary: '#64748B', onPrimary: '#FFFFFF', secondary: '#94A3B8',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#334155', card: '#FFFFFF', muted: '#EBF0F5',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Industrial grey + safety orange',
  },
  'personal portfolio': {
    primary: '#18181B', onPrimary: '#FFFFFF', secondary: '#3F3F46',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FAFAFA',
    foreground: '#09090B', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#E4E4E7',
    note: 'Monochrome + blue accent',
  },
  'creative agency': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F1EEF5',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Bold pink + creative cyan',
  },
  'blog/media': {
    primary: '#18181B', onPrimary: '#FFFFFF', secondary: '#3F3F46',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#FAFAFA',
    foreground: '#09090B', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#E4E4E7',
    note: 'Editorial black + accent pink',
  },
  'nonprofit/charity': {
    primary: '#0891B2', onPrimary: '#FFFFFF', secondary: '#22D3EE',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#ECFEFF',
    foreground: '#164E63', card: '#FFFFFF', muted: '#E8F1F6',
    mutedForeground: '#64748B', border: '#A5F3FC',
    note: 'Compassion blue + action orange',
  },
  'event/conference': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#4C1D95', card: '#FFFFFF', muted: '#ECEEF9',
    mutedForeground: '#64748B', border: '#DDD6FE',
    note: 'Excitement purple + action orange',
  },
  'crypto/web3': {
    primary: '#F59E0B', onPrimary: '#0F172A', secondary: '#FBBF24',
    accent: '#8B5CF6', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#F8FAFC', card: '#222735', muted: '#272F42',
    mutedForeground: '#94A3B8', border: '#334155',
    note: 'Gold trust + purple tech, dark mode',
  },
  'B2B/service': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#0369A1', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#020617', card: '#FFFFFF', muted: '#E8ECF1',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Professional navy + blue CTA',
  },
  'productivity/tool': {
    primary: '#0D9488', onPrimary: '#FFFFFF', secondary: '#14B8A6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F1F4',
    mutedForeground: '#64748B', border: '#99F6E4',
    note: 'Teal focus + action orange',
  },
  'AI/chatbot': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#1E1B4B', card: '#FFFFFF', muted: '#ECEEF9',
    mutedForeground: '#64748B', border: '#DDD6FE',
    note: 'AI purple + cyan interactions',
  },
  'food/delivery': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#F97316',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF7ED',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F0',
    mutedForeground: '#64748B', border: '#FCEAE1',
    note: 'Appetizing orange + trust blue',
  },
  'music/podcast': {
    primary: '#1E1B4B', onPrimary: '#FFFFFF', secondary: '#312E81',
    accent: '#F97316', onAccent: '#0F172A', background: '#0F0F23',
    foreground: '#F8FAFC', card: '#1B1B30', muted: '#27273B',
    mutedForeground: '#94A3B8', border: '#4338CA',
    note: 'Dark audio + warm accent',
  },
  'Micro SaaS': {
    primary: '#6366F1', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F5F3FF',
    foreground: '#1E1B4B', card: '#FFFFFF', muted: '#EBEFF9',
    mutedForeground: '#64748B', border: '#E0E7FF',
    note: 'Indigo primary + emerald CTA',
  },
  'B2B': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#0369A1', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#020617', card: '#FFFFFF', muted: '#E8ECF1',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Professional navy + blue CTA',
  },
  'Financial': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#1E293B',
    accent: '#22C55E', onAccent: '#0F172A', background: '#020617',
    foreground: '#F8FAFC', card: '#0E1223', muted: '#1A1E2F',
    mutedForeground: '#94A3B8', border: '#334155',
    note: 'Dark bg + green positive indicators',
  },
  'Analytics': {
    primary: '#1E40AF', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#1E3A8A', card: '#FFFFFF', muted: '#E9EEF6',
    mutedForeground: '#64748B', border: '#DBEAFE',
    note: 'Blue data + amber highlights',
  },
  'Healthcare': {
    primary: '#0891B2', onPrimary: '#FFFFFF', secondary: '#22D3EE',
    accent: '#059669', onAccent: '#FFFFFF', background: '#ECFEFF',
    foreground: '#164E63', card: '#FFFFFF', muted: '#E8F1F6',
    mutedForeground: '#64748B', border: '#A5F3FC',
    note: 'Calm cyan + health green',
  },
  'Educational': {
    primary: '#4F46E5', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#1E1B4B', card: '#FFFFFF', muted: '#EBEEF8',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Playful indigo + energetic orange',
  },
  'Gaming': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#F43F5E', onAccent: '#FFFFFF', background: '#0F0F23',
    foreground: '#E2E8F0', card: '#1E1C35', muted: '#27273B',
    mutedForeground: '#94A3B8', border: '#4C1D95',
    note: 'Neon purple + rose action',
  },
  'Government/Public': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#0369A1', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#020617', card: '#FFFFFF', muted: '#E8ECF1',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'High contrast navy + blue',
  },
  'Social Media': {
    primary: '#E11D48', onPrimary: '#FFFFFF', secondary: '#FB7185',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF1F2',
    foreground: '#881337', card: '#FFFFFF', muted: '#F0ECF2',
    mutedForeground: '#64748B', border: '#FECDD3',
    note: 'Vibrant rose + engagement blue',
  },
  'Productivity': {
    primary: '#0D9488', onPrimary: '#FFFFFF', secondary: '#14B8A6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F1F4',
    mutedForeground: '#64748B', border: '#99F6E4',
    note: 'Teal focus + action orange',
  },
  'Design System/Component Library': {
    primary: '#4F46E5', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#312E81', card: '#FFFFFF', muted: '#EBEEF8',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Indigo brand + doc hierarchy',
  },
  'NFT/Web3': {
    primary: '#8B5CF6', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#FBBF24', onAccent: '#0F172A', background: '#0F0F23',
    foreground: '#F8FAFC', card: '#1E1D35', muted: '#27273B',
    mutedForeground: '#94A3B8', border: '#4C1D95',
    note: 'Purple tech + gold value',
  },
  'Creator Economy': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F1EEF5',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Creator pink + engagement orange',
  },
  'Remote Work/Collaboration': {
    primary: '#6366F1', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F5F3FF',
    foreground: '#312E81', card: '#FFFFFF', muted: '#EBEFF9',
    mutedForeground: '#64748B', border: '#E0E7FF',
    note: 'Calm indigo + success green',
  },
  'Mental Health': {
    primary: '#8B5CF6', onPrimary: '#FFFFFF', secondary: '#C4B5FD',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#4C1D95', card: '#FFFFFF', muted: '#EDEFF9',
    mutedForeground: '#64748B', border: '#EDE9FE',
    note: 'Calming lavender + wellness green',
  },
  'Pet Tech': {
    primary: '#F97316', onPrimary: '#0F172A', secondary: '#FB923C',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF7ED',
    foreground: '#9A3412', card: '#FFFFFF', muted: '#F1F0F0',
    mutedForeground: '#64748B', border: '#FED7AA',
    note: 'Playful orange + trust blue',
  },
  'Smart Home/IoT': {
    primary: '#1E293B', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#22C55E', onAccent: '#0F172A', background: '#0F172A',
    foreground: '#F8FAFC', card: '#1B2336', muted: '#272F42',
    mutedForeground: '#94A3B8', border: '#475569',
    note: 'Dark tech + status green',
  },
  'EV/Charging Ecosystem': {
    primary: '#0891B2', onPrimary: '#FFFFFF', secondary: '#22D3EE',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#ECFEFF',
    foreground: '#164E63', card: '#FFFFFF', muted: '#E8F1F6',
    mutedForeground: '#64748B', border: '#A5F3FC',
    note: 'Electric cyan + eco green',
  },
  'Subscription Box': {
    primary: '#D946EF', onPrimary: '#FFFFFF', secondary: '#E879F9',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#FDF4FF',
    foreground: '#86198F', card: '#FFFFFF', muted: '#F0EEF9',
    mutedForeground: '#64748B', border: '#F5D0FE',
    note: 'Excitement purple + urgency orange',
  },
  'Podcast': {
    primary: '#1E1B4B', onPrimary: '#FFFFFF', secondary: '#312E81',
    accent: '#F97316', onAccent: '#0F172A', background: '#0F0F23',
    foreground: '#F8FAFC', card: '#1B1B30', muted: '#27273B',
    mutedForeground: '#94A3B8', border: '#4338CA',
    note: 'Dark audio + warm accent',
  },
  'Dating': {
    primary: '#E11D48', onPrimary: '#FFFFFF', secondary: '#FB7185',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#FFF1F2',
    foreground: '#881337', card: '#FFFFFF', muted: '#F0ECF2',
    mutedForeground: '#64748B', border: '#FECDD3',
    note: 'Romantic rose + warm orange',
  },
  'Micro-Credentials/Badges': {
    primary: '#0369A1', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E7EFF5',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Trust blue + achievement gold',
  },
  'Knowledge Base/Documentation': {
    primary: '#475569', onPrimary: '#FFFFFF', secondary: '#64748B',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#1E293B', card: '#FFFFFF', muted: '#EAEFF3',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Neutral grey + link blue',
  },
  'Hyperlocal Services': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#ECFDF5',
    foreground: '#064E3B', card: '#FFFFFF', muted: '#E8F1F3',
    mutedForeground: '#64748B', border: '#A7F3D0',
    note: 'Location green + action orange',
  },
  'Luxury/Premium Brand': {
    primary: '#1C1917', onPrimary: '#FFFFFF', secondary: '#44403C',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FAFAF9',
    foreground: '#0C0A09', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#D6D3D1',
    note: 'Premium black + gold accent',
  },
  'Hotel/Hospitality': {
    primary: '#1E3A8A', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#1E40AF', card: '#FFFFFF', muted: '#E9EEF5',
    mutedForeground: '#64748B', border: '#BFDBFE',
    note: 'Luxury navy + gold service',
  },
  'Wedding/Event Planning': {
    primary: '#DB2777', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F0EDF4',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Romantic pink + elegant gold',
  },
  'Insurance': {
    primary: '#0369A1', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E7EFF5',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Security blue + protected green',
  },
  'Banking/Traditional Finance': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#1E3A8A',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#020617', card: '#FFFFFF', muted: '#E8ECF1',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Trust navy + premium gold',
  },
  'Online Course/E-learning': {
    primary: '#0D9488', onPrimary: '#FFFFFF', secondary: '#2DD4BF',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F1F4',
    mutedForeground: '#64748B', border: '#5EEAD4',
    note: 'Progress teal + achievement orange',
  },
  'Video Streaming/OTT': {
    primary: '#0F0F23', onPrimary: '#FFFFFF', secondary: '#1E1B4B',
    accent: '#E11D48', onAccent: '#FFFFFF', background: '#000000',
    foreground: '#F8FAFC', card: '#0C0C0D', muted: '#181818',
    mutedForeground: '#94A3B8', border: '#312E81',
    note: 'Cinema dark + play red',
  },
  'Job Board/Recruitment': {
    primary: '#0369A1', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E7EFF5',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Professional blue + success green',
  },
  'Marketplace (P2P)': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#4C1D95', card: '#FFFFFF', muted: '#ECEEF9',
    mutedForeground: '#64748B', border: '#DDD6FE',
    note: 'Trust purple + transaction green',
  },
  'Logistics/Delivery': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EFF6FF',
    foreground: '#1E40AF', card: '#FFFFFF', muted: '#E9EFF8',
    mutedForeground: '#64748B', border: '#BFDBFE',
    note: 'Tracking blue + delivery orange',
  },
  'Agriculture/Farm Tech': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#22C55E',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#F0FDF4',
    foreground: '#14532D', card: '#FFFFFF', muted: '#E8F0F1',
    mutedForeground: '#64748B', border: '#BBF7D0',
    note: 'Earth green + harvest gold',
  },
  'Automotive/Car Dealership': {
    primary: '#1E293B', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#E9EDF1',
    mutedForeground: '#64748B', border: '#E2E8F0',
    note: 'Premium dark + action red',
  },
  'Photography Studio': {
    primary: '#18181B', onPrimary: '#FFFFFF', secondary: '#27272A',
    accent: '#F8FAFC', onAccent: '#0F172A', background: '#000000',
    foreground: '#FAFAFA', card: '#0C0C0C', muted: '#181818',
    mutedForeground: '#94A3B8', border: '#3F3F46',
    note: 'Pure black + white contrast',
  },
  'Coworking Space': {
    primary: '#F59E0B', onPrimary: '#0F172A', secondary: '#FBBF24',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#78350F', card: '#FFFFFF', muted: '#F1F2EF',
    mutedForeground: '#64748B', border: '#FDE68A',
    note: 'Energetic amber + booking blue',
  },
  'Home Services (Plumber/Electrician)': {
    primary: '#1E40AF', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EFF6FF',
    foreground: '#1E3A8A', card: '#FFFFFF', muted: '#E9EEF6',
    mutedForeground: '#64748B', border: '#BFDBFE',
    note: 'Professional blue + urgent orange',
  },
  'Childcare/Daycare': {
    primary: '#F472B6', onPrimary: '#0F172A', secondary: '#FBCFE8',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#9D174D', card: '#FFFFFF', muted: '#F1F0F6',
    mutedForeground: '#64748B', border: '#FCE7F3',
    note: 'Soft pink + safe green',
  },
  'Senior Care/Elderly': {
    primary: '#0369A1', onPrimary: '#FFFFFF', secondary: '#38BDF8',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E7EFF5',
    mutedForeground: '#64748B', border: '#E0F2FE',
    note: 'Calm blue + reassuring green',
  },
  'Medical Clinic': {
    primary: '#0891B2', onPrimary: '#FFFFFF', secondary: '#22D3EE',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F1F6',
    mutedForeground: '#64748B', border: '#CCFBF1',
    note: 'Medical teal + health green',
  },
  'Pharmacy/Drug Store': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#22C55E',
    accent: '#0369A1', onAccent: '#FFFFFF', background: '#F0FDF4',
    foreground: '#14532D', card: '#FFFFFF', muted: '#E8F0F1',
    mutedForeground: '#64748B', border: '#BBF7D0',
    note: 'Pharmacy green + trust blue',
  },
  'Dental Practice': {
    primary: '#0EA5E9', onPrimary: '#0F172A', secondary: '#38BDF8',
    accent: '#0EA5E9', onAccent: '#0F172A', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E8F2F8',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Fresh blue + smile yellow',
  },
  'Veterinary Clinic': {
    primary: '#0D9488', onPrimary: '#FFFFFF', secondary: '#14B8A6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0FDFA',
    foreground: '#134E4A', card: '#FFFFFF', muted: '#E8F1F4',
    mutedForeground: '#64748B', border: '#99F6E4',
    note: 'Caring teal + warm orange',
  },
  'Florist/Plant Shop': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#22C55E',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#F0FDF4',
    foreground: '#14532D', card: '#FFFFFF', muted: '#E8F0F1',
    mutedForeground: '#64748B', border: '#BBF7D0',
    note: 'Natural green + floral pink',
  },
  'Brewery/Winery': {
    primary: '#7C2D12', onPrimary: '#FFFFFF', secondary: '#B91C1C',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FEF2F2',
    foreground: '#450A0A', card: '#FFFFFF', muted: '#ECEDF0',
    mutedForeground: '#64748B', border: '#FECACA',
    note: 'Deep burgundy + craft gold',
  },
  'Airline': {
    primary: '#1E3A8A', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#EFF6FF',
    foreground: '#1E40AF', card: '#FFFFFF', muted: '#E9EEF5',
    mutedForeground: '#64748B', border: '#BFDBFE',
    note: 'Sky blue + booking orange',
  },
  'News/Media': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#EF4444',
    accent: '#1E40AF', onAccent: '#FFFFFF', background: '#FEF2F2',
    foreground: '#450A0A', card: '#FFFFFF', muted: '#F0EDF1',
    mutedForeground: '#64748B', border: '#FECACA',
    note: 'Breaking red + link blue',
  },
  'Freelancer': {
    primary: '#6366F1', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#312E81', card: '#FFFFFF', muted: '#EBEFF9',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Creative indigo + hire green',
  },
  'Marketing Agency': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#831843', card: '#FFFFFF', muted: '#F1EEF5',
    mutedForeground: '#64748B', border: '#FBCFE8',
    note: 'Bold pink + creative cyan',
  },
  'Membership/Community': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#4C1D95', card: '#FFFFFF', muted: '#ECEEF9',
    mutedForeground: '#64748B', border: '#DDD6FE',
    note: 'Community purple + join green',
  },
  'Newsletter': {
    primary: '#0369A1', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E7EFF5',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'Trust blue + subscribe orange',
  },
  'Digital Products/Downloads': {
    primary: '#6366F1', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#312E81', card: '#FFFFFF', muted: '#EBEFF9',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Digital indigo + buy green',
  },
  'Church/Religious Organization': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#A78BFA',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#4C1D95', card: '#FFFFFF', muted: '#ECEEF9',
    mutedForeground: '#64748B', border: '#DDD6FE',
    note: 'Spiritual purple + warm gold',
  },
  'Sports Team/Club': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#EF4444',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#FEF2F2',
    foreground: '#7F1D1D', card: '#FFFFFF', muted: '#F0EDF1',
    mutedForeground: '#64748B', border: '#FECACA',
    note: 'Team red + championship gold',
  },
  'Museum/Gallery': {
    primary: '#18181B', onPrimary: '#FFFFFF', secondary: '#27272A',
    accent: '#18181B', onAccent: '#FFFFFF', background: '#FAFAFA',
    foreground: '#09090B', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#E4E4E7',
    note: 'Gallery black + white space',
  },
  'Theater/Cinema': {
    primary: '#1E1B4B', onPrimary: '#FFFFFF', secondary: '#312E81',
    accent: '#CA8A04', onAccent: '#0F172A', background: '#0F0F23',
    foreground: '#F8FAFC', card: '#1B1B30', muted: '#27273B',
    mutedForeground: '#94A3B8', border: '#4338CA',
    note: 'Dramatic dark + spotlight gold',
  },
  'Language Learning': {
    primary: '#4F46E5', onPrimary: '#FFFFFF', secondary: '#818CF8',
    accent: '#16A34A', onAccent: '#FFFFFF', background: '#EEF2FF',
    foreground: '#312E81', card: '#FFFFFF', muted: '#EBEEF8',
    mutedForeground: '#64748B', border: '#C7D2FE',
    note: 'Learning indigo + progress green',
  },
  'Coding Bootcamp': {
    primary: '#0F172A', onPrimary: '#FFFFFF', secondary: '#1E293B',
    accent: '#22C55E', onAccent: '#0F172A', background: '#020617',
    foreground: '#F8FAFC', card: '#0E1223', muted: '#1A1E2F',
    mutedForeground: '#94A3B8', border: '#334155',
    note: 'Terminal dark + success green',
  },
  'Cybersecurity': {
    primary: '#00FF41', onPrimary: '#0F172A', secondary: '#0D0D0D',
    accent: '#FF3333', onAccent: '#FFFFFF', background: '#000000',
    foreground: '#E0E0E0', card: '#0C130E', muted: '#181818',
    mutedForeground: '#94A3B8', border: '#1F1F1F',
    note: 'Matrix green + alert red',
  },
  'Developer Tool/IDE': {
    primary: '#1E293B', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#22C55E', onAccent: '#0F172A', background: '#0F172A',
    foreground: '#F8FAFC', card: '#1B2336', muted: '#272F42',
    mutedForeground: '#94A3B8', border: '#475569',
    note: 'Code dark + run green',
  },
  'Biotech/Life Sciences': {
    primary: '#0EA5E9', onPrimary: '#0F172A', secondary: '#0284C7',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0C4A6E', card: '#FFFFFF', muted: '#E8F2F8',
    mutedForeground: '#64748B', border: '#BAE6FD',
    note: 'DNA blue + life green',
  },
  'Space Tech/Aerospace': {
    primary: '#F8FAFC', onPrimary: '#0F172A', secondary: '#94A3B8',
    accent: '#3B82F6', onAccent: '#FFFFFF', background: '#0B0B10',
    foreground: '#F8FAFC', card: '#1E1E23', muted: '#232328',
    mutedForeground: '#94A3B8', border: '#1E293B',
    note: 'Star white + launch blue',
  },
  'Architecture/Interior': {
    primary: '#171717', onPrimary: '#FFFFFF', secondary: '#404040',
    accent: '#A16207', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#171717', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#E5E5E5',
    note: 'Minimal black + accent gold',
  },
  'Quantum Computing Interface': {
    primary: '#00FFFF', onPrimary: '#0F172A', secondary: '#7B61FF',
    accent: '#FF00FF', onAccent: '#FFFFFF', background: '#050510',
    foreground: '#E0E0FF', card: '#101823', muted: '#1D1D28',
    mutedForeground: '#94A3B8', border: '#333344',
    note: 'Quantum cyan + interference purple',
  },
  'Biohacking/Longevity': {
    primary: '#FF4D4D', onPrimary: '#FFFFFF', secondary: '#4D94FF',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F5F5F7',
    foreground: '#1C1C1E', card: '#FFFFFF', muted: '#F2EEF2',
    mutedForeground: '#64748B', border: '#E5E5EA',
    note: 'Bio red/blue + vitality green',
  },
  'Autonomous Drone Fleet': {
    primary: '#00FF41', onPrimary: '#0F172A', secondary: '#008F11',
    accent: '#FF3333', onAccent: '#FFFFFF', background: '#0D1117',
    foreground: '#E6EDF3', card: '#182424', muted: '#25292F',
    mutedForeground: '#94A3B8', border: '#30363D',
    note: 'Terminal green + alert red',
  },
  'Generative Art': {
    primary: '#18181B', onPrimary: '#FFFFFF', secondary: '#3F3F46',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#FAFAFA',
    foreground: '#09090B', card: '#FFFFFF', muted: '#E8ECF0',
    mutedForeground: '#64748B', border: '#E4E4E7',
    note: 'Canvas neutral + creative pink',
  },
  'Spatial Computing OS/App': {
    primary: '#FFFFFF', onPrimary: '#0F172A', secondary: '#E5E5E5',
    accent: '#FFFFFF', onAccent: '#0F172A', background: '#888888',
    foreground: '#000000', card: '#999999', muted: '#777777',
    mutedForeground: '#D4D4D4', border: '#CCCCCC',
    note: 'Glass white + system blue',
  },
  'Sustainable Energy/Climate Tech': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#059669', onAccent: '#FFFFFF', background: '#ECFDF5',
    foreground: '#064E3B', card: '#FFFFFF', muted: '#E8F1F3',
    mutedForeground: '#64748B', border: '#A7F3D0',
    note: 'Nature green + solar gold',
  },
  'Personal Finance': {
    primary: '#1E40AF', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#101A34',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Chat & Messaging': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Messenger blue + online green',
  },
  'Notes & Writing': {
    primary: '#78716C', onPrimary: '#FFFFFF', secondary: '#A8A29E',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F6F6F6',
    mutedForeground: '#64748B', border: '#EEEDED',
    note: 'Warm ink + amber accent on cream',
  },
  'Habit': {
    primary: '#D97706', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF6F0',
    mutedForeground: '#64748B', border: '#FAEEE1',
    note: 'Streak amber + habit green',
  },
  'Food Delivery/On-Demand': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#F97316',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF7ED',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F0',
    mutedForeground: '#64748B', border: '#FCEAE1',
    note: 'Appetizing orange + trust blue',
  },
  'Ride Hailing/Transportation': {
    primary: '#1E293B', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#10182B',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Recipe & Cooking': {
    primary: '#9A3412', onPrimary: '#FFFFFF', secondary: '#C2410C',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F8F2F0',
    mutedForeground: '#64748B', border: '#F2E6E2',
    note: 'Warm terracotta + fresh green',
  },
  'Meditation & Mindfulness': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#8B5CF6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F7F3FD',
    mutedForeground: '#64748B', border: '#EFE7FC',
    note: 'Calm lavender + mindful green',
  },
  'Weather': {
    primary: '#0284C7', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#F59E0B', onAccent: '#0F172A', background: '#F0F9FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#EFF7FB',
    mutedForeground: '#64748B', border: '#E0F0F8',
    note: 'Sky blue + sun amber',
  },
  'Diary & Journal': {
    primary: '#92400E', onPrimary: '#FFFFFF', secondary: '#A16207',
    accent: '#6366F1', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F8F3F0',
    mutedForeground: '#64748B', border: '#F1E8E2',
    note: 'Warm journal brown + ink violet',
  },
  'CRM & Client Management': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Professional blue + deal green',
  },
  'Inventory & Stock Management': {
    primary: '#334155', onPrimary: '#FFFFFF', secondary: '#475569',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F2F3F4',
    mutedForeground: '#64748B', border: '#E6E8EA',
    note: 'Industrial slate + stock green',
  },
  'Flashcard & Study': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#8B5CF6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F7F3FD',
    mutedForeground: '#64748B', border: '#EFE7FC',
    note: 'Study purple + correct green',
  },
  'Booking & Appointment': {
    primary: '#0284C7', onPrimary: '#FFFFFF', secondary: '#0EA5E9',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#EFF7FB',
    mutedForeground: '#64748B', border: '#E0F0F8',
    note: 'Calendar blue + available green',
  },
  'Invoice & Billing': {
    primary: '#1E3A5F', onPrimary: '#FFFFFF', secondary: '#2563EB',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F3F5',
    mutedForeground: '#64748B', border: '#E4E7EB',
    note: 'Navy professional + paid green',
  },
  'Grocery & Shopping List': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#ECFDF5',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F0F8F6',
    mutedForeground: '#64748B', border: '#E1F2ED',
    note: 'Fresh green + food amber',
  },
  'Timer & Pomodoro': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#EF4444',
    accent: '#059669', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#1F1829',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Parenting & Baby': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F472B6',
    accent: '#0284C7', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F8',
    mutedForeground: '#64748B', border: '#FCE9F2',
    note: 'Soft pink + trust blue',
  },
  'Scanner & Document': {
    primary: '#1E293B', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F2F3',
    mutedForeground: '#64748B', border: '#E4E5E7',
    note: 'Document grey + scan blue',
  },
  'Calendar & Scheduling': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Calendar blue + event green',
  },
  'Password': {
    primary: '#1E3A5F', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#059669', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#10192E',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Expense Splitter/Bill Split': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F0F8F6',
    mutedForeground: '#64748B', border: '#E1F2ED',
    note: 'Balance green + owe red',
  },
  'Voice Recorder & Memo': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#EF4444',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF1F1',
    mutedForeground: '#64748B', border: '#FAE4E4',
    note: 'Recording red + waveform blue',
  },
  'Bookmark & Read-Later': {
    primary: '#D97706', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF6F0',
    mutedForeground: '#64748B', border: '#FAEEE1',
    note: 'Warm amber + link blue',
  },
  'Translator': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#0891B2',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Global blue + teal + accent orange',
  },
  'Calculator & Unit Converter': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#F97316',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#1C1917',
    foreground: '#FFFFFF', card: '#262321', muted: '#2C1E16',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Alarm & World Clock': {
    primary: '#D97706', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#6366F1', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#1F1E27',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'File Manager & Transfer': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Folder blue + file amber',
  },
  'Email Client': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Inbox blue + priority red',
  },
  'Casual Puzzle Game': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#8B5CF6',
    accent: '#F59E0B', onAccent: '#0F172A', background: '#FDF2F8',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F8',
    mutedForeground: '#64748B', border: '#FCE9F2',
    note: 'Cheerful pink + reward gold',
  },
  'Trivia & Quiz Game': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#7C3AED',
    accent: '#F59E0B', onAccent: '#0F172A', background: '#EFF6FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Quiz blue + gold leaderboard',
  },
  'Card & Board Game': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#166534',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#0F1F2B',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Idle & Clicker Game': {
    primary: '#D97706', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#7C3AED', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF6F0',
    mutedForeground: '#64748B', border: '#FAEEE1',
    note: 'Coin gold + prestige purple',
  },
  'Word & Crossword Game': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#059669',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F0F7F3',
    mutedForeground: '#64748B', border: '#E2EFE7',
    note: 'Word green + letter amber',
  },
  'Arcade & Retro Game': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#2563EB',
    accent: '#22C55E', onAccent: '#0F172A', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#1F1829',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Photo Editor & Filters': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#171939',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Short Video': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#DB2777',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#201A32',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Drawing & Sketching Canvas': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#8B5CF6',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#1C1917',
    foreground: '#FFFFFF', card: '#262321', muted: '#231B28',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Music Creation & Beat': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#22C55E', onAccent: '#0F172A', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#171939',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Meme & Sticker': {
    primary: '#EC4899', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F8',
    mutedForeground: '#64748B', border: '#FCE9F2',
    note: 'Viral pink + comedy yellow + share blue',
  },
  'AI Photo & Avatar': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F7F3FD',
    mutedForeground: '#64748B', border: '#EFE7FC',
    note: 'AI purple + generation pink',
  },
  'Link-in-Bio Page': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#7C3AED',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#FFFFFF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Brand blue + creator purple',
  },
  'Wardrobe & Outfit Planner': {
    primary: '#BE185D', onPrimary: '#FFFFFF', secondary: '#EC4899',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FBF1F5',
    mutedForeground: '#64748B', border: '#F7E3EB',
    note: 'Fashion rose + gold accent',
  },
  'Plant Care': {
    primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#059669',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#F0FDF4',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F0F7F3',
    mutedForeground: '#64748B', border: '#E2EFE7',
    note: 'Nature green + sun yellow',
  },
  'Book & Reading': {
    primary: '#78716C', onPrimary: '#FFFFFF', secondary: '#92400E',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F6F6F6',
    mutedForeground: '#64748B', border: '#EEEDED',
    note: 'Book brown + page amber',
  },
  'Couple & Relationship': {
    primary: '#BE185D', onPrimary: '#FFFFFF', secondary: '#EC4899',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FBF1F5',
    mutedForeground: '#64748B', border: '#F7E3EB',
    note: 'Romance rose + love red',
  },
  'Family Calendar & Chores': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#059669',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Family blue + chore green',
  },
  'Mood': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F7F3FD',
    mutedForeground: '#64748B', border: '#EFE7FC',
    note: 'Mood purple + insight amber',
  },
  'Gift & Wishlist': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#D97706',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#FFF1F2',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF1F1',
    mutedForeground: '#64748B', border: '#FAE4E4',
    note: 'Gift red + gold + surprise pink',
  },
  'Running & Cycling GPS': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#F97316',
    accent: '#059669', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#201C27',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Yoga & Stretching': {
    primary: '#6B7280', onPrimary: '#FFFFFF', secondary: '#78716C',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#F5F5F0',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F6F6F7',
    mutedForeground: '#64748B', border: '#EDEEEF',
    note: 'Sage neutral + calm teal',
  },
  'Sleep': {
    primary: '#4338CA', onPrimary: '#FFFFFF', secondary: '#6366F1',
    accent: '#7C3AED', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#131936',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Calorie & Nutrition': {
    primary: '#059669', onPrimary: '#FFFFFF', secondary: '#10B981',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#ECFDF5',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F0F8F6',
    mutedForeground: '#64748B', border: '#E1F2ED',
    note: 'Healthy green + macro orange',
  },
  'Period & Cycle': {
    primary: '#BE185D', onPrimary: '#FFFFFF', secondary: '#EC4899',
    accent: '#7C3AED', onAccent: '#FFFFFF', background: '#FDF2F8',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FBF1F5',
    mutedForeground: '#64748B', border: '#F7E3EB',
    note: 'Blush rose + fertility lavender',
  },
  'Medication & Pill': {
    primary: '#0284C7', onPrimary: '#FFFFFF', secondary: '#0891B2',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#EFF7FB',
    mutedForeground: '#64748B', border: '#E0F0F8',
    note: 'Medical blue + alert red',
  },
  'Water & Hydration': {
    primary: '#0284C7', onPrimary: '#FFFFFF', secondary: '#06B6D4',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#EFF7FB',
    mutedForeground: '#64748B', border: '#E0F0F8',
    note: 'Refreshing blue + water cyan',
  },
  'Fasting & Intermittent': {
    primary: '#6366F1', onPrimary: '#FFFFFF', secondary: '#4338CA',
    accent: '#059669', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#151D39',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Anonymous Community/Confession': {
    primary: '#475569', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#0891B2', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#131B2F',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Local Events & Discovery': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#F97316',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF7ED',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F0',
    mutedForeground: '#64748B', border: '#FCEAE1',
    note: 'Event orange + map blue',
  },
  'Study Together/Virtual Coworking': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#3B82F6',
    accent: '#059669', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Focus blue + session green',
  },
  'Coding Challenge & Practice': {
    primary: '#22C55E', onPrimary: '#0F172A', secondary: '#059669',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#10242E',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Kids Learning (ABC & Math)': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#F59E0B',
    accent: '#EC4899', onAccent: '#FFFFFF', background: '#EFF6FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Learning blue + play yellow + fun pink',
  },
  'Music Instrument Learning': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#9A3412',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FFFBEB',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF1F1',
    mutedForeground: '#64748B', border: '#FAE4E4',
    note: 'Musical red + warm amber',
  },
  'Parking Finder': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#059669',
    accent: '#DC2626', onAccent: '#FFFFFF', background: '#F0F9FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Available blue/green + occupied red',
  },
  'Public Transit': {
    primary: '#2563EB', onPrimary: '#FFFFFF', secondary: '#0891B2',
    accent: '#EA580C', onAccent: '#FFFFFF', background: '#F8FAFC',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F1F5FD',
    mutedForeground: '#64748B', border: '#E4ECFC',
    note: 'Transit blue + line colors',
  },
  'Road Trip Planner': {
    primary: '#EA580C', onPrimary: '#FFFFFF', secondary: '#0891B2',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FFF7ED',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FDF4F0',
    mutedForeground: '#64748B', border: '#FCEAE1',
    note: 'Adventure orange + map teal',
  },
  'VPN & Privacy': {
    primary: '#1E3A5F', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#22C55E', onAccent: '#0F172A', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#10192E',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Emergency SOS & Safety': {
    primary: '#DC2626', onPrimary: '#FFFFFF', secondary: '#EF4444',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FFF1F2',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#FCF1F1',
    mutedForeground: '#64748B', border: '#FAE4E4',
    note: 'Alert red + safety blue',
  },
  'Wallpaper & Theme': {
    primary: '#7C3AED', onPrimary: '#FFFFFF', secondary: '#EC4899',
    accent: '#2563EB', onAccent: '#FFFFFF', background: '#FAF5FF',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F7F3FD',
    mutedForeground: '#64748B', border: '#EFE7FC',
    note: 'Aesthetic purple + trending pink',
  },
  'White Noise & Ambient Sound': {
    primary: '#475569', onPrimary: '#FFFFFF', secondary: '#334155',
    accent: '#4338CA', onAccent: '#FFFFFF', background: '#0F172A',
    foreground: '#FFFFFF', card: '#192134', muted: '#131B2F',
    mutedForeground: '#94A3B8', border: '"rgba(255',
    note: '#DC2626',
  },
  'Home Decoration & Interior Design': {
    primary: '#78716C', onPrimary: '#FFFFFF', secondary: '#A8A29E',
    accent: '#D97706', onAccent: '#FFFFFF', background: '#FAF5F2',
    foreground: '#0F172A', card: '#FFFFFF', muted: '#F6F6F6',
    mutedForeground: '#64748B', border: '#EEEDED',
    note: 'Interior warm grey + gold accent',
  },

};

// ─── Design Styles (from styles.csv) ────────────────────────────────────────
// Condensed to key characteristics for prompt injection.

export interface DesignStyle {
  keywords: string[];
  colors: string;
  effects: string;
  bestFor: string[];
  avoidFor: string[];
  promptHint: string;
}

export const DESIGN_STYLES: Record<string, DesignStyle> = {
  'minimalism': {
    keywords: ['clean', 'simple', 'spacious', 'minimal', 'swiss'],
    colors: 'Monochromatic: Black #000, White #FFF, single accent color',
    effects: 'Subtle hover (200-250ms), smooth transitions, sharp shadows if any',
    bestFor: ['SaaS', 'corporate', 'documentation', 'portfolio'],
    avoidFor: ['entertainment', 'gaming', 'children'],
    promptHint: 'Use white space, geometric layouts, sans-serif fonts, high contrast. Avoid shadows and gradients. Focus on clarity.',
  },
  'glassmorphism': {
    keywords: ['glass', 'frosted', 'blur', 'translucent', 'modern'],
    colors: 'Vibrant gradients behind frosted surfaces. Semi-transparent whites.',
    effects: 'backdrop-blur-xl, bg-white/10, border border-white/20, subtle shadow',
    bestFor: ['SaaS', 'tech', 'creative', 'dashboard', 'AI platform'],
    avoidFor: ['government', 'legal', 'healthcare'],
    promptHint: 'Use backdrop-blur, translucent cards with border-white/20, vibrant gradient backgrounds. Frosted glass effect on cards and modals.',
  },
  'brutalism': {
    keywords: ['raw', 'bold', 'unpolished', 'thick borders', 'high contrast'],
    colors: 'Primary colors: Red, Blue, Yellow. Black borders. No gradients.',
    effects: 'No transitions. No shadows. Thick borders (border-2 border-3). Hard edges.',
    bestFor: ['creative agency', 'portfolio', 'art', 'fashion'],
    avoidFor: ['healthcare', 'finance', 'corporate'],
    promptHint: 'Use thick borders (border-2), no rounded corners (rounded-none), bold colors, visible grid structure. No shadows, no gradients, no blur effects.',
  },
  'dark-mode-oled': {
    keywords: ['dark', 'oled', 'night', 'cinema', 'dark mode'],
    colors: 'True black #000 background. Vibrant accent colors for CTAs. White text.',
    effects: 'Glow effects (shadow with color), subtle gradients, hover brightness changes',
    bestFor: ['gaming', 'crypto', 'video streaming', 'developer tools', 'music'],
    avoidFor: ['healthcare', 'education', 'government'],
    promptHint: 'Use bg-black text-white as base. Add colored glow shadows (shadow-[0_0_15px_color]). Vibrant accent buttons. High contrast text.',
  },
  'vibrant-block': {
    keywords: ['vibrant', 'colorful', 'block', 'bold', 'energetic', 'playful'],
    colors: 'Multiple bold colors. Color-blocking sections. High saturation.',
    effects: 'Scale on hover (hover:scale-105), colorful shadows, bounce animations',
    bestFor: ['e-commerce', 'food delivery', 'fitness', 'education', 'kids'],
    avoidFor: ['legal', 'finance', 'luxury'],
    promptHint: 'Use bold color blocks for sections, rounded-2xl cards, colorful gradients, playful hover effects (scale + shadow). Multiple vibrant colors.',
  },
  'elegant-luxury': {
    keywords: ['elegant', 'luxury', 'premium', 'sophisticated', 'high-end'],
    colors: 'Dark backgrounds (#0C0A09), gold accents (#A16207), cream whites',
    effects: 'Slow transitions (duration-500), subtle parallax, fade-in reveals',
    bestFor: ['luxury brands', 'real estate premium', 'jewelry', 'hotel', 'fine dining'],
    avoidFor: ['gaming', 'kids', 'fast food'],
    promptHint: 'Use dark backgrounds with gold/warm accents. Serif fonts for headings. Generous spacing. Subtle fade animations. Premium feel with minimal elements.',
  },
  'bento-grid': {
    keywords: ['bento', 'grid', 'modular', 'apple-style', 'showcase'],
    colors: 'Light grey #F5F5F7 or glass card backgrounds. Vibrant brand color icons.',
    effects: 'Hover card scale (1.02), staggered reveal, tilt effect',
    bestFor: ['SaaS', 'product showcase', 'tech', 'app landing'],
    avoidFor: ['long-form content', 'blog', 'documentation'],
    promptHint: 'Use grid layout with varying card sizes (some spanning 2 cols). Cards with bg-muted/50 or glass effect. Icon + title + short description per card. Stagger animation.',
  },
  'gradient-flow': {
    keywords: ['gradient', 'flow', 'aurora', 'colorful', 'dynamic'],
    colors: 'Multi-stop gradients. Purple→Blue→Cyan or brand-specific flows.',
    effects: 'Animated gradient backgrounds, color-shifting elements, smooth color transitions',
    bestFor: ['SaaS', 'AI tools', 'creative', 'startup'],
    avoidFor: ['legal', 'government', 'finance'],
    promptHint: 'Use gradient backgrounds (from-primary to-secondary via-accent). Gradient text (bg-clip-text text-transparent bg-gradient-to-r). Color transitions on hover.',
  },
  'retro-futurism': {
    keywords: ['retro', 'futuristic', 'neon', 'cyberpunk', '80s'],
    colors: 'Neon pink, cyan, purple on dark backgrounds. Glowing edges.',
    effects: 'Neon glow shadows, scan lines, flicker animations, grid patterns',
    bestFor: ['gaming', 'crypto', 'creative', 'events', 'music'],
    avoidFor: ['healthcare', 'government', 'education'],
    promptHint: 'Use neon colors with glow effects. Dark backgrounds. Grid/scanline patterns. Monospace fonts for accents. Cyberpunk aesthetic.',
  },
  'organic-biophilic': {
    keywords: ['organic', 'natural', 'biophilic', 'earth', 'green'],
    colors: 'Earth tones: greens, browns, warm whites. Natural gradients.',
    effects: 'Organic shapes, wave dividers, subtle growth animations',
    bestFor: ['spa', 'wellness', 'organic food', 'eco', 'sustainability'],
    avoidFor: ['gaming', 'crypto', 'industrial'],
    promptHint: 'Use warm earth tones, organic rounded shapes, wave section dividers, nature imagery. Calm, soothing color palette. Growth/fade animations.',
  },
  'liquid-glass': {
    keywords: ['liquid glass', 'glass', 'apple', 'visionos', 'frosted', 'translucent', 'depth'],
    colors: 'Semi-transparent whites with tinted backgrounds. Dynamic light refraction.',
    effects: 'backdrop-blur-xl, bg-white/40, border border-white/50, inner glow, subtle refraction highlights',
    bestFor: ['SaaS', 'tech', 'AI platform', 'dashboard', 'premium', 'Apple-style'],
    avoidFor: ['government', 'healthcare', 'accessibility-critical'],
    promptHint: 'Use thick glass panels (bg-white/40 backdrop-blur-xl), visible border highlights, light refraction effects, layered depth with z-index. Apple VisionOS-inspired translucent surfaces.',
  },
  'aurora-ui': {
    keywords: ['aurora', 'northern lights', 'gradient', 'ethereal', 'dreamy', 'colorful'],
    colors: 'Flowing gradients: Purple→Blue→Green→Cyan. Dark backgrounds.',
    effects: 'Animated gradient backgrounds (gradient-position animation), smooth color shifts, glow effects',
    bestFor: ['SaaS', 'AI tools', 'creative', 'music', 'crypto'],
    avoidFor: ['legal', 'government', 'corporate'],
    promptHint: 'Use animated gradient backgrounds (bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500), dark base, glow text effects, ethereal floating elements. Northern lights inspired.',
  },
  'motion-driven': {
    keywords: ['motion', 'kinetic', 'dynamic', 'animated', 'scroll-triggered', 'parallax'],
    colors: 'Clean base with vibrant accent colors that draw attention to moving elements.',
    effects: 'Scroll-triggered reveals (IntersectionObserver), staggered animations, parallax layers, spring physics easing',
    bestFor: ['SaaS', 'product showcase', 'creative', 'startup', 'portfolio'],
    avoidFor: ['documentation', 'government', 'accessibility-critical'],
    promptHint: 'Use scroll-triggered fade-in animations, staggered card reveals, parallax background layers, spring-physics hover effects. Motion conveys meaning — every animation has purpose.',
  },
  'neobrutalism': {
    keywords: ['neobrutalism', 'neo-brutal', 'bold borders', 'playful', 'colorful', 'thick shadows'],
    colors: 'Bright saturated colors with black thick borders. Multi-color sections.',
    effects: 'Hard offset shadows (shadow-[4px_4px_0_0_#000]), thick borders (border-2 border-black), slight rotation on hover',
    bestFor: ['startup', 'creative agency', 'portfolio', 'education', 'e-commerce'],
    avoidFor: ['luxury', 'legal', 'healthcare'],
    promptHint: 'Use thick black borders (border-2 border-black), hard offset shadows (shadow-[4px_4px_0_0_#000000]), bright background colors, bold sans-serif fonts, slight hover rotation. Playful but structured.',
  },
  'gradient-mesh': {
    keywords: ['gradient mesh', 'mesh gradient', 'colorful', 'smooth', 'organic gradient'],
    colors: 'Multiple radial gradients layered with blur. Soft multi-color transitions.',
    effects: 'Multiple radial-gradient layers with blur-3xl, opacity layering, smooth color transitions',
    bestFor: ['SaaS', 'AI tools', 'creative', 'startup', 'fintech'],
    avoidFor: ['legal', 'government', 'documentation'],
    promptHint: 'Use multiple blurred radial-gradient circles layered for mesh effect. bg-[radial-gradient] with blur-3xl. Soft organic color transitions. Colorful but not overwhelming.',
  },
  'claymorphism': {
    keywords: ['clay', '3d', 'soft', 'puffy', 'rounded', 'playful'],
    colors: 'Soft pastel colors with slight warmth. Creamy backgrounds.',
    effects: 'Multi-layer soft shadows (inner + outer), large border-radius (2xl/3xl), slight gradient on cards',
    bestFor: ['kids', 'education', 'food', 'bakery', 'pet', 'community'],
    avoidFor: ['luxury', 'legal', 'corporate'],
    promptHint: 'Use extra-rounded corners (rounded-3xl), multi-layer soft shadows creating puffy/3D clay look, pastel colors, gradient cards. Playful and tactile feel.',
  },
  'spatial-ui': {
    keywords: ['spatial', 'visionos', '3d', 'depth', 'layers', 'glass panels'],
    colors: 'Dark backgrounds with illuminated glass panels. Subtle tinted whites.',
    effects: 'Depth via z-index layers, backdrop-blur, ambient lighting effects, hover depth shift',
    bestFor: ['tech', 'AI', 'developer tools', 'premium SaaS'],
    avoidFor: ['e-commerce', 'food', 'education'],
    promptHint: 'Use layered glass panels at different depths, ambient glow effects, subtle parallax on hover, dark background with illuminated surfaces. Apple VisionOS-inspired spatial depth.',
  },
  'editorial-magazine': {
    keywords: ['editorial', 'magazine', 'serif', 'columns', 'elegant', 'content-focused'],
    colors: 'Cream/off-white backgrounds (#FFFBF5), deep charcoal text, single accent color.',
    effects: 'Column layouts, drop caps, pull quotes, elegant typography hierarchy, minimal animation',
    bestFor: ['blog', 'magazine', 'media', 'editorial', 'content-heavy'],
    avoidFor: ['gaming', 'kids', 'fitness'],
    promptHint: 'Use multi-column layouts, serif heading fonts, generous line-height (1.7+), pull quotes, cream backgrounds, single accent color. Magazine-style content presentation.',
  },
  'ai-native': {
    keywords: ['AI', 'chatbot', 'assistant', 'intelligent', 'adaptive', 'conversational'],
    colors: 'Deep purple (#7C3AED) base with cyan (#06B6D4) accents. Dark mode preferred.',
    effects: 'Typing indicators, skeleton loading, shimmer effects, adaptive content, subtle pulse animations',
    bestFor: ['AI tools', 'chatbot', 'SaaS', 'developer tools', 'productivity'],
    avoidFor: ['restaurant', 'bakery', 'wedding'],
    promptHint: 'Use purple/cyan palette, skeleton loading states, shimmer effects, chat-like interfaces, typing indicators, adaptive layouts. Convey intelligence through design.',
  },
  'memphis-design': {
    keywords: ['memphis', 'geometric', 'playful', '80s', 'pattern', 'colorful shapes'],
    colors: 'Bright primary colors + unexpected combos: Pink + Yellow + Teal. Black geometric outlines.',
    effects: 'Geometric SVG patterns, squiggle dividers, dot patterns, bold shape overlays',
    bestFor: ['creative agency', 'kids', 'education', 'event', 'fashion'],
    avoidFor: ['legal', 'finance', 'healthcare'],
    promptHint: 'Use bold geometric shapes (circles, triangles, squiggles) as decorative elements, bright color combos, black outlines, dot/stripe patterns. 80s Memphis Group inspired.',
  },
  'bento-showcase': {
    keywords: ['bento', 'grid', 'modular', 'showcase', 'apple-style', 'feature grid'],
    colors: 'Light grey (#F5F5F7) or glass backgrounds. Vibrant brand color for icons.',
    effects: 'Varying card sizes in grid, hover scale (1.02), staggered reveal, icon animations',
    bestFor: ['SaaS', 'product showcase', 'tech', 'app landing', 'features'],
    avoidFor: ['long-form content', 'blog', 'documentation'],
    promptHint: 'Use CSS grid with varying card sizes (some spanning 2 cols/rows), glass or muted card backgrounds, icon + title + short description per card. Stagger animation on scroll. Apple-style feature showcase.',
  },
  'vaporwave': {
    keywords: ['vaporwave', 'retro', 'neon', '80s', 'aesthetic', 'glitch', 'sunset'],
    colors: 'Hot pink, cyan, purple, sunset orange on dark backgrounds. Neon glow effects.',
    effects: 'Grid patterns, scan lines, sunset gradients, glitch text effects, neon glow shadows',
    bestFor: ['gaming', 'creative', 'music', 'events', 'crypto'],
    avoidFor: ['healthcare', 'government', 'corporate'],
    promptHint: 'Use sunset gradients (pink→purple→cyan), grid line backgrounds, neon glow shadows, glitch text effects, retro computer aesthetics. 80s vaporwave nostalgia.',
  },
};

// ─── Landing Page Patterns (from landing.csv) ────────────────────────────────

export interface LandingPattern {
  sectionOrder: string[];
  ctaPlacement: string;
  colorStrategy: string;
  conversionTip: string;
}

export const LANDING_PATTERNS: Record<string, LandingPattern> = {
  'hero_features_cta': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'FeaturesGrid', 'StatsSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Hero sticky + Bottom CTA section',
    colorStrategy: 'Hero: brand primary or vibrant. Features: Card bg muted. CTA: Contrasting accent.',
    conversionTip: 'Deep CTA placement. Use contrasting color (at least 7:1 contrast ratio). Sticky navbar CTA.',
  },
  'hero_testimonials_cta': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'FeaturesGrid', 'TestimonialSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Hero + Post-testimonials',
    colorStrategy: 'Hero: brand color. Testimonials: light bg. Quotes: italic muted. CTA: Vibrant accent.',
    conversionTip: 'Social proof before CTA. Use 3-5 testimonials with photo + name + role. CTA after social proof.',
  },
  'product_showcase': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'FeatureShowcase', 'ProductCards', 'TestimonialSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Feature highlights + Bottom',
    colorStrategy: 'Product images prominent. Feature icons in brand color. CTA contrasting.',
    conversionTip: 'Show product in action. High-quality images. Feature breakdown per section.',
  },
  'pricing_focused': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'FeaturesGrid', 'LogoGrid', 'PricingTable', 'FAQSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Each pricing card + Sticky nav + Bottom',
    colorStrategy: 'Popular plan highlighted (brand color border/bg). Free: grey. Enterprise: dark/premium.',
    conversionTip: 'Recommend mid-tier (most popular badge). Show annual discount. Address objections in FAQ.',
  },
  'minimal_funnel': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'FeaturesGrid', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Center, large CTA button',
    colorStrategy: 'Minimalist: brand + white + accent. Buttons: high contrast 7:1+.',
    conversionTip: 'Single CTA focus. Large typography. Lots of whitespace. Mobile-first.',
  },
  'waitlist_launch': {
    sectionOrder: ['AnnouncementBar', 'HeaderNav', 'HeroSection', 'FeaturesGrid', 'StatsSection', 'NewsletterSignup', 'FooterSection'],
    ctaPlacement: 'Email form prominent above fold + sticky on scroll',
    colorStrategy: 'Anticipation: dark + accent highlights. Countdown in brand color.',
    conversionTip: 'Scarcity + exclusivity. Show waitlist count. Early access benefits.',
  },
  'ecommerce_full': {
    sectionOrder: ['AnnouncementBar', 'HeaderNav', 'HeroSection', 'ProductCards', 'FeaturesGrid', 'TestimonialSection', 'LogoGrid', 'FAQSection', 'NewsletterSignup', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Product cards + Sticky nav + Bottom CTA',
    colorStrategy: 'Product images dominate. Success green for trust. Urgency orange for sales.',
    conversionTip: 'Product cards with prices and ratings. Sale badges. Trust signals. FAQ addresses buying concerns.',
  },
  'trust_authority': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'StatsSection', 'LogoGrid', 'FeaturesGrid', 'TestimonialSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Contact Sales primary + Nav secondary',
    colorStrategy: 'Corporate: navy/grey. Trust blue. Accent for CTA only.',
    conversionTip: 'Security badges. Case studies. Transparent pricing. Low-friction contact form.',
  },
  'event_countdown': {
    sectionOrder: ['AnnouncementBar', 'HeaderNav', 'HeroSection', 'CountdownTimer', 'FeaturesGrid', 'TeamSection', 'FAQSection', 'CTASection', 'FooterSection'],
    ctaPlacement: 'Register CTA sticky + After speakers + Bottom',
    colorStrategy: 'Urgency colors for countdown. Event branding. Professional speaker cards.',
    conversionTip: 'Early bird pricing with deadline. Speaker credibility. Multi-ticket discounts.',
  },
  'creative_portfolio': {
    sectionOrder: ['HeaderNav', 'HeroSection', 'Gallery', 'FeatureShowcase', 'TestimonialSection', 'ContactForm', 'FooterSection'],
    ctaPlacement: 'Project card hover + Footer contact',
    colorStrategy: 'Neutral background (let work shine). Minimal accent.',
    conversionTip: 'Visuals first. Filter by category. Fast loading essential.',
  },
};

// ─── Typography Pairings (from typography.csv) ──────────────────────────────

export interface FontPairing {
  heading: string;
  body: string;
  mood: string[];
  bestFor: string[];
}

export const TYPOGRAPHY_PAIRINGS: Record<string, FontPairing> = {
  'modern_professional': {
    heading: 'Space Grotesk', body: 'DM Sans',
    mood: ['modern', 'tech', 'clean', 'professional'],
    bestFor: ['SaaS', 'technology', 'startup', 'app'],
  },
  'classic_elegant': {
    heading: 'Playfair Display', body: 'Inter',
    mood: ['elegant', 'luxury', 'sophisticated', 'timeless'],
    bestFor: ['luxury', 'fashion', 'spa', 'editorial', 'fine dining'],
  },
  'friendly_approachable': {
    heading: 'Poppins', body: 'Nunito Sans',
    mood: ['friendly', 'warm', 'approachable', 'playful'],
    bestFor: ['education', 'kids', 'food', 'bakery', 'community'],
  },
  'bold_editorial': {
    heading: 'DM Serif Display', body: 'Public Sans',
    mood: ['bold', 'editorial', 'authoritative', 'impactful'],
    bestFor: ['magazine', 'blog', 'news', 'media', 'law firm'],
  },
  'clean_minimal': {
    heading: 'Inter', body: 'Inter',
    mood: ['minimal', 'clean', 'swiss', 'functional'],
    bestFor: ['portfolio', 'minimal', 'corporate', 'documentation'],
  },
  'warm_artisanal': {
    heading: 'Fraunces', body: 'DM Sans',
    mood: ['warm', 'artisanal', 'craft', 'organic'],
    bestFor: ['bakery', 'coffee shop', 'artisan', 'organic food'],
  },
  'energetic_sport': {
    heading: 'Montserrat', body: 'Source Sans 3',
    mood: ['energetic', 'bold', 'athletic', 'strong'],
    bestFor: ['fitness', 'gym', 'sports', 'adventure'],
  },
  'calm_wellness': {
    heading: 'Lora', body: 'Source Serif 4',
    mood: ['calm', 'serene', 'wellness', 'therapeutic'],
    bestFor: ['spa', 'wellness', 'yoga', 'meditation', 'healthcare'],
  },
  'tech_innovation': {
    heading: 'Sora', body: 'IBM Plex Sans',
    mood: ['innovative', 'futuristic', 'tech', 'cutting-edge'],
    bestFor: ['AI', 'crypto', 'tech', 'startup', 'developer tool'],
  },
  'creative_artistic': {
    heading: 'Syne', body: 'Work Sans',
    mood: ['creative', 'artistic', 'unique', 'expressive'],
    bestFor: ['creative agency', 'portfolio', 'art', 'design'],
  },
  'trust_professional': {
    heading: 'Libre Baskerville', body: 'Source Sans 3',
    mood: ['trustworthy', 'professional', 'established', 'reliable'],
    bestFor: ['legal', 'finance', 'insurance', 'real estate', 'B2B'],
  },
  'adventure_travel': {
    heading: 'Outfit', body: 'Nunito Sans',
    mood: ['adventurous', 'exploratory', 'vibrant', 'inviting'],
    bestFor: ['travel', 'tourism', 'adventure', 'hospitality'],
  },
  'ecommerce_retail': {
    heading: 'Hanken Grotesk', body: 'DM Sans',
    mood: ['modern', 'retail', 'polished', 'commercial'],
    bestFor: ['e-commerce', 'retail', 'fashion', 'product showcase'],
  },
  'developer_technical': {
    heading: 'JetBrains Mono', body: 'IBM Plex Sans',
    mood: ['technical', 'developer', 'precise', 'code'],
    bestFor: ['developer tools', 'IDE', 'documentation', 'technical'],
  },
};

// ─── Product Reasoning (from ui-reasoning.csv) ──────────────────────────────
// Maps business types to recommended patterns, styles, colors, effects, and anti-patterns.

export interface ProductReasoning {
  recommendedPattern: string;
  stylePriority: string;
  colorMood: string;
  typographyMood: string;
  keyEffects: string;
  antiPatterns: string;
}

export const PRODUCT_REASONING: Record<string, ProductReasoning> = {
  'SaaS/technology': {
    recommendedPattern: 'hero_features_cta',
    stylePriority: 'Glassmorphism + Flat Design',
    colorMood: 'Trust blue + Accent contrast',
    typographyMood: 'Professional + Hierarchy',
    keyEffects: 'Subtle hover (200-250ms) + Smooth transitions',
    antiPatterns: 'Excessive animation + Dark mode by default',
  },
  'e-commerce/store': {
    recommendedPattern: 'ecommerce_full',
    stylePriority: 'Vibrant & Block-based',
    colorMood: 'Brand primary + Success green',
    typographyMood: 'Engaging + Clear hierarchy',
    keyEffects: 'Card hover lift (200ms) + Scale effect',
    antiPatterns: 'Flat design without depth + Text-heavy pages',
  },
  'e-commerce/luxury': {
    recommendedPattern: 'product_showcase',
    stylePriority: 'Elegant Luxury + Minimal',
    colorMood: 'Premium dark + Gold accent',
    typographyMood: 'Luxury + Refined + Premium',
    keyEffects: 'Image zoom on hover + Smooth transitions + Elegant reveals',
    antiPatterns: 'Bright colors + Playful fonts + Discount-looking design',
  },
  'restaurant/dining': {
    recommendedPattern: 'hero_testimonials_cta',
    stylePriority: 'Warm & Inviting + Organic',
    colorMood: 'Appetizing red + Warm gold',
    typographyMood: 'Warm + Readable',
    keyEffects: 'Smooth scroll + Image parallax + Fade reveals',
    antiPatterns: 'Cold colors + Clinical feel + Stock-looking photos',
  },
  'bakery/pastry shop': {
    recommendedPattern: 'hero_testimonials_cta',
    stylePriority: 'Warm Artisanal + Organic',
    colorMood: 'Warm brown + Cream + Fresh green',
    typographyMood: 'Friendly + Handcrafted feel',
    keyEffects: 'Gentle fade-ins + Hover warmth + Smooth scroll',
    antiPatterns: 'Dark mode + Brutalism + Cold tech feel',
  },
  'coffee shop/cafe': {
    recommendedPattern: 'creative_portfolio',
    stylePriority: 'Warm Artisanal + Cozy Minimal',
    colorMood: 'Warm brown + Cream + Earth tones',
    typographyMood: 'Cozy + Inviting',
    keyEffects: 'Gentle animations + Image zoom on hover',
    antiPatterns: 'High-tech feel + Neon colors + Brutalism',
  },
  'spa/wellness': {
    recommendedPattern: 'trust_authority',
    stylePriority: 'Organic Biophilic + Calm Minimal',
    colorMood: 'Soft pink + Lavender luxury',
    typographyMood: 'Calm + Serene',
    keyEffects: 'Subtle parallax + Gentle fade-ins + Organic shapes',
    antiPatterns: 'Bold colors + Aggressive animations + Brutalism',
  },
  'fitness/gym': {
    recommendedPattern: 'hero_features_cta',
    stylePriority: 'Vibrant & Block-based + Dark Mode OLED',
    colorMood: 'Energy orange + Success green on dark',
    typographyMood: 'Bold + Energetic + Strong',
    keyEffects: 'Bold hover effects + Count-up animations + Dynamic transitions',
    antiPatterns: 'Pastel colors + Minimal spacing + Slow animations',
  },
  'real estate': {
    recommendedPattern: 'trust_authority',
    stylePriority: 'Elegant Luxury + Trust & Authority',
    colorMood: 'Trust teal + Professional blue',
    typographyMood: 'Professional + Premium',
    keyEffects: 'Image zoom on hover + Smooth gallery + Fade reveals',
    antiPatterns: 'Playful design + Neon colors + Excessive motion',
  },
  'education/training': {
    recommendedPattern: 'pricing_focused',
    stylePriority: 'Clean Minimal + Friendly Approachable',
    colorMood: 'Playful indigo + Energetic orange',
    typographyMood: 'Friendly + Clear + Readable',
    keyEffects: 'Staggered card reveals + Tab switching + Smooth accordion',
    antiPatterns: 'Dark mode + Brutalism + Corporate coldness',
  },
  'healthcare/medical': {
    recommendedPattern: 'trust_authority',
    stylePriority: 'Organic Biophilic + Clean Minimal',
    colorMood: 'Calm cyan + Health green',
    typographyMood: 'Professional + Calm + Trustworthy',
    keyEffects: 'Gentle fade-ins + Smooth transitions only',
    antiPatterns: 'Dark mode + Aggressive animations + Neon colors',
  },
  'fashion/clothing': {
    recommendedPattern: 'creative_portfolio',
    stylePriority: 'Elegant Luxury + Gradient Flow',
    colorMood: 'Bold pink + Cyan accent',
    typographyMood: 'Editorial + Trendy',
    keyEffects: 'Image zoom on hover + Carousel sliding + Fade reveals',
    antiPatterns: 'Clip-art icons + Small images + Text-heavy layout',
  },
  'travel/hospitality': {
    recommendedPattern: 'product_showcase',
    stylePriority: 'Adventure Travel + Vibrant Block',
    colorMood: 'Sky blue + Adventure orange',
    typographyMood: 'Adventurous + Vibrant + Inviting',
    keyEffects: 'Parallax scrolling + Image zoom + Smooth scroll',
    antiPatterns: 'Dark mode + Corporate feel + Small images',
  },
  'law firm/legal': {
    recommendedPattern: 'trust_authority',
    stylePriority: 'Trust & Authority + Clean Minimal',
    colorMood: 'Authority navy + Trust gold',
    typographyMood: 'Authoritative + Formal',
    keyEffects: 'Minimal transitions + Professional reveals',
    antiPatterns: 'Playful design + Bright colors + Casual tone',
  },
  'construction/architecture': {
    recommendedPattern: 'hero_features_cta',
    stylePriority: 'Industrial + Bold Editorial',
    colorMood: 'Industrial grey + Safety orange',
    typographyMood: 'Bold + Structural',
    keyEffects: 'Sturdy hover effects + Count-up stats + Grid-based reveals',
    antiPatterns: 'Pastel colors + Playful fonts + Organic shapes',
  },
  'personal portfolio': {
    recommendedPattern: 'creative_portfolio',
    stylePriority: 'Clean Minimal + Bento Grid',
    colorMood: 'Monochrome + Blue accent',
    typographyMood: 'Personal + Creative',
    keyEffects: 'Staggered grid reveals + Hover scale + Smooth transitions',
    antiPatterns: 'Generic template feel + Too many sections',
  },
  'creative agency': {
    recommendedPattern: 'creative_portfolio',
    stylePriority: 'Brutalism + Gradient Flow',
    colorMood: 'Bold pink + Creative cyan',
    typographyMood: 'Bold + Artistic + Expressive',
    keyEffects: 'Bold animations + Creative hovers + Dynamic layouts',
    antiPatterns: 'Boring corporate + Small imagery + Safe design',
  },
  'blog/media': {
    recommendedPattern: 'minimal_funnel',
    stylePriority: 'Clean Minimal + Bold Editorial',
    colorMood: 'Editorial black + Accent pink',
    typographyMood: 'Readable + Content-focused',
    keyEffects: 'Minimal effects + Focus on typography + Reading comfort',
    antiPatterns: 'Visual overload + Distracting animations + Small text',
  },
  'nonprofit/charity': {
    recommendedPattern: 'hero_testimonials_cta',
    stylePriority: 'Warm & Inviting + Clean Minimal',
    colorMood: 'Compassion blue + Action orange',
    typographyMood: 'Warm + Community + Trustworthy',
    keyEffects: 'Emotional reveals + Counter animations + Smooth scroll',
    antiPatterns: 'Cold corporate feel + Dark mode + Aggressive sales tactics',
  },
  'event/conference': {
    recommendedPattern: 'event_countdown',
    stylePriority: 'Vibrant & Block-based + Dynamic',
    colorMood: 'Excitement purple + Action orange',
    typographyMood: 'Exciting + Organized + Urgent',
    keyEffects: 'Countdown timer + Speaker card hovers + Staggered reveals',
    antiPatterns: 'Static design + No urgency signals + Boring layout',
  },
  'crypto/web3': {
    recommendedPattern: 'waitlist_launch',
    stylePriority: 'Dark Mode OLED + Retro Futurism',
    colorMood: 'Gold trust + Purple tech',
    typographyMood: 'Futuristic + Bold + Tech-forward',
    keyEffects: 'Neon glow effects + Animated gradients + Grid patterns',
    antiPatterns: 'Light mode + Traditional corporate + Pastel colors',
  },
};

// ─── UX Design Rules (from quick-reference.md) ──────────────────────────────
// High-priority rules for prompt injection. Compact format for token efficiency.

export const UX_DESIGN_RULES = `
## UX Design Rules (MANDATORY)

### Accessibility (CRITICAL)
- Contrast: Minimum 4.5:1 for text, 3:1 for large text/UI elements
- Alt text: Descriptive alt on all meaningful images
- Keyboard nav: Tab order matches visual order, visible focus rings (2-4px)
- Heading hierarchy: Sequential h1→h2→h3, never skip levels
- Reduced motion: Respect prefers-reduced-motion; provide static fallbacks

### Layout & Spacing
- Base font: 16px minimum for body text
- Line-height: 1.5-1.7 for body, 1.1-1.3 for headings
- Section padding: 96-128px vertical, 24px horizontal
- Card padding: 24-32px, border-radius: 12-16px
- Grid gap: 24-32px between cards

### Animation & Interaction
- Duration: 150-300ms for transitions, 500-700ms for reveals
- Easing: ease-out for entrances, ease-in for exits, spring for bouncy feel
- Stagger delay: 80-120ms between sequential elements
- Hover: Use transform (translateY, scale) + shadow, NEVER animate width/height
- Touch targets: Minimum 44×44px with 8px gap

### Color Usage
- NEVER use color alone to convey information — add icons/text
- Use semantic tokens (primary, muted, destructive) not raw hex
- Dark mode: Test all color combinations for readability
- CTA contrast: At least 7:1 for primary action buttons

### Content Quality
- Headings: Specific and compelling, never generic ("Welcome", "About Us")
- Descriptions: 2-3 sentences max, concrete details, no clichés
- CTAs: Action verbs ("Get Started", "Book a Demo"), never vague ("Click Here")
- Trust signals: Specific numbers, real testimonials with names/roles

### Anti-Patterns (NEVER DO)
- ❌ Placeholder text ("Lorem ipsum", "Coming soon", TBD)
- ❌ Emoji as icons in professional contexts
- ❌ Autoplay media without user control
- ❌ Infinite scroll without footer access
- ❌ Horizontal scroll on non-gallery sections
- ❌ Generic stock phrases ("craftsmanship", "world-class", "innovative solutions")
`;

// ─── Helper: Resolve design guidance for a business type ─────────────────────

export interface DesignGuidance {
  colorPalette: ColorPalette;
  style: DesignStyle;
  pattern: LandingPattern;
  typography: FontPairing;
  reasoning: ProductReasoning;
}

// Default reasoning fallback when a palette exists but no reasoning entry
const DEFAULT_REASONING: ProductReasoning = {
  recommendedPattern: 'hero_features_cta',
  stylePriority: 'Clean Minimal',
  colorMood: 'Brand primary + Neutral tones',
  typographyMood: 'Professional + Clean',
  keyEffects: 'Subtle hover (200-250ms) + Smooth transitions',
  antiPatterns: 'Excessive animation + Dark mode by default',
};

/**
 * Look up complete design guidance for a detected business type.
 * Returns null only if no color palette exists.
 * Falls back to default reasoning if palette exists but reasoning doesn't.
 */
export function resolveDesignGuidance(businessType: string | null): DesignGuidance | null {
  if (!businessType) return null;

  // Direct match first
  let palette = PRODUCT_COLOR_PALETTES[businessType];

  // Fuzzy fallback: normalize and try substring matching
  if (!palette) {
    const normalized = businessType.toLowerCase().replace(/[/\\]/g, ' ').trim();
    for (const [key, val] of Object.entries(PRODUCT_COLOR_PALETTES)) {
      const normKey = key.toLowerCase().replace(/[/\\]/g, ' ').trim();
      // Check if either contains the other
      if (normalized.includes(normKey) || normKey.includes(normalized)) {
        palette = val;
        // Also try to match reasoning with the matched key
        break;
      }
    }
    // Still no match? Try word-level matching (any word overlap)
    if (!palette) {
      const words = normalized.split(/\s+/).filter(w => w.length > 3);
      let bestMatch: { key: string; score: number } | null = null;
      for (const [key] of Object.entries(PRODUCT_COLOR_PALETTES)) {
        const normKey = key.toLowerCase().replace(/[/\\]/g, ' ');
        const score = words.reduce((acc, w) => acc + (normKey.includes(w) ? 1 : 0), 0);
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { key, score };
        }
      }
      if (bestMatch) {
        palette = PRODUCT_COLOR_PALETTES[bestMatch.key];
      }
    }
  }

  if (!palette) return null;

  // Reasoning — try exact match then fuzzy match on businessType
  let reasoning = PRODUCT_REASONING[businessType];
  if (!reasoning) {
    const normBt = businessType.toLowerCase().replace(/[/\\]/g, ' ').trim();
    for (const [key, val] of Object.entries(PRODUCT_REASONING)) {
      const normKey = key.toLowerCase().replace(/[/\\]/g, ' ').trim();
      if (normBt.includes(normKey) || normKey.includes(normBt)) {
        reasoning = val;
        break;
      }
    }
  }
  reasoning = reasoning ?? DEFAULT_REASONING;

  // Resolve style from reasoning's stylePriority
  const styleKey = Object.keys(DESIGN_STYLES).find(key =>
    reasoning.stylePriority.toLowerCase().includes(key.replace(/[-_]/g, ' ').toLowerCase())
  ) ?? 'minimalism';
  const style = DESIGN_STYLES[styleKey] ?? DESIGN_STYLES['minimalism'];

  // Resolve landing pattern
  const patternKey = reasoning.recommendedPattern;
  const pattern = LANDING_PATTERNS[patternKey] ?? LANDING_PATTERNS['hero_features_cta'];

  // Resolve typography from reasoning's typographyMood
  const typoKey = Object.keys(TYPOGRAPHY_PAIRINGS).find(key => {
    const pairing = TYPOGRAPHY_PAIRINGS[key];
    return pairing.mood.some(m =>
      reasoning.typographyMood.toLowerCase().includes(m.toLowerCase())
    );
  }) ?? 'modern_professional';
  const typography = TYPOGRAPHY_PAIRINGS[typoKey] ?? TYPOGRAPHY_PAIRINGS['modern_professional'];

  return { colorPalette: palette, style, pattern, typography, reasoning };
}

/**
 * Format design guidance as a multi-section text block for prompt injection.
 * Includes business type, full color palette, typography, layout pattern, effects, and anti-patterns.
 */
export function formatDesignGuidance(guidance: DesignGuidance, businessType?: string): string {
  const { colorPalette: p, style: s, pattern: pat, typography: t, reasoning: r } = guidance;

  const lines: string[] = [];

  if (businessType) lines.push(`[Business Type] ${businessType}`);
  lines.push(`[Design Direction] ${r.stylePriority}`);
  lines.push(`[Color Palette] primary=${p.primary}, secondary=${p.secondary}, accent=${p.accent}, onAccent=${p.onAccent}, background=${p.background}, foreground/text=${p.foreground}, card=${p.card}, muted=${p.muted}, mutedText=${p.mutedForeground}, border=${p.border}`);
  lines.push(`[Effects] ${r.keyEffects}`);
  lines.push(`[Page Layout] ${pat.sectionOrder.join(' → ')}`);
  lines.push(`[Typography] ${t.heading} (headings) + ${t.body} (body). Mood: ${t.mood.join(', ')}`);
  lines.push(`[Style] ${s.promptHint}`);
  lines.push(`[Conversion Tips] ${pat.conversionTip}`);
  lines.push(`[Anti-Patterns] ${r.antiPatterns}`);
  lines.push(UX_DESIGN_RULES);

  return lines.join('\n');
}
