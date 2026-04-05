import type { RichText, Slot } from "@puckeditor/core";

// ─── Layout helpers (re-exported from components) ──────────────────
export type { LayoutFieldProps, WithLayout } from "./components/Layout";

// ─── Atomic Blocks (composable) ────────────────────────────────────

export type ButtonBlockProps = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
  layout?: import("./components/Layout").LayoutFieldProps;
};

export type CardBlockProps = {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  href?: string;
  mode: "card" | "flat";
  layout?: import("./components/Layout").LayoutFieldProps;
};

export type HeadingBlockProps = {
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg" | "xl";
  layout?: import("./components/Layout").LayoutFieldProps;
};

export type TextBlockProps = {
  text: string;
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg";
  color: "default" | "muted";
  maxWidth?: string;
  layout?: import("./components/Layout").LayoutFieldProps;
};

export type BlankProps = {
  children: Slot;
};

export type FlexProps = {
  direction: "row" | "column";
  justifyContent: "start" | "center" | "end" | "between" | "around";
  alignItems: "start" | "center" | "end" | "stretch";
  gap: number;
  wrap: boolean;
  items: Slot;
};

export type GridProps = {
  numColumns: number;
  gap: number;
  items: Slot;
};

export type SectionBlockProps = {
  paddingY: string;
  paddingX: string;
  maxWidth: string;
  bgColor: string;
  bgImageUrl: string;
  bgOverlay: boolean;
  content: Slot;
};

// ─── Section Blocks (keep existing) ────────────────────────────────

// ─── Hero ───────────────────────────────────────────────────────────
export type HeroSectionProps = {
  heading: string;
  subtext: string;
  badge?: string;
  ctaText: string;
  ctaHref: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  align: "left" | "center";
  layout?: "centered" | "split-left" | "split-right";
  backgroundUrl?: string;
  backgroundOverlay: boolean;
  videoUrl?: string;
  imageUrl?: string;
  animation?: "none" | "fade-up" | "fade-in" | "slide-left" | "slide-right" | "zoom";
  trustBadges?: { text: string }[];
  gradientFrom?: string;
  gradientTo?: string;
  gradientPreset?: "" | "sunset" | "ocean" | "forest" | "aurora" | "midnight" | "berry" | "ember";
  padding: string;
};

// ─── Features ───────────────────────────────────────────────────────
export type FeatureItem = {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
};
export type FeaturesGridProps = {
  heading: string;
  subtext?: string;
  columns: 2 | 3 | 4;
  features: FeatureItem[];
  variant?: "grid" | "carousel";
  cardStyle?: "icon" | "image" | "flat" | "elevated";
  animation?: "none" | "stagger-fade" | "stagger-slide";
  hoverEffect?: "none" | "lift" | "glow" | "border";
};

// ─── Pricing ────────────────────────────────────────────────────────
export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { value: string }[];
  ctaText: string;
  ctaHref: string;
  highlighted: boolean;
  savePercentage?: string; // For yearly plans, e.g. "Save 20%"
};
export type PricingTableProps = {
  heading: string;
  subtext?: string;
  plans: PricingPlan[];
  pricingToggle?: boolean; // Enable monthly/yearly toggle
  yearlyPlans?: PricingPlan[]; // Separate plans for yearly pricing
  highlightedBadge?: string; // Custom badge text for highlighted plan
  currency?: string; // Currency symbol (default "$")
  animation?: "none" | "fade-up" | "stagger"; // Entrance animation
};

// ─── Testimonial ────────────────────────────────────────────────────
export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
  rating?: number; // 1-5 star rating
};
export type TestimonialSectionProps = {
  heading?: string;
  testimonials: TestimonialItem[];
  variant?: "grid" | "carousel";
  autoplay?: boolean;
  interval?: number; // ms between carousel slides, default 5000
  animation?: "none" | "fade-up" | "stagger-fade";
  cardStyle?: "default" | "elevated" | "glass";
};

