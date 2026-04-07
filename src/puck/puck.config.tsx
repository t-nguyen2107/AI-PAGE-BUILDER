import { Config, ComponentConfig } from "@puckeditor/core";
import type { DefaultRootProps, RootConfig } from "@puckeditor/core";

import type { ComponentProps } from "./types";
import { categories } from "./categories";

// ─── Render component imports ─────────────────────────────────────────
import { HeroSection as HeroSectionRender } from "./components/HeroSection";
import { FeaturesGrid as FeaturesGridRender } from "./components/FeaturesGrid";
import { PricingTable as PricingTableRender } from "./components/PricingTable";
import { TestimonialSection as TestimonialSectionRender } from "./components/TestimonialSection";
import { CTASection as CTASectionRender } from "./components/CTASection";
import { FAQSection as FAQSectionRender } from "./components/FAQSection";
import { StatsSection as StatsSectionRender } from "./components/StatsSection";
import { TeamSection as TeamSectionRender } from "./components/TeamSection";
import { BlogSection as BlogSectionRender } from "./components/BlogSection";
import { LogoGrid as LogoGridRender } from "./components/LogoGrid";
import { ContactForm as ContactFormRender } from "./components/ContactForm";
import { HeaderNav as HeaderNavRender } from "./components/HeaderNav";
import { FooterSection as FooterSectionRender } from "./components/FooterSection";
import { RichTextBlock as RichTextBlockRender } from "./components/RichTextBlock";
import { ImageBlock as ImageBlockRender } from "./components/ImageBlock";
import { Spacer as SpacerRender } from "./components/Spacer";
import { ColumnsLayout as ColumnsLayoutRender } from "./components/ColumnsLayout";
import { NewsletterSignup as NewsletterSignupRender } from "./components/NewsletterSignup";
import { Gallery as GalleryRender } from "./components/Gallery";
import { SocialProof as SocialProofRender } from "./components/SocialProof";
import { ComparisonTable as ComparisonTableRender } from "./components/ComparisonTable";
import { ProductCards as ProductCardsRender } from "./components/ProductCards";
import { FeatureShowcase as FeatureShowcaseRender } from "./components/FeatureShowcase";
import { CountdownTimer as CountdownTimerRender } from "./components/CountdownTimer";
import { AnnouncementBar as AnnouncementBarRender } from "./components/AnnouncementBar";
import { Banner as BannerRender } from "./components/Banner";
import { CustomSection as CustomSectionRender } from "./components/CustomSection";
// Atomic (composable) — self-contained ComponentConfig exports
import { Button } from "./components/Button";
import { Card } from "./components/Card";
import { Heading } from "./components/Heading";
import { Text } from "./components/Text";
import { Blank } from "./components/Blank";
import { Flex } from "./components/Flex";
import { Grid } from "./components/Grid";
import { SectionBlockConfig } from "./components/SectionBlock";

// ─── Type imports ──────────────────────────────────────────────────────
import type {
  HeroSectionProps,
  FeaturesGridProps,
  PricingTableProps,
  TestimonialSectionProps,
  CTASectionProps,
  FAQSectionProps,
  StatsSectionProps,
  TeamSectionProps,
  BlogSectionProps,
  LogoGridProps,
  ContactFormProps,
  HeaderNavProps,
  FooterSectionProps,
  RichTextBlockProps,
  ImageBlockProps,
  SpacerProps,
  ColumnsLayoutProps,
  NewsletterSignupProps,
  GalleryProps,
  SocialProofProps,
  ComparisonTableProps,
  ProductCardsProps,
  FeatureShowcaseProps,
  CountdownTimerProps,
  AnnouncementBarProps,
  BannerProps,
  CustomSectionProps,
  ButtonBlockProps,
  CardBlockProps,
  HeadingBlockProps,
  TextBlockProps,
  BlankProps,
  FlexProps,
  GridProps,
} from "./types";

// ─── Root ──────────────────────────────────────────────────────────────

type RootProps = DefaultRootProps;

const Root: RootConfig<{ props: RootProps }> = {
  defaultProps: {
    title: "My Page",
  },
  render: ({ puck: { renderDropZone: DropZone } }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <DropZone zone="default-zone" style={{ flexGrow: 1 }} />
      </div>
    );
  },
};

// ─── Sections ──────────────────────────────────────────────────────────

