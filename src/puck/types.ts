import type { RichText } from "@puckeditor/core";

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

// ─── Text Block ─────────────────────────────────────────────────────
export type TextBlockProps = {
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

// ─── All component names (for Config generics) ──────────────────────
export type ComponentProps = {
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
  TextBlock: TextBlockProps;
  ImageBlock: ImageBlockProps;
  Spacer: SpacerProps;
  ColumnsLayout: ColumnsLayoutProps;
};