// ─── CTA ────────────────────────────────────────────────────────────
export type CTASectionProps = {
  heading: string;
  subtext?: string;
  ctaText: string;
  ctaHref: string;
  backgroundUrl?: string;
  layout?: "centered" | "split";
  imageUrl?: string;
  imagePosition?: "left" | "right";
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  variant?: "default" | "gradient" | "dark";
  trustText?: string;
  animation?: "none" | "fade-up" | "zoom";
};

// ─── FAQ ────────────────────────────────────────────────────────────
export type FAQItem = {
  question: string;
  answer: string;
  icon?: string;
};
export type FAQSectionProps = {
  heading: string;
  subtext?: string;
  items: FAQItem[];
  accordion?: boolean;
  columns?: 1 | 2;
  searchable?: boolean;
};

// ─── Stats ──────────────────────────────────────────────────────────
export type StatItem = {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
};
export type StatsSectionProps = {
  heading?: string;
  stats: StatItem[];
  columns: 2 | 3 | 4;
  animated?: boolean;
  duration?: number;
  animation?: "none" | "fade-up" | "stagger";
  cardStyle?: "none" | "card" | "bordered" | "gradient";
};

// ─── Team ───────────────────────────────────────────────────────────
export type TeamMember = {
  name: string;
  role: string;
  avatarUrl?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialGithub?: string;
};
export type TeamSectionProps = {
  heading: string;
  subtext?: string;
  members: TeamMember[];
  hoverEffect?: "none" | "flip" | "lift";
  socialLinks?: boolean;
  animation?: "none" | "fade-up" | "stagger-fade";
};

// ─── Blog ───────────────────────────────────────────────────────────
export type BlogPost = {
  title: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
  href: string;
  category?: string;
};
export type BlogSectionProps = {
  heading: string;
  posts: BlogPost[];
  columns: 2 | 3;
  variant?: "grid" | "carousel";
  masonry?: boolean;
  categoryFilter?: boolean;
  animation?: "none" | "fade-up" | "stagger-fade";
};

// ─── Logo Grid ──────────────────────────────────────────────────────
export type LogoItem = {
  name: string;
  imageUrl: string;
};
export type LogoGridProps = {
  heading?: string;
  logos: LogoItem[];
  variant?: "grid" | "carousel";
  grayscale?: boolean;
  tooltip?: boolean;
  animation?: "none" | "fade-up" | "stagger-fade";
};

// ─── Contact ────────────────────────────────────────────────────────
export type ContactFormProps = {
  heading: string;
  subtext?: string;
  showPhone: boolean;
  showCompany: boolean;
  buttonText: string;
};

// ─── Header ─────────────────────────────────────────────────────────
export type HeaderNavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};
export type HeaderNavProps = {
  logo: string;
  logoImageUrl?: string;
  links: HeaderNavLink[];
  ctaText?: string;
  ctaHref?: string;
  sticky: boolean;
  mobileMenu?: boolean;
  transparent?: boolean;
  showSearch?: boolean;
};

// ─── Footer ─────────────────────────────────────────────────────────
export type FooterLinkGroup = {
  title: string;
  links: HeaderNavLink[];
};
export type FooterSocialLink = {
  platform: string;
  url: string;
};
export type FooterSectionProps = {
  logo?: string;
  description?: string;
  linkGroups: FooterLinkGroup[];
  copyright?: string;
  socialLinks?: FooterSocialLink[];
  backToTop?: boolean;
  newsletterIntegration?: boolean;
  showCopyright?: boolean;
};

// ─── RichText Block ────────────────────────────────────────────────
export type RichTextBlockProps = {
  content: RichText;
  align: "left" | "center" | "right";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
};

// ─── Image Block ────────────────────────────────────────────────────
export type ImageBlockProps = {
  src: string;
  alt: string;
  width?: string;
  borderRadius?: "none" | "sm" | "md" | "lg" | "full";
};