const HeroSection: ComponentConfig<HeroSectionProps> = {
  fields: {
    heading: { type: "text", contentEditable: true },
    subtext: { type: "textarea", contentEditable: true },
    badge: { type: "text" },
    ctaText: { type: "text", contentEditable: true },
    ctaHref: { type: "text" },
    ctaSecondaryText: { type: "text" },
    ctaSecondaryHref: { type: "text" },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    layout: {
      type: "select",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Split \u2014 Image Left", value: "split-left" },
        { label: "Split \u2014 Image Right", value: "split-right" },
      ],
    },
    backgroundUrl: { type: "text", label: "Background Image URL" },
    backgroundOverlay: {
      type: "radio",
      options: [
        { label: "On", value: true },
        { label: "Off", value: false },
      ],
    },
    videoUrl: { type: "text", label: "Video Background URL (mp4)" },
    imageUrl: { type: "text", label: "Hero Image URL" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Fade In", value: "fade-in" },
        { label: "Slide Left", value: "slide-left" },
        { label: "Slide Right", value: "slide-right" },
        { label: "Zoom", value: "zoom" },
      ],
    },
    trustBadges: {
      type: "array",
      arrayFields: { text: { type: "text" } },
      getItemSummary: (item: Record<string, unknown>) => (item.text as string) || "Badge",
    },
    gradientFrom: { type: "text", label: "Gradient From (hex)" },
    gradientTo: { type: "text", label: "Gradient To (hex)" },
    gradientPreset: {
      type: "select",
      label: "Gradient Preset",
      options: [
        { label: "None", value: "" },
        { label: "Sunset", value: "sunset" },
        { label: "Ocean", value: "ocean" },
        { label: "Forest", value: "forest" },
        { label: "Aurora", value: "aurora" },
        { label: "Midnight", value: "midnight" },
        { label: "Berry", value: "berry" },
        { label: "Ember", value: "ember" },
      ],
    },
    padding: {
      type: "select",
      options: [
        { label: "Small", value: "48px" },
        { label: "Medium", value: "96px" },
        { label: "Large", value: "128px" },
      ],
    },
  },
  defaultProps: {
    heading: "Welcome to Our Website",
    subtext: "Build something amazing with our powerful tools and platform.",
    ctaText: "Get Started",
    ctaHref: "#",
    align: "left",
    layout: "centered",
    backgroundOverlay: false,
    animation: "none",
    padding: "96px",
  },
  render: HeroSectionRender,
};

const FeaturesGrid: ComponentConfig<FeaturesGridProps> = {
  fields: {
    heading: { type: "text", contentEditable: true },
    subtext: { type: "textarea" },
    columns: {
      type: "select",
      options: [
        { label: "2 columns", value: 2 },
        { label: "3 columns", value: 3 },
        { label: "4 columns", value: 4 },
      ],
    },
    variant: {
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
      ],
    },
    cardStyle: {
      type: "select",
      options: [
        { label: "Icon", value: "icon" },
        { label: "Image", value: "image" },
        { label: "Flat", value: "flat" },
        { label: "Elevated", value: "elevated" },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Stagger Fade", value: "stagger-fade" },
        { label: "Stagger Slide", value: "stagger-slide" },
      ],
    },
    hoverEffect: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Lift", value: "lift" },
        { label: "Glow", value: "glow" },
        { label: "Border", value: "border" },
      ],
    },
    features: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        description: { type: "textarea" },
        icon: { type: "text" },
        imageUrl: { type: "text", label: "Image URL" },
      },
      getItemSummary: (col) => col.title,
    },
  },
  defaultProps: {
    heading: "Our Features",
    columns: 3,
    variant: "grid",
    cardStyle: "icon",
    animation: "none",
    hoverEffect: "none",
    features: [
      {
        title: "Easy to Use",
        description: "Our platform is designed with simplicity in mind.",
        icon: "zap",
      },
      {
        title: "Fast Performance",
        description: "Lightning-fast loading and response times.",
        icon: "speed",
      },
      {
        title: "Secure & Reliable",
        description: "Enterprise-grade security you can trust.",
        icon: "shield",
      },
    ],
  },
  render: FeaturesGridRender,
};

const PricingTable: ComponentConfig<PricingTableProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    pricingToggle: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    yearlyPlans: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        price: { type: "text" },
        period: { type: "text" },
        description: { type: "textarea" },
        savePercentage: { type: "text" },
        features: {
          type: "array",
          arrayFields: {
            value: { type: "text" },
          },
          getItemSummary: (col: Record<string, unknown>) => String(col.value ?? ""),
        },
        ctaText: { type: "text" },
        ctaHref: { type: "text" },
        highlighted: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      getItemSummary: (col) => col.name,
    },
    highlightedBadge: { type: "text" },
    currency: { type: "text" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger", value: "stagger" },
      ],
    },
    plans: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        price: { type: "text" },
        period: { type: "text" },
        description: { type: "textarea" },
        features: {
          type: "array",
          arrayFields: {
            value: { type: "text" },
          },
          getItemSummary: (col: Record<string, unknown>) => String(col.value ?? ""),
        },
        ctaText: { type: "text" },
        ctaHref: { type: "text" },
        highlighted: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      getItemSummary: (col) => col.name,
    },
  },
  defaultProps: {
    heading: "Pricing Plans",
    plans: [
      {
        name: "Free",
        price: "$0",
        period: "/month",
        description: "Perfect for getting started.",
        features: [
          { value: "1 Project" },
          { value: "Basic Templates" },
          { value: "Community Support" },
        ],
        ctaText: "Get Started",
        ctaHref: "#",
        highlighted: false,
      },
      {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For professionals and growing teams.",
        features: [
          { value: "Unlimited Projects" },
          { value: "Premium Templates" },
          { value: "Priority Support" },
          { value: "Custom Domains" },
        ],
        ctaText: "Go Pro",
        ctaHref: "#",
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "$99",
        period: "/month",
        description: "For large organizations with advanced needs.",
        features: [
          { value: "Everything in Pro" },
          { value: "SSO & SAML" },
          { value: "Dedicated Support" },
          { value: "SLA Guarantee" },
          { value: "Custom Integrations" },
        ],
        ctaText: "Contact Sales",
        ctaHref: "#",
        highlighted: false,
      },
    ],
  },
  render: PricingTableRender,
};

