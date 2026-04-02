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
import { TextBlock as TextBlockRender } from "./components/TextBlock";
import { ImageBlock as ImageBlockRender } from "./components/ImageBlock";
import { Spacer as SpacerRender } from "./components/Spacer";
import { ColumnsLayout as ColumnsLayoutRender } from "./components/ColumnsLayout";

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
  TextBlockProps,
  ImageBlockProps,
  SpacerProps,
  ColumnsLayoutProps,
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
    backgroundUrl: { type: "text", label: "Background Image URL" },
    backgroundOverlay: {
      type: "radio",
      options: [
        { label: "On", value: true },
        { label: "Off", value: false },
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
    backgroundOverlay: false,
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
    features: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        description: { type: "textarea" },
        icon: { type: "text" },
      },
      getItemSummary: (col) => col.title,
    },
  },
  defaultProps: {
    heading: "Our Features",
    columns: 3,
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
    testimonials: {
      type: "array",
      arrayFields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        avatarUrl: { type: "text" },
      },
      getItemSummary: (col) => col.author,
    },
  },
  defaultProps: {
    heading: "What Our Clients Say",
    testimonials: [
      {
        quote: "This platform transformed our workflow. Highly recommended!",
        author: "Sarah Johnson",
        role: "CEO at TechCorp",
      },
      {
        quote: "The best tool we've ever used for building websites.",
        author: "Michael Chen",
        role: "Lead Developer at WebStudio",
      },
      {
        quote: "Outstanding support and an incredible product.",
        author: "Emily Davis",
        role: "Designer at CreativeHub",
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
    backgroundUrl: { type: "text" },
  },
  defaultProps: {
    heading: "Ready to Get Started?",
    subtext: "Join thousands of satisfied customers today.",
    ctaText: "Start Now",
    ctaHref: "#",
  },
  render: CTASectionRender,
};

const FAQSection: ComponentConfig<FAQSectionProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    items: {
      type: "array",
      arrayFields: {
        question: { type: "text" },
        answer: { type: "textarea" },
      },
      getItemSummary: (col) => col.question,
    },
  },
  defaultProps: {
    heading: "Frequently Asked Questions",
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
  },
  defaultProps: {
    heading: "By the Numbers",
    stats: [
      { value: "500+", label: "Projects" },
      { value: "50+", label: "Team Members" },
      { value: "99%", label: "Satisfaction" },
      { value: "24/7", label: "Support" },
    ],
    columns: 4,
  },
  render: StatsSectionRender,
};

const TeamSection: ComponentConfig<TeamSectionProps> = {
  fields: {
    heading: { type: "text" },
    subtext: { type: "textarea" },
    members: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        role: { type: "text" },
        avatarUrl: { type: "text" },
      },
      getItemSummary: (col) => col.name,
    },
  },
  defaultProps: {
    heading: "Our Team",
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
    links: {
      type: "array",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
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
  },
  defaultProps: {
    logo: "YourBrand",
    description: "Building amazing websites",
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

const TextBlock: ComponentConfig<TextBlockProps> = {
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
  render: TextBlockRender,
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
  },
  defaultProps: {
    height: 32,
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
    col1: { type: "slot" },
    col2: { type: "slot" },
    col3: { type: "slot" },
    col4: { type: "slot" },
  },
  defaultProps: {
    columns: 2,
    gap: 24,
  },
  render: ColumnsLayoutRender,
};

// ─── Config ────────────────────────────────────────────────────────────

export const config: Config<{ components: ComponentProps }> = {
  root: Root,
  categories: categories as Config<{ components: ComponentProps }>["categories"],
  components: {
    HeroSection,
    FeaturesGrid,
    PricingTable,
    TestimonialSection,
    CTASection,
    FAQSection,
    StatsSection,
    TeamSection,
    BlogSection,
    LogoGrid,
    ContactForm,
    HeaderNav,
    FooterSection,
    TextBlock,
    ImageBlock,
    Spacer,
    ColumnsLayout,
  },
};

export default config;