// ─── Spacer ─────────────────────────────────────────────────────────
export type SpacerProps = {
  height: number;
  showDivider?: boolean;
  dividerStyle?: "solid" | "dashed" | "dotted";
  dividerColor?: string;
  dividerWidth?: "full" | "contained";
};

// ─── Columns ────────────────────────────────────────────────────────
// Uses Puck's slot system for nested content
// At render time, Puck passes slot fields as render functions (SlotComponent)
type SlotRender = () => React.ReactNode;
export type ColumnsLayoutProps = {
  columns: 2 | 3 | 4;
  gap: number;
  col1?: SlotRender;
  col2?: SlotRender;
  col3?: SlotRender;
  col4?: SlotRender;
  unequalWidths?: boolean;
  widths?: string[];
  stackOrder?: "normal" | "reverse";
  gapSize?: "sm" | "md" | "lg" | "xl";
};

// ─── Newsletter Signup ────────────────────────────────────────────────
export type NewsletterSignupProps = {
  heading: string;
  subtext?: string;
  placeholder: string;
  buttonText: string;
  layout: "centered" | "split";
  backgroundUrl?: string;
  subscriberCount?: string;
  privacyNote?: string;
  bgVariant?: "none" | "gradient" | "image";
  testimonialQuote?: string;
  testimonialAuthor?: string;
  animation?: "none" | "fade-up" | "zoom";
};

// ─── Gallery ─────────────────────────────────────────────────────────
export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};
export type GalleryProps = {
  heading?: string;
  columns: 2 | 3 | 4;
  images: GalleryImage[];
  variant?: "grid" | "carousel" | "masonry";
  lightbox?: boolean;
  hoverEffect?: "none" | "zoom" | "overlay";
};

// ─── Social Proof ────────────────────────────────────────────────────
export type SocialProofStat = {
  value: string;
  label: string;
};
export type SocialProofLogo = {
  name: string;
  imageUrl: string;
};
export type SocialProofProps = {
  heading?: string;
  stats: SocialProofStat[];
  logos: SocialProofLogo[];
  showAvatars: boolean;
  avatarCount: number;
  testimonialText?: string;
  animated?: boolean;
  avatarUrls?: string[];
  variant?: "default" | "notification";
  animation?: "none" | "fade-up" | "stagger-fade";
};

// ─── Comparison Table ────────────────────────────────────────────────
export type ComparisonPlan = {
  name: string;
  highlighted: boolean;
};
export type ComparisonFeature = {
  name: string;
  values: string[];
};
export type ComparisonTableProps = {
  heading?: string;
  plans: ComparisonPlan[];
  features: ComparisonFeature[];
  highlightedPlan?: number;
  highlightedColor?: string;
  tooltipDetails?: boolean;
  animation?: "none" | "fade-up";
};

// ─── Product Cards ───────────────────────────────────────────────────
export type ProductCard = {
  name: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  description?: string;
  badge?: string;
  href: string;
  rating?: number;
  inStock?: boolean;
};
export type ProductCardsProps = {
  heading?: string;
  columns: 2 | 3 | 4;
  products: ProductCard[];
  quickView?: boolean;
  saleBadge?: boolean;
  hoverEffect?: "none" | "lift" | "zoom";
};

// ─── Feature Showcase ────────────────────────────────────────────────
export type ShowcaseFeature = {
  title: string;
  description: string;
  icon?: string;
};
export type FeatureShowcaseProps = {
  heading: string;
  subtext?: string;
  imageUrl: string;
  features: ShowcaseFeature[];
  imagePosition: "left" | "right";
  ctaText?: string;
  ctaHref?: string;
  animation?: "none" | "fade-up" | "slide-left" | "slide-right";
  videoUrl?: string;
  tabbed?: boolean;
};

// ─── Countdown Timer ─────────────────────────────────────────────────
export type CountdownTimerProps = {
  heading: string;
  subtext?: string;
  endDate: string;
  ctaText?: string;
  ctaHref?: string;
  showDays: boolean;
  showHours: boolean;
  style?: "default" | "flip" | "minimal";
  showLabels?: boolean;
  animation?: "none" | "fade-up";
  endMessage?: string;
};