const TestimonialSection: ComponentConfig<TestimonialSectionProps> = {
  fields: {
    heading: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
      ],
    },
    autoplay: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    interval: { type: "text", label: "Auto-rotate interval (ms)" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger Fade", value: "stagger-fade" },
      ],
    },
    cardStyle: {
      type: "select",
      label: "Card Style",
      options: [
        { label: "Default", value: "default" },
        { label: "Elevated", value: "elevated" },
        { label: "Glass", value: "glass" },
      ],
    },
    testimonials: {
      type: "array",
      arrayFields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        avatarUrl: { type: "text" },
        rating: {
          type: "select",
          label: "Rating",
          options: [
            { label: "None", value: "" },
            { label: "5 Stars", value: "5" },
            { label: "4 Stars", value: "4" },
            { label: "3 Stars", value: "3" },
            { label: "2 Stars", value: "2" },
            { label: "1 Star", value: "1" },
          ],
        },
      },
      getItemSummary: (col) => col.author,
    },
  },
  defaultProps: {
    heading: "What Our Clients Say",
    variant: "grid",
    autoplay: false,
    interval: 5000,
    animation: "none",
    testimonials: [
      {
        quote: "This platform transformed our workflow. Highly recommended!",
        author: "Sarah Johnson",
        role: "CEO at TechCorp",
        rating: 5,
      },
      {
        quote: "The best tool we've ever used for building websites.",
        author: "Michael Chen",
        role: "Lead Developer at WebStudio",
        rating: 5,
      },
      {
        quote: "Outstanding support and an incredible product.",
        author: "Emily Davis",
        role: "Designer at CreativeHub",
        rating: 4,
      },
    ],
  },
  render: TestimonialSectionRender,
};

const CTASection: ComponentConfig<CTASectionProps> = {
  fields: {
    heading: { type: "text", contentEditable: true },
    subtext: { type: "textarea" },
    ctaText: { type: "text", contentEditable: true },
    ctaHref: { type: "text" },
    ctaSecondaryText: { type: "text", label: "Secondary Button Text" },
    ctaSecondaryHref: { type: "text", label: "Secondary Button Link" },
    layout: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Split", value: "split" },
      ],
    },
    imageUrl: { type: "text", label: "Image URL (for split layout)" },
    imagePosition: {
      type: "select",
      label: "Image Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Default", value: "default" },
        { label: "Gradient", value: "gradient" },
        { label: "Dark", value: "dark" },
      ],
    },
    backgroundUrl: { type: "text", label: "Background Image URL" },
    trustText: { type: "text", label: "Trust Text" },
    animation: {
      type: "select",
      label: "Entrance Animation",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Zoom", value: "zoom" },
      ],
    },
  },
  defaultProps: {
    heading: "Ready to Get Started?",
    subtext: "Join thousands of satisfied customers today.",
    ctaText: "Start Now",
    ctaHref: "#",
    layout: "centered",
    imagePosition: "right",
    variant: "default",
    animation: "none",
  },
  render: CTASectionRender,
};

const FAQSection: ComponentConfig<FAQSectionProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    accordion: {
      type: "radio",
      label: "Accordion Mode",
      options: [
        { label: "Accordion", value: true },
        { label: "Static", value: false },
      ],
    },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
      ],
    },
    searchable: {
      type: "radio",
      label: "Searchable",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    items: {
      type: "array",
      arrayFields: {
        question: { type: "text" },
        answer: { type: "textarea" },
        icon: { type: "text" },
      },
      getItemSummary: (col) => col.question,
    },
  },
  defaultProps: {
    heading: "Frequently Asked Questions",
    accordion: true,
    columns: 1,
    searchable: false,
    items: [
      {
        question: "How do I get started?",
        answer:
          "Simply sign up for a free account and follow the onboarding guide to create your first project.",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes, you can cancel anytime. Your data will be preserved for 30 days after cancellation.",
      },
      {
        question: "Do you offer custom integrations?",
        answer:
          "Yes, our Enterprise plan includes custom integrations. Contact our sales team for details.",
      },
      {
        question: "What kind of support do you offer?",
        answer:
          "We offer community support for free users, priority email support for Pro users, and dedicated support for Enterprise customers.",
      },
    ],
  },
  render: FAQSectionRender,
};

