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
  backgroundUrl?: string;
  backgroundOverlay: boolean;
  padding: string;
};

// ─── Features ───────────────────────────────────────────────────────
export type FeatureItem = {
  title: string;
  description: string;
  icon?: string;
};
export type FeaturesGridProps = {
  heading: string;
  subtext?: string;
  columns: 2 | 3 | 4;
  features: FeatureItem[];
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
};
export type PricingTableProps = {
  heading: string;
  subtext?: string;
  plans: PricingPlan[];
};

// ─── Testimonial ────────────────────────────────────────────────────
export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
};
export type TestimonialSectionProps = {
  heading?: string;
  testimonials: TestimonialItem[];
};

// ─── CTA ────────────────────────────────────────────────────────────
export type CTASectionProps = {
  heading: string;
  subtext?: string;
  ctaText: string;
  ctaHref: string;
  backgroundUrl?: string;
};

// ─── FAQ ────────────────────────────────────────────────────────────
export type FAQItem = {
  question: string;
  answer: string;
};
export type FAQSectionProps = {
  heading: string;
  subtext?: string;
  items: FAQItem[];
};

// ─── Stats ──────────────────────────────────────────────────────────
export type StatItem = {
  value: string;
  label: string;
};
export type StatsSectionProps = {
  heading?: string;
  stats: StatItem[];
  columns: 2 | 3 | 4;
};

// ─── Team ───────────────────────────────────────────────────────────
export type TeamMember = {
  name: string;
  role: string;
  avatarUrl?: string;
};
export type TeamSectionProps = {
  heading: string;
  subtext?: string;
  members: TeamMember[];
};

// ─── Blog ───────────────────────────────────────────────────────────
export type BlogPost = {
  title: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
  href: string;
};
export type BlogSectionProps = {
  heading: string;
  posts: BlogPost[];
  columns: 2 | 3;
};

// ─── Logo Grid ──────────────────────────────────────────────────────
export type LogoItem = {
  name: string;
  imageUrl: string;
};
export type LogoGridProps = {
  heading?: string;
  logos: LogoItem[];
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
};
export type HeaderNavProps = {
  logo: string;
  links: HeaderNavLink[];
  ctaText?: string;
  ctaHref?: string;
  sticky: boolean;
};

// ─── Footer ─────────────────────────────────────────────────────────
export type FooterLinkGroup = {
  title: string;
  links: HeaderNavLink[];
};
export type FooterSectionProps = {
  logo?: string;
  description?: string;
  linkGroups: FooterLinkGroup[];
  copyright?: string;
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
};

// ─── Newsletter Signup ────────────────────────────────────────────────
export type NewsletterSignupProps = {
  heading: string;
  subtext?: string;
  placeholder: string;
  buttonText: string;
  layout: "centered" | "split";
  backgroundUrl?: string;
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
};
export type ProductCardsProps = {
  heading?: string;
  columns: 2 | 3 | 4;
  products: ProductCard[];
};

// ─── Feature Showcase ────────────────────────────────────────────────
export type ShowcaseFeature = {
  title: string;
  description: string;
};
export type FeatureShowcaseProps = {
  heading: string;
  subtext?: string;
  imageUrl: string;
  features: ShowcaseFeature[];
  imagePosition: "left" | "right";
  ctaText?: string;
  ctaHref?: string;
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
};

// ─── Announcement Bar ────────────────────────────────────────────────
export type AnnouncementBarProps = {
  message: string;
  ctaText?: string;
  ctaHref?: string;
  bgColor: "primary" | "dark" | "accent";
  dismissible: boolean;
};

// ─── Banner ──────────────────────────────────────────────────────────
export type BannerProps = {
  heading: string;
  subtext?: string;
  ctaText: string;
  ctaHref: string;
  variant: "gradient" | "image" | "solid";
  backgroundUrl?: string;
  align: "left" | "center";
};

// ─── All component names (for Config generics) ──────────────────────
export type ComponentProps = {
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
};