// ─── Announcement Bar ────────────────────────────────────────────────
export type AnnouncementBarProps = {
  message: string;
  ctaText?: string;
  ctaHref?: string;
  bgColor: "primary" | "dark" | "accent" | "custom";
  customBgColor?: string;
  dismissible: boolean;
  animation?: "none" | "slide-down" | "fade-in";
  icon?: "info" | "megaphone" | "gift" | "tag";
};

// ─── Banner ──────────────────────────────────────────────────────────
export type BannerProps = {
  heading: string;
  subtext?: string;
  ctaText: string;
  ctaHref: string;
  variant: "gradient" | "image" | "solid" | "video";
  backgroundUrl?: string;
  align: "left" | "center";
  videoUrl?: string;
  countdown?: boolean;
  countdownDate?: string;
  animatedGradient?: boolean;
  animation?: "none" | "fade-up" | "zoom";
};

// ─── Component meta (shared across all components) ──────────────────
export interface ComponentMeta {
  /** Human-readable name for AI targeting & outline display (e.g. "hero_main") */
  name?: string;
  /** Style overrides — applied to the component's outermost element */
  bgColor?: string;
  textColor?: string;
  /** CSS padding value (e.g. "24px", "1rem 2rem") */
  padding?: string;
  /** CSS margin value */
  margin?: string;
  /** CSS border-radius value (e.g. "8px", "50%") */
  borderRadius?: string;
  /** CSS max-width value (e.g. "800px", "100%") */
  maxWidth?: string;
  /** CSS opacity 0-1 */
  opacity?: number;
  /** Extra CSS class names */
  className?: string;
}

// ─── All component names (for Config generics) ──────────────────────
export type ComponentProps = {
  [K in keyof RawComponentProps]: RawComponentProps[K] & ComponentMeta;
};

/** Internal: raw component props before meta is applied */
type RawComponentProps = {
  // Atomic (composable)
  ButtonBlock: ButtonBlockProps;
  CardBlock: CardBlockProps;
  HeadingBlock: HeadingBlockProps;
  TextBlock: TextBlockProps;
  RichTextBlock: RichTextBlockProps;
  Blank: BlankProps;
  Flex: FlexProps;
  Grid: GridProps;
  SectionBlock: SectionBlockProps;
  // Sections
  HeroSection: HeroSectionProps;
  FeaturesGrid: FeaturesGridProps;
  PricingTable: PricingTableProps;
  TestimonialSection: TestimonialSectionProps;
  CTASection: CTASectionProps;
  FAQSection: FAQSectionProps;
  StatsSection: StatsSectionProps;
  TeamSection: TeamSectionProps;
  BlogSection: BlogSectionProps;
  LogoGrid: LogoGridProps;
  ContactForm: ContactFormProps;
  HeaderNav: HeaderNavProps;
  FooterSection: FooterSectionProps;
  ImageBlock: ImageBlockProps;
  Spacer: SpacerProps;
  ColumnsLayout: ColumnsLayoutProps;
  NewsletterSignup: NewsletterSignupProps;
  Gallery: GalleryProps;
  SocialProof: SocialProofProps;
  ComparisonTable: ComparisonTableProps;
  ProductCards: ProductCardsProps;
  FeatureShowcase: FeatureShowcaseProps;
  CountdownTimer: CountdownTimerProps;
  AnnouncementBar: AnnouncementBarProps;
  Banner: BannerProps;
  CustomSection: CustomSectionProps;
};

// ─── Custom Section (AI-generated HTML) ──────────────────────────────────

export interface CustomSectionProps {
  /** Full HTML with Tailwind classes, generated by AI */
  html: string;
  /** Optional custom CSS (scoped to this section) */
  css?: string;
  /** Short description shown in Puck sidebar */
  preview?: string;
  /** Minimum height for empty/placeholder state */
  minHeight?: string;
}