const StatsSection: ComponentConfig<StatsSectionProps> = {
  fields: {
    heading: { type: "text" },
    stats: {
      type: "array",
      arrayFields: {
        value: { type: "text" },
        label: { type: "text" },
        icon: { type: "text", label: "Icon (Material Symbol)" },
        prefix: { type: "text", label: "Prefix (e.g. $)" },
        suffix: { type: "text", label: "Suffix (e.g. +, K, %)" },
      },
      getItemSummary: (col) => col.label,
    },
    columns: {
      type: "select",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    animated: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    duration: { type: "text", label: "Animation Duration (ms)" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger", value: "stagger" },
      ],
    },
    cardStyle: {
      type: "select",
      options: [
        { label: "None (plain)", value: "none" },
        { label: "Card", value: "card" },
        { label: "Bordered", value: "bordered" },
        { label: "Gradient", value: "gradient" },
      ],
    },
  },
  defaultProps: {
    heading: "By the Numbers",
    stats: [
      { value: "500+", label: "Projects", icon: "rocket_launch" },
      { value: "50+", label: "Team Members", icon: "group" },
      { value: "99", label: "Satisfaction", suffix: "%", icon: "thumb_up" },
      { value: "24/7", label: "Support", icon: "support_agent" },
    ],
    columns: 4,
    animated: false,
    duration: 2000,
    animation: "none",
  },
  render: StatsSectionRender,
};

const TeamSection: ComponentConfig<TeamSectionProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    hoverEffect: {
      type: "select",
      label: "Card Hover Effect",
      options: [
        { label: "None", value: "none" },
        { label: "Flip", value: "flip" },
        { label: "Lift", value: "lift" },
      ],
    },
    socialLinks: {
      type: "radio",
      label: "Show Social Links",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger Fade", value: "stagger-fade" },
      ],
    },
    members: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        role: { type: "text" },
        avatarUrl: { type: "text" },
        socialTwitter: { type: "text", label: "Twitter/X URL" },
        socialLinkedin: { type: "text", label: "LinkedIn URL" },
        socialGithub: { type: "text", label: "GitHub URL" },
      },
      getItemSummary: (col) => col.name,
    },
  },
  defaultProps: {
    heading: "Our Team",
    hoverEffect: "none",
    socialLinks: false,
    animation: "none",
    members: [
      { name: "Alex Rivera", role: "CEO & Founder" },
      { name: "Jordan Lee", role: "CTO" },
      { name: "Sam Patel", role: "Head of Design" },
      { name: "Taylor Kim", role: "Lead Engineer" },
    ],
  },
  render: TeamSectionRender,
};

const BlogSection: ComponentConfig<BlogSectionProps> = {
  fields: {
    heading: { type: "text" },
    posts: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        excerpt: { type: "textarea" },
        imageUrl: { type: "text" },
        date: { type: "text" },
        href: { type: "text" },
        category: { type: "text" },
      },
      getItemSummary: (col) => col.title,
    },
    columns: {
      type: "select",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
      ],
    },
    variant: {
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
      ],
    },
    masonry: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    categoryFilter: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger Fade", value: "stagger-fade" },
      ],
    },
  },
  defaultProps: {
    heading: "Latest Posts",
    posts: [
      {
        title: "Getting Started with Our Platform",
        excerpt: "Learn the basics and build your first project in minutes.",
        date: "2024-01-15",
        href: "#",
      },
      {
        title: "Advanced Tips and Tricks",
        excerpt: "Take your skills to the next level with these pro tips.",
        date: "2024-01-10",
        href: "#",
      },
      {
        title: "Case Study: How Company X Grew 300%",
        excerpt:
          "Discover how our tools helped Company X achieve remarkable growth.",
        date: "2024-01-05",
        href: "#",
      },
    ],
    columns: 3,
  },
  render: BlogSectionRender,
};

const LogoGrid: ComponentConfig<LogoGridProps> = {
  fields: {
    heading: { type: "text" },
    logos: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        imageUrl: { type: "text" },
      },
      getItemSummary: (col) => col.name,
    },
    variant: {
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
      ],
    },
    grayscale: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    tooltip: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger Fade", value: "stagger-fade" },
      ],
    },
  },
  defaultProps: {
    heading: "Trusted By",
    logos: [
      { name: "Acme Corp", imageUrl: "/logos/acme.svg" },
      { name: "Globex", imageUrl: "/logos/globex.svg" },
      { name: "Initech", imageUrl: "/logos/initech.svg" },
      { name: "Hooli", imageUrl: "/logos/hooli.svg" },
      { name: "Massive Dynamic", imageUrl: "/logos/massive-dynamic.svg" },
      { name: "Pied Piper", imageUrl: "/logos/pied-piper.svg" },
    ],
    variant: "grid",
    grayscale: true,
    tooltip: false,
    animation: "none",
  },
  render: LogoGridRender,
};

