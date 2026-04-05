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

  // Direct match — palette is required
  const palette = PRODUCT_COLOR_PALETTES[businessType];
  if (!palette) return null;

  // Reasoning is optional — fall back to generic defaults
  const reasoning = PRODUCT_REASONING[businessType] ?? DEFAULT_REASONING;

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
 * Format design guidance as a compact text block for prompt injection.
 * Target: under 500 chars for prompt efficiency.
 */
export function formatDesignGuidance(guidance: DesignGuidance): string {
  const { colorPalette: p, style: s, pattern: pat, typography: t, reasoning: r } = guidance;

  return [
    `Design Direction: ${r.stylePriority}`,
    `Colors: primary=${p.primary}, accent=${p.accent}, bg=${p.background}, text=${p.foreground}`,
    `Effects: ${r.keyEffects}`,
    `Layout: ${pat.sectionOrder.join(' → ')}`,
    `Typography: ${t.heading} (headings) + ${t.body} (body)`,
    `Style hints: ${s.promptHint}`,
    `Avoid: ${r.antiPatterns}`,
  ].join('. ');
}