const ContactForm: ComponentConfig<ContactFormProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    showPhone: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showCompany: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    buttonText: { type: "text" },
  },
  defaultProps: {
    heading: "Get in Touch",
    subtext: "We'd love to hear from you",
    showPhone: false,
    showCompany: false,
    buttonText: "Send Message",
  },
  render: ContactFormRender,
};

// ─── Navigation ────────────────────────────────────────────────────────

const HeaderNav: ComponentConfig<HeaderNavProps> = {
  fields: {
    logo: { type: "text" },
    logoImageUrl: { type: "text", label: "Logo Image URL" },
    links: {
      type: "array",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
        children: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            href: { type: "text" },
          },
          getItemSummary: (col: Record<string, unknown>) => (col.label as string) || "Sub-link",
        },
      },
      getItemSummary: (col) => col.label,
    },
    ctaText: { type: "text" },
    ctaHref: { type: "text" },
    sticky: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    mobileMenu: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    transparent: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    showSearch: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  },
  defaultProps: {
    logo: "YourBrand",
    links: [
      { label: "Home", href: "#" },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
    ],
    ctaText: "Get Started",
    ctaHref: "#",
    sticky: true,
    mobileMenu: true,
    transparent: false,
    showSearch: false,
  },
  render: HeaderNavRender,
};

const FooterSection: ComponentConfig<FooterSectionProps> = {
  fields: {
    logo: { type: "text" },
    description: { type: "textarea" },
    linkGroups: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        links: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            href: { type: "text" },
          },
          getItemSummary: (col) => col.label,
        },
      },
      getItemSummary: (col) => col.title,
    },
    copyright: { type: "text" },
    socialLinks: {
      type: "array",
      arrayFields: {
        platform: { type: "text" },
        url: { type: "text" },
      },
      getItemSummary: (col) => col.platform,
    },
    backToTop: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    newsletterIntegration: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    showCopyright: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  },
  defaultProps: {
    logo: "YourBrand",
    description: "Building amazing websites",
    backToTop: false,
    newsletterIntegration: false,
    showCopyright: true,
    linkGroups: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Templates", href: "#" },
          { label: "Integrations", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Press", href: "#" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Documentation", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Community", href: "#" },
          { label: "Status", href: "#" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
          { label: "Cookie Policy", href: "#" },
          { label: "Licenses", href: "#" },
        ],
      },
    ],
    copyright: "\u00a9 2024 YourBrand. All rights reserved.",
  },
  render: FooterSectionRender,
};

// ─── Typography ────────────────────────────────────────────────────────

const RichTextBlock: ComponentConfig<RichTextBlockProps> = {
  fields: {
    content: { type: "richtext" },
    align: {
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    maxWidth: {
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
        { label: "Full", value: "full" },
      ],
    },
  },
  defaultProps: {
    content: "<p>Enter your text here...</p>",
    align: "left",
    maxWidth: "lg",
  },
  render: RichTextBlockRender,
};

// ─── Media ─────────────────────────────────────────────────────────────

const ImageBlock: ComponentConfig<ImageBlockProps> = {
  fields: {
    src: { type: "text", label: "Image URL" },
    alt: { type: "text" },
    width: { type: "text" },
    borderRadius: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Full", value: "full" },
      ],
    },
  },
  defaultProps: {
    src: "/stock/hero/gradient-purple.webp",
    alt: "Image",
    width: "100%",
    borderRadius: "md",
  },
  render: ImageBlockRender,
};

// ─── Layout ────────────────────────────────────────────────────────────

const Spacer: ComponentConfig<SpacerProps> = {
  fields: {
    height: { type: "number", min: 8, max: 200 },
    showDivider: {
      type: "radio",
      label: "Show Divider",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    dividerStyle: {
      type: "select",
      label: "Divider Style",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Dashed", value: "dashed" },
        { label: "Dotted", value: "dotted" },
      ],
    },
    dividerColor: { type: "text", label: "Divider Color (hex)" },
    dividerWidth: {
      type: "select",
      label: "Divider Width",
      options: [
        { label: "Full Width", value: "full" },
        { label: "Contained", value: "contained" },
      ],
    },
  },
  defaultProps: {
    height: 32,
    showDivider: false,
    dividerStyle: "solid",
    dividerWidth: "full",
  },
  render: SpacerRender,
};

const ColumnsLayout: ComponentConfig<ColumnsLayoutProps> = {
  fields: {
    columns: {
      type: "select",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    gap: { type: "number", min: 0, max: 64 },
    gapSize: {
      type: "select",
      label: "Gap Size",
      options: [
        { label: "Small (12px)", value: "sm" },
        { label: "Medium (24px)", value: "md" },
        { label: "Large (32px)", value: "lg" },
        { label: "Extra Large (48px)", value: "xl" },
      ],
    },
    unequalWidths: {
      type: "radio",
      label: "Unequal Column Widths",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    widths: {
      type: "text",
      label: "Custom Widths (comma-separated, e.g. 60%,40%)",
    },
    stackOrder: {
      type: "select",
      label: "Mobile Stack Order",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Reverse", value: "reverse" },
      ],
    },
    col1: { type: "slot" },
    col2: { type: "slot" },
    col3: { type: "slot" },
    col4: { type: "slot" },
  },
  defaultProps: {
    columns: 2,
    gap: 24,
    unequalWidths: false,
    stackOrder: "normal",
  },
  render: ColumnsLayoutRender,
};

// ─── Marketing Extras ──────────────────────────────────────────────────

const NewsletterSignup: ComponentConfig<NewsletterSignupProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    placeholder: { type: "text" },
    buttonText: { type: "text" },
    layout: {
      type: "select",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Split", value: "split" },
      ],
    },
    backgroundUrl: { type: "text", label: "Background Image URL" },
    subscriberCount: { type: "text", label: "Subscriber Count (e.g. 10,000+)" },
    privacyNote: { type: "text", label: "Privacy Note" },
    bgVariant: {
      type: "select",
      label: "Background Variant",
      options: [
        { label: "None", value: "none" },
        { label: "Gradient", value: "gradient" },
        { label: "Image", value: "image" },
      ],
    },
    testimonialQuote: { type: "textarea", label: "Testimonial Quote" },
    testimonialAuthor: { type: "text", label: "Quote Author" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Zoom", value: "zoom" },
      ],
    },
  },
  defaultProps: {
    heading: "Stay Updated",
    subtext: "Subscribe to our newsletter for the latest updates and news.",
    placeholder: "Enter your email",
    buttonText: "Subscribe",
    layout: "centered",
    bgVariant: "none",
    animation: "none",
  },
  render: NewsletterSignupRender,
};

const Gallery: ComponentConfig<GalleryProps> = {
  fields: {
    heading: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
        { label: "Masonry", value: "masonry" },
      ],
    },
    columns: {
      type: "select",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    lightbox: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    hoverEffect: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Zoom", value: "zoom" },
        { label: "Overlay", value: "overlay" },
      ],
    },
    images: {
      type: "array",
      arrayFields: {
        src: { type: "text" },
        alt: { type: "text" },
        caption: { type: "text" },
      },
      getItemSummary: (col) => col.alt || col.src,
    },
  },
  defaultProps: {
    heading: "Gallery",
    columns: 3,
    variant: "grid",
    lightbox: false,
    hoverEffect: "none",
    images: [
      { src: "/stock/features/analytics-dashboard.webp", alt: "Image 1" },
      { src: "/stock/features/collaboration.webp", alt: "Image 2" },
      { src: "/stock/features/data-charts.webp", alt: "Image 3" },
      { src: "/stock/blog/writing.webp", alt: "Image 4" },
      { src: "/stock/blog/notebook.webp", alt: "Image 5" },
      { src: "/stock/blog/laptop-coffee.webp", alt: "Image 6" },
    ],
  },
  render: GalleryRender,
};

const SocialProof: ComponentConfig<SocialProofProps> = {
  fields: {
    heading: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Notification", value: "notification" },
      ],
    },
    stats: {
      type: "array",
      arrayFields: {
        value: { type: "text" },
        label: { type: "text" },
      },
      getItemSummary: (col) => col.label,
    },
    logos: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        imageUrl: { type: "text" },
      },
      getItemSummary: (col) => col.name,
    },
    showAvatars: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    avatarCount: { type: "number", min: 1, max: 20 },
    avatarUrls: {
      type: "array",
      arrayFields: {
        url: { type: "text", label: "Avatar Image URL" },
      },
      getItemSummary: (item: Record<string, unknown>) =>
        (item.url as string) || "Avatar",
    },
    testimonialText: { type: "textarea" },
    animated: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Stagger Fade", value: "stagger-fade" },
      ],
    },
  },
  defaultProps: {
    heading: "Trusted by Thousands",
    variant: "default",
    stats: [
      { value: "10,000+", label: "Users" },
      { value: "98%", label: "Satisfaction" },
      { value: "150+", label: "Countries" },
    ],
    logos: [],
    showAvatars: true,
    avatarCount: 5,
    testimonialText: "This product has transformed how we work. Highly recommended!",
    animated: false,
    animation: "none",
  },
  render: SocialProofRender,
};

const ComparisonTable: ComponentConfig<ComparisonTableProps> = {
  fields: {
    heading: { type: "text" },
    plans: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        highlighted: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      getItemSummary: (col) => col.name,
    },
    features: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        values: { type: "text", label: "Values (comma-separated)" },
      },
      getItemSummary: (col) => col.name,
    },
    highlightedPlan: { type: "number", label: "Highlighted Plan Index (0-based)", min: 0 },
    highlightedColor: { type: "text", label: "Highlight Color (hex, e.g. #dbeafe)" },
    tooltipDetails: {
      type: "radio",
      label: "Show Tooltips on Hover",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
      ],
    },
  },
  defaultProps: {
    heading: "Compare Plans",
    tooltipDetails: false,
    animation: "none",
    plans: [
      { name: "Free", highlighted: false },
      { name: "Pro", highlighted: true },
      { name: "Enterprise", highlighted: false },
    ],
    features: [
      { name: "Projects", values: ["1", "10", "Unlimited"] },
      { name: "Storage", values: ["1GB", "50GB", "Unlimited"] },
      { name: "Support", values: ["Community", "Priority", "24/7"] },
      { name: "Custom Domain", values: ["\u2014", "Yes", "Yes"] },
    ],
  },
  render: ComparisonTableRender,
};

const ProductCards: ComponentConfig<ProductCardsProps> = {
  fields: {
    heading: { type: "text" },
    columns: {
      type: "select",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    quickView: {
      type: "radio",
      label: "Quick View",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    saleBadge: {
      type: "radio",
      label: "Auto Sale Badge",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    hoverEffect: {
      type: "select",
      label: "Hover Effect",
      options: [
        { label: "None", value: "none" },
        { label: "Lift", value: "lift" },
        { label: "Zoom", value: "zoom" },
      ],
    },
    products: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        price: { type: "text" },
        originalPrice: { type: "text" },
        imageUrl: { type: "text" },
        description: { type: "textarea" },
        badge: { type: "text" },
        href: { type: "text" },
        rating: {
          type: "select",
          label: "Rating",
          options: [
            { label: "None", value: "" },
            { label: "5 Stars", value: "5" },
            { label: "4 Stars", value: "4" },
            { label: "3 Stars", value: "3" },
            { label: "2 Stars", value: "2" },
            { label: "1 Star", value: "1" },
          ],
        },
        inStock: {
          type: "radio",
          label: "In Stock",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      getItemSummary: (col) => col.name,
    },
  },
  defaultProps: {
    heading: "Our Products",
    columns: 3,
    quickView: false,
    saleBadge: false,
    hoverEffect: "none",
    products: [
      { name: "Starter Kit", price: "$29", description: "Perfect for beginners", href: "#", rating: 4, inStock: true },
      { name: "Pro Bundle", price: "$79", originalPrice: "$99", badge: "Sale", description: "Best value for professionals", href: "#", rating: 5, inStock: true },
      { name: "Enterprise Pack", price: "$199", description: "Everything you need", href: "#", rating: 4, inStock: true },
    ],
  },
  render: ProductCardsRender,
};

const FeatureShowcase: ComponentConfig<FeatureShowcaseProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    imageUrl: { type: "text", label: "Image URL" },
    videoUrl: { type: "text", label: "Video URL (replaces image)" },
    features: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        description: { type: "textarea" },
        icon: {
          type: "select",
          label: "Icon",
          options: [
            { label: "None", value: "" },
            { label: "Zap", value: "zap" },
            { label: "Speed", value: "speed" },
            { label: "Shield", value: "shield" },
            { label: "Star", value: "star" },
            { label: "Check", value: "check" },
            { label: "Globe", value: "globe" },
            { label: "Heart", value: "heart" },
            { label: "Settings", value: "settings" },
          ],
        },
      },
      getItemSummary: (col) => col.title,
    },
    imagePosition: {
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    ctaText: { type: "text" },
    ctaHref: { type: "text" },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Slide Left", value: "slide-left" },
        { label: "Slide Right", value: "slide-right" },
      ],
    },
    tabbed: {
      type: "radio",
      label: "Tabbed Features",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  },
  defaultProps: {
    heading: "Why Choose Us",
    subtext: "Discover what makes our platform stand out.",
    imageUrl: "/stock/features/analytics-dashboard.webp",
    features: [
      { title: "Lightning Fast", description: "Optimized for speed with instant load times.", icon: "speed" },
      { title: "Secure by Default", description: "Enterprise-grade security built into every layer.", icon: "shield" },
      { title: "Easy to Scale", description: "Grows with your business without breaking a sweat.", icon: "zap" },
    ],
    imagePosition: "right",
    ctaText: "Learn More",
    ctaHref: "#",
    animation: "none",
    tabbed: false,
  },
  render: FeatureShowcaseRender,
};

const CountdownTimer: ComponentConfig<CountdownTimerProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    endDate: { type: "text", label: "End Date (ISO)" },
    ctaText: { type: "text" },
    ctaHref: { type: "text" },
    showDays: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showHours: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    style: {
      type: "select",
      label: "Visual Style",
      options: [
        { label: "Default", value: "default" },
        { label: "Flip", value: "flip" },
        { label: "Minimal", value: "minimal" },
      ],
    },
    showLabels: {
      type: "radio",
      label: "Show Labels",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
      ],
    },
    endMessage: { type: "text", label: "End Message" },
  },
  defaultProps: {
    heading: "Limited Time Offer",
    subtext: "Don't miss out on our biggest sale of the year.",
    endDate: "2026-12-31T23:59:59Z",
    ctaText: "Shop Now",
    ctaHref: "#",
    showDays: true,
    showHours: true,
    style: "default",
    showLabels: true,
    animation: "none",
    endMessage: "This offer has ended!",
  },
  render: CountdownTimerRender,
};

const AnnouncementBar: ComponentConfig<AnnouncementBarProps> = {
  fields: {
    message: { type: "text" },
    ctaText: { type: "text" },
    ctaHref: { type: "text" },
    bgColor: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Dark", value: "dark" },
        { label: "Accent", value: "accent" },
        { label: "Custom", value: "custom" },
      ],
    },
    customBgColor: { type: "text", label: "Custom Background Color (hex)" },
    dismissible: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Slide Down", value: "slide-down" },
        { label: "Fade In", value: "fade-in" },
      ],
    },
    icon: {
      type: "select",
      options: [
        { label: "None", value: "" },
        { label: "Info", value: "info" },
        { label: "Megaphone", value: "megaphone" },
        { label: "Gift", value: "gift" },
        { label: "Tag", value: "tag" },
      ],
    },
  },
  defaultProps: {
    message: "New: Check out our latest features!",
    ctaText: "Learn More",
    ctaHref: "#",
    bgColor: "primary",
    dismissible: false,
    animation: "none",
  },
  render: AnnouncementBarRender,
};

const Banner: ComponentConfig<BannerProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    ctaText: { type: "text" },
    ctaHref: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Gradient", value: "gradient" },
        { label: "Image", value: "image" },
        { label: "Solid", value: "solid" },
        { label: "Video", value: "video" },
      ],
    },
    backgroundUrl: { type: "text", label: "Background Image URL" },
    videoUrl: { type: "text", label: "Video Background URL (mp4)" },
    align: {
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    countdown: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    countdownDate: { type: "text", label: "Countdown End Date (YYYY-MM-DD)" },
    animatedGradient: {
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    animation: {
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Fade Up", value: "fade-up" },
        { label: "Zoom", value: "zoom" },
      ],
    },
  },
  defaultProps: {
    heading: "Special Promotion",
    subtext: "Get 50% off your first month. Limited time only.",
    ctaText: "Claim Offer",
    ctaHref: "#",
    variant: "gradient",
    align: "center",
    countdown: false,
    animatedGradient: false,
    animation: "none",
  },
  render: BannerRender,
};

const CustomSection: ComponentConfig<CustomSectionProps> = {
  fields: {
    html: { type: "textarea", label: "HTML Code" },
    css: { type: "textarea", label: "Custom CSS (optional)" },
    preview: { type: "text", label: "Description" },
    minHeight: { type: "text", label: "Min Height" },
  },
  defaultProps: {
    html: "",
    minHeight: "200px",
  },
  render: CustomSectionRender,
};

// ─── Config ────────────────────────────────────────────────────────────

// NOTE: NAME_FIELD, STYLE_FIELDS removed — now managed by UnifiedInspector
// (Content tab = component fields, Style tab = StylesField, Advanced tab = name + className)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withMetaFields<T extends Record<string, any>>(comp: T): T {
  return comp;
}

export const config: Config<{ components: ComponentProps }> = {
  root: Root,
  categories: categories as Config<{ components: ComponentProps }>["categories"],
  components: {
    // Atomic (composable)
    ButtonBlock: withMetaFields(Button),
    CardBlock: withMetaFields(Card),
    HeadingBlock: withMetaFields(Heading),
    TextBlock: withMetaFields(Text),
    RichTextBlock: withMetaFields(RichTextBlock),
    Blank: withMetaFields(Blank),
    Flex: withMetaFields(Flex),
    Grid: withMetaFields(Grid),
    SectionBlock: withMetaFields(SectionBlockConfig),
    // Sections
    HeroSection: withMetaFields(HeroSection),
    FeaturesGrid: withMetaFields(FeaturesGrid),
    PricingTable: withMetaFields(PricingTable),
    TestimonialSection: withMetaFields(TestimonialSection),
    CTASection: withMetaFields(CTASection),
    FAQSection: withMetaFields(FAQSection),
    StatsSection: withMetaFields(StatsSection),
    TeamSection: withMetaFields(TeamSection),
    BlogSection: withMetaFields(BlogSection),
    LogoGrid: withMetaFields(LogoGrid),
    ContactForm: withMetaFields(ContactForm),
    HeaderNav: withMetaFields(HeaderNav),
    FooterSection: withMetaFields(FooterSection),
    ImageBlock: withMetaFields(ImageBlock),
    Spacer: withMetaFields(Spacer),
    ColumnsLayout: withMetaFields(ColumnsLayout),
    NewsletterSignup: withMetaFields(NewsletterSignup),
    Gallery: withMetaFields(Gallery),
    SocialProof: withMetaFields(SocialProof),
    ComparisonTable: withMetaFields(ComparisonTable),
    ProductCards: withMetaFields(ProductCards),
    FeatureShowcase: withMetaFields(FeatureShowcase),
    CountdownTimer: withMetaFields(CountdownTimer),
    AnnouncementBar: withMetaFields(AnnouncementBar),
    Banner: withMetaFields(Banner),
    CustomSection: withMetaFields(CustomSection),
  },
};

export default config;
