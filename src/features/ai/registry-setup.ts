/**
 * Template Registry Setup — registers all existing templates into the global registry.
 *
 * Import this file once at app startup (or in the API route) to populate the registry.
 * New variant templates should also be registered here.
 */

import { registerTemplate } from './template-registry';
import type {
  HeroContent, FeaturesContent, PricingContent, TestimonialContent,
  CTAContent, FAQContent, ContactContent, GalleryContent,
  TeamContent, StatsContent, BlogContent, HeaderContent, FooterContent,
} from './template-registry';

import { generateHeroSection } from './templates/hero-section';
import { generateHeroSplitImage } from './templates/hero-split-image';
import { generateHeroBackgroundImage } from './templates/hero-background-image';
import { generateHeroMinimalDark } from './templates/hero-minimal-dark';
import { generateFeaturesGrid } from './templates/features-grid';
import { generateFeaturesZigzag } from './templates/features-zigzag';
import { generateFeaturesSimple2Col } from './templates/features-simple-2col';
import { generatePricingSection } from './templates/pricing-section';
import { generatePricingMinimal } from './templates/pricing-minimal';

import { generateTestimonialSection } from './templates/testimonial-section';
import { generateTestimonialSingle } from './templates/testimonial-single';
import { generateCtaSection } from './templates/cta-section';
import { generateCtaCenteredSimple } from './templates/cta-centered-simple';
import { generateHeaderNav } from './templates/header-nav';
import { generateHeaderDark } from './templates/header-dark';
import { generateFooter } from './templates/footer';
import { generateFooterMinimal } from './templates/footer-minimal';
import { generateContactForm } from './templates/contact-form';
import { generateContactMinimal } from './templates/contact-minimal';
import { generateFaqSection } from './templates/faq-section';
import { generateFaqTwoColumn } from './templates/faq-two-column';
import { generateGallerySection } from './templates/gallery-section';
import { generateStatsSection } from './templates/stats-section';
import { generateStatsGrid } from './templates/stats-grid';
import { generateTeamSection } from './templates/team-section';
import { generateLogoGridSection } from './templates/logo-grid-section';
import { generateBlogSection } from './templates/blog-section';

// Tailwind (Style B) templates — use className + layout: {}
import { generateHeroTWDarkBg } from './templates/hero-tw-dark-bg';
import { generateHeroTWLightCentered } from './templates/hero-tw-light-centered';
import { generateHeroTWSplit } from './templates/hero-tw-split';
import { generateFeaturesTWCards } from './templates/features-tw-cards';
import { generatePricingTW2Tier } from './templates/pricing-tw-2tier';
import { generateTestimonialTWStars } from './templates/testimonial-tw-stars';
import { generateCtaTWSplit } from './templates/cta-tw-split';

// Helper to cast typed content to the existing props format
const p = (content: unknown): Record<string, unknown> | undefined => content as Record<string, unknown>;

let _initialized = false;

/** Register all templates. Safe to call multiple times (idempotent). */
export function initializeRegistry(): void {
  if (_initialized) return;
  _initialized = true;

  // ─── Hero ─────────────────────────────────────────────────────────────
  registerTemplate<HeroContent>({
    id: 'hero_gradient_centered',
    category: 'hero',
    label: 'Gradient Centered Hero',
    description: 'Full-width gradient background, centered text with badge, 2 CTA buttons (white primary + outline)',
    generate: (content) => generateHeroSection(p(content)),
    defaultContent: {
      heading: 'Welcome to Our Website',
      subtext: 'Build something amazing with our platform. Fast, easy, and beautiful.',
      ctaText: 'Get Started',
      ctaHref: '#',
    },
  });

  // ─── Features ─────────────────────────────────────────────────────────
  registerTemplate<FeaturesContent>({
    id: 'features_card_grid_3col',
    category: 'features',
    label: 'Features Card Grid',
    description: '3-column card grid with icons, titles, and descriptions. Responsive layout with pb-card styling.',
    generate: (content) => generateFeaturesGrid(p(content)),
    defaultContent: {
      heading: 'Features',
      subtitle: 'Everything you need to build amazing websites',
      items: [
        { title: 'Fast Performance', description: 'Optimized for speed with lightning-fast load times.' },
        { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime.' },
        { title: 'Easy Integration', description: 'Connect with your existing tools and workflows.' },
      ],
    },
  });

  // ─── Pricing ──────────────────────────────────────────────────────────
  registerTemplate<PricingContent>({
    id: 'pricing_cards_3col',
    category: 'pricing',
    label: 'Pricing Cards',
    description: '3-column pricing cards with highlighted middle tier, feature lists, and CTA buttons.',
    generate: (content) => generatePricingSection(p(content)),
    defaultContent: {
      heading: 'Pricing Plans',
      subtitle: 'Choose the plan that fits your needs',
      tiers: [
        { name: 'Basic', price: '$9', description: 'Perfect for getting started', features: ['1 User', '5 Projects', '1GB Storage'], highlighted: false },
        { name: 'Pro', price: '$29', description: 'Best for professionals', features: ['5 Users', '25 Projects', '10GB Storage', 'Priority Support'], highlighted: true },
        { name: 'Enterprise', price: '$99', description: 'For large organizations', features: ['Unlimited Users', 'Unlimited Projects', '100GB Storage', '24/7 Support'], highlighted: false },
      ],
    },
  });

  // ─── Testimonial ──────────────────────────────────────────────────────
  registerTemplate<TestimonialContent>({
    id: 'testimonial_cards_3col',
    category: 'testimonial',
    label: 'Testimonial Cards',
    description: '3-column card grid with quote marks, author names, roles, and optional avatars.',
    generate: (content) => generateTestimonialSection(p(content)),
    defaultContent: {
      heading: 'What Our Customers Say',
      subtitle: 'Trusted by thousands of teams worldwide',
      quotes: [
        { quote: 'This platform transformed our workflow. We shipped twice as fast.', author: 'Sarah Johnson', role: 'CTO, TechCorp' },
        { quote: 'The best builder experience I have ever used. Intuitive and powerful.', author: 'Mike Chen', role: 'Designer, StartupXYZ' },
        { quote: 'Our conversion rates improved by 40% after switching.', author: 'Emily Davis', role: 'Marketing Lead, GrowthCo' },
      ],
    },
  });

  // ─── CTA ──────────────────────────────────────────────────────────────
  registerTemplate<CTAContent>({
    id: 'cta_gradient_bar',
    category: 'cta',
    label: 'Gradient CTA Bar',
    description: 'Full-width gradient background with badge, large heading, subtext, and 2 CTA buttons.',
    generate: (content) => generateCtaSection(p(content)),
    defaultContent: {
      badge: 'Limited Time Offer',
      heading: 'Ready to Get Started?',
      subtext: 'Join thousands of users who are already building faster.',
      ctaText: 'Sign Up Now',
      ctaHref: '#',
    },
  });

  // ─── FAQ ──────────────────────────────────────────────────────────────
  registerTemplate<FAQContent>({
    id: 'faq_accordion',
    category: 'faq',
    label: 'FAQ Accordion',
    description: 'Centered FAQ section with expandable question/answer items in card-style layout.',
    generate: (content) => generateFaqSection(p(content)),
    defaultContent: {
      heading: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions.',
      items: [
        { question: 'How does it work?', answer: 'Our platform uses AI to generate websites from text descriptions.' },
        { question: 'Is there a free plan?', answer: 'Yes! We offer a free tier with up to 3 projects.' },
        { question: 'Can I export my website?', answer: 'You can export as clean HTML, CSS, and JavaScript files.' },
      ],
    },
  });

  // ─── Contact ──────────────────────────────────────────────────────────
  registerTemplate<ContactContent>({
    id: 'contact_card_form',
    category: 'contact',
    label: 'Contact Card Form',
    description: 'Card-wrapped contact form with heading, configurable fields, and submit button.',
    generate: (content) => generateContactForm(p(content)),
    defaultContent: {
      heading: 'Get in Touch',
      subtitle: "We'd love to hear from you.",
      fields: ['Name', 'Email', 'Message'],
      submitText: 'Send Message',
    },
  });

  // ─── Gallery ──────────────────────────────────────────────────────────
  registerTemplate<GalleryContent>({
    id: 'gallery_grid',
    category: 'gallery',
    label: 'Image Gallery Grid',
    description: 'Responsive image grid with configurable columns, figure/figcaption elements.',
    generate: (content) => generateGallerySection(p(content)),
    defaultContent: {
      heading: 'Gallery',
      columns: 3,
      images: [
        { src: 'https://picsum.photos/seed/features-analytics/800/600', caption: 'Dashboard' },
        { src: 'https://picsum.photos/seed/features-collaboration/800/600', caption: 'Collaboration' },
        { src: 'https://picsum.photos/seed/features-data-charts/800/600', caption: 'Analytics' },
      ],
    },
  });

  // ─── Team ─────────────────────────────────────────────────────────────
  registerTemplate<TeamContent>({
    id: 'team_cards_4col',
    category: 'team',
    label: 'Team Cards Grid',
    description: '4-column team member cards with avatars, names, and roles.',
    generate: (content) => generateTeamSection(p(content)),
    defaultContent: {
      heading: 'Our Team',
      subtitle: 'Meet the people behind our success',
      members: [
        { name: 'Sarah Johnson', role: 'CEO & Founder', avatarUrl: 'https://picsum.photos/seed/team-person-1/200/200' },
        { name: 'Mike Chen', role: 'Lead Designer', avatarUrl: 'https://picsum.photos/seed/team-person-2/200/200' },
        { name: 'Emily Davis', role: 'Head of Engineering', avatarUrl: 'https://picsum.photos/seed/team-person-3/200/200' },
        { name: 'James Wilson', role: 'Marketing Director', avatarUrl: 'https://picsum.photos/seed/team-person-4/200/200' },
      ],
    },
  });

  // ─── Stats ────────────────────────────────────────────────────────────
  registerTemplate<StatsContent>({
    id: 'stats_bar',
    category: 'stats',
    label: 'Stats Counter Bar',
    description: 'Horizontal stat counter cards with large values and labels.',
    generate: (content) => generateStatsSection(p(content)),
    defaultContent: {
      heading: 'Our Numbers',
      subtitle: 'Key metrics that demonstrate our impact.',
      stats: [
        { value: '10K+', label: 'Active Users' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '50M+', label: 'Data Points' },
        { value: '24/7', label: 'Support' },
      ],
    },
  });

  // ─── Blog ─────────────────────────────────────────────────────────────
  registerTemplate<BlogContent>({
    id: 'blog_cards_3col',
    category: 'blog',
    label: 'Blog Cards Grid',
    description: '3-column blog post cards with image thumbnails, titles, excerpts, and read more links.',
    generate: (content) => generateBlogSection(p(content)),
    defaultContent: {
      heading: 'Latest Posts',
      subtitle: 'Stay updated with our latest articles',
      posts: [
        { title: 'Getting Started with LoomWeave', excerpt: 'Learn how to create your first website in minutes.', imageUrl: 'https://picsum.photos/seed/blog-writing/800/500' },
        { title: 'Design Tips for Modern Websites', excerpt: 'Best practices for creating beautiful, user-friendly layouts.', imageUrl: 'https://picsum.photos/seed/blog-notebook/800/500' },
        { title: 'The Future of No-Code Platforms', excerpt: 'How no-code tools are changing the way we build.', imageUrl: 'https://picsum.photos/seed/blog-laptop-coffee/800/500' },
      ],
    },
  });

  // ─── Header Nav ───────────────────────────────────────────────────────
  registerTemplate<HeaderContent>({
    id: 'header_glass_sticky',
    category: 'header-nav',
    label: 'Glassmorphism Sticky Navbar',
    description: 'Sticky glass-effect navigation with logo, nav links, and CTA button.',
    generate: (content) => generateHeaderNav(p(content)),
    defaultContent: {
      siteName: 'MyWebsite',
      links: ['Home', 'About', 'Services', 'Contact'],
      ctaText: 'Get Started',
    },
  });

  // ─── Footer ───────────────────────────────────────────────────────────
  registerTemplate<FooterContent>({
    id: 'footer_multi_column',
    category: 'footer',
    label: 'Multi-Column Footer',
    description: 'Dark footer with brand column, link columns, divider, and copyright bar.',
    generate: (content) => generateFooter(p(content)),
    defaultContent: {
      siteName: 'MyWebsite',
      copyright: '© 2026 MyWebsite. All rights reserved.',
      columns: [
        { title: 'Product', links: ['Features', 'Pricing', 'Documentation'] },
        { title: 'Company', links: ['About', 'Blog', 'Careers'] },
        { title: 'Support', links: ['Help Center', 'Contact', 'Terms'] },
      ],
    },
  });

  // ─── Logo Grid ────────────────────────────────────────────────────────
  registerTemplate({
    id: 'logo_grid_gray',
    category: 'logo-grid',
    label: 'Grayscale Logo Grid',
    description: 'Grid of grayscale logo images with hover effect transition.',
    generate: (content) => generateLogoGridSection(p(content)),
    defaultContent: {
      heading: 'Trusted By',
      subtitle: 'Companies that rely on our platform',
      count: 6,
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NEW TEMPLATE VARIANTS
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Hero Variants ────────────────────────────────────────────────────
  registerTemplate<HeroContent>({
    id: 'hero_split_image',
    category: 'hero',
    label: 'Split Image Hero',
    description: 'Left text (60%) + right image (40%) split layout. Professional, clean.',
    generate: (content) => generateHeroSplitImage(p(content)),
    defaultContent: {
      heading: 'Build Your Dream Website',
      subtext: 'Create beautiful, responsive websites in minutes with our intuitive builder.',
      ctaText: 'Get Started',
      ctaHref: '#',
      backgroundUrl: 'https://picsum.photos/seed/hero-office-modern/1200/800',
    },
  });

  registerTemplate<HeroContent>({
    id: 'hero_background_image',
    category: 'hero',
    label: 'Background Image Hero',
    description: 'Full-width background image with dark overlay, centered content.',
    generate: (content) => generateHeroBackgroundImage(p(content)),
    defaultContent: {
      heading: 'Welcome to Our Restaurant',
      subtext: 'Experience culinary excellence in every dish we serve.',
      ctaText: 'View Menu',
      ctaHref: '#',
      backgroundUrl: 'https://picsum.photos/seed/food-meal-table/800/600',
    },
  });

  registerTemplate<HeroContent>({
    id: 'hero_minimal_dark',
    category: 'hero',
    label: 'Minimal Dark Hero',
    description: 'Dark background, minimal text, single CTA button. Bold and dramatic.',
    generate: (content) => generateHeroMinimalDark(p(content)),
    defaultContent: {
      heading: 'Simple. Powerful. Fast.',
      subtext: 'Everything you need, nothing you don\'t.',
      ctaText: 'Start Free',
      ctaHref: '#',
    },
  });

  // ─── Features Variants ────────────────────────────────────────────────
  registerTemplate<FeaturesContent>({
    id: 'features_zigzag',
    category: 'features',
    label: 'Features Zigzag',
    description: 'Alternating left-right image + text blocks. Visual and engaging.',
    generate: (content) => generateFeaturesZigzag(p(content)),
    defaultContent: {
      heading: 'Why Choose Us',
      subtitle: 'Discover what makes us different',
      items: [
        { title: 'Lightning Fast', description: 'Optimized performance that loads in milliseconds.' },
        { title: 'Rock Solid', description: 'Enterprise-grade security and 99.9% uptime.' },
        { title: 'Easy to Use', description: 'Intuitive interface that anyone can master.' },
      ],
    },
  });

  registerTemplate<FeaturesContent>({
    id: 'features_simple_2col',
    category: 'features',
    label: 'Simple 2-Column Features',
    description: 'Clean 2-column grid, text-only cards. Minimal and elegant.',
    generate: (content) => generateFeaturesSimple2Col(p(content)),
    defaultContent: {
      heading: 'Features',
      subtitle: 'Everything you need',
      items: [
        { title: 'Fast', description: 'Blazing fast performance.' },
        { title: 'Secure', description: 'Enterprise-grade security.' },
        { title: 'Scalable', description: 'Grows with your business.' },
        { title: 'Support', description: '24/7 dedicated support.' },
      ],
    },
  });

  // ─── Pricing Variant ──────────────────────────────────────────────────
  registerTemplate<PricingContent>({
    id: 'pricing_minimal',
    category: 'pricing',
    label: 'Minimal 2-Tier Pricing',
    description: 'Simple 2-tier pricing cards. Clean and focused.',
    generate: (content) => generatePricingMinimal(p(content)),
    defaultContent: {
      heading: 'Simple Pricing',
      subtitle: 'No hidden fees. Cancel anytime.',
      tiers: [
        { name: 'Starter', price: '$19', description: 'For individuals', features: ['5 Projects', '1GB Storage', 'Email Support'], highlighted: false },
        { name: 'Professional', price: '$49', description: 'For teams', features: ['Unlimited Projects', '50GB Storage', 'Priority Support', 'Custom Domains'], highlighted: true },
      ],
    },
  });

  // ─── Testimonial Variant ──────────────────────────────────────────────
  registerTemplate<TestimonialContent>({
    id: 'testimonial_single',
    category: 'testimonial',
    label: 'Single Featured Testimonial',
    description: 'One large featured quote with avatar. Centered, impactful.',
    generate: (content) => generateTestimonialSingle(p(content)),
    defaultContent: {
      heading: 'What People Say',
      quotes: [
        { quote: 'This product changed the way our team works. We\'ve seen a 3x improvement in productivity since switching.', author: 'Sarah Johnson', role: 'CTO, TechCorp', avatarUrl: 'https://picsum.photos/seed/testimonial-avatar-1/100/100' },
      ],
    },
  });

  // ─── CTA Variant ──────────────────────────────────────────────────────
  registerTemplate<CTAContent>({
    id: 'cta_centered_simple',
    category: 'cta',
    label: 'Simple Centered CTA',
    description: 'Clean centered CTA with single button on muted background. Minimal.',
    generate: (content) => generateCtaCenteredSimple(p(content)),
    defaultContent: {
      heading: 'Ready to Get Started?',
      subtext: 'Join thousands of happy users today.',
      ctaText: 'Sign Up Free',
      ctaHref: '#',
    },
  });

  // ─── FAQ Variant ──────────────────────────────────────────────────────
  registerTemplate<FAQContent>({
    id: 'faq_two_column',
    category: 'faq',
    label: 'FAQ Two Column',
    description: '2-column grid of FAQ items. Compact, space-efficient.',
    generate: (content) => generateFaqTwoColumn(p(content)),
    defaultContent: {
      heading: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions.',
      items: [
        { question: 'How does it work?', answer: 'Describe what you want and we build it automatically.' },
        { question: 'Is there a free plan?', answer: 'Yes! Free tier includes 3 projects.' },
        { question: 'Can I export?', answer: 'Export as clean HTML/CSS/JS anytime.' },
        { question: 'Custom domains?', answer: 'All paid plans include custom domains with SSL.' },
      ],
    },
  });

  // ─── Contact Variant ──────────────────────────────────────────────────
  registerTemplate<ContactContent>({
    id: 'contact_minimal',
    category: 'contact',
    label: 'Minimal Contact Form',
    description: 'Simple centered form, no card wrapper. Clean and direct.',
    generate: (content) => generateContactMinimal(p(content)),
    defaultContent: {
      heading: 'Contact Us',
      subtitle: 'We\'d love to hear from you.',
      fields: ['Name', 'Email', 'Message'],
      submitText: 'Send Message',
    },
  });

  // ─── Stats Variant ────────────────────────────────────────────────────
  registerTemplate<StatsContent>({
    id: 'stats_grid_2x2',
    category: 'stats',
    label: 'Stats 2x2 Grid',
    description: '2x2 grid of stat cards with gradient values. Compact layout.',
    generate: (content) => generateStatsGrid(p(content)),
    defaultContent: {
      heading: 'By the Numbers',
      subtitle: 'Our impact at a glance',
      stats: [
        { value: '10K+', label: 'Active Users' },
        { value: '98%', label: 'Satisfaction' },
        { value: '50M+', label: 'Data Points' },
        { value: '24/7', label: 'Support' },
      ],
    },
  });

  // ─── Header Variant ───────────────────────────────────────────────────
  registerTemplate<HeaderContent>({
    id: 'header_dark',
    category: 'header-nav',
    label: 'Dark Navbar',
    description: 'Dark background sticky navigation. Modern and bold.',
    generate: (content) => generateHeaderDark(p(content)),
    defaultContent: {
      siteName: 'MyWebsite',
      links: ['Home', 'About', 'Services', 'Contact'],
      ctaText: 'Get Started',
    },
  });

  // ─── Footer Variant ───────────────────────────────────────────────────
  registerTemplate<FooterContent>({
    id: 'footer_minimal',
    category: 'footer',
    label: 'Minimal Footer',
    description: 'Simple centered footer with logo, links, and copyright.',
    generate: (content) => generateFooterMinimal(p(content)),
    defaultContent: {
      siteName: 'MyWebsite',
      copyright: '© 2026 MyWebsite. All rights reserved.',
      columns: [
        { title: 'Product', links: ['Features', 'Pricing'] },
        { title: 'Company', links: ['About', 'Blog'] },
      ],
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TAILWIND (STYLE B) TEMPLATES — className + layout: {}
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Tailwind Hero Variants ────────────────────────────────────────────
  registerTemplate<HeroContent>({
    id: 'hero_tw_dark_bg',
    category: 'hero',
    label: 'Dark BG Hero (TW)',
    description: 'Dark background with image overlay, badge, heading, 2 CTAs, and stats bar. Tailwind classes.',
    generate: (content) => generateHeroTWDarkBg(p(content)),
    defaultContent: {
      heading: 'Design Without Limits',
      subtext: 'Create stunning, responsive websites with our comprehensive collection of professionally designed components.',
      badge: 'New Release',
      ctaText: 'Get Started',
      ctaHref: '#',
      ctaSecondaryText: 'Learn More',
      backgroundUrl: 'https://picsum.photos/seed/hero-tech-dark/1200/800',
    },
  });

  registerTemplate<HeroContent>({
    id: 'hero_tw_light_centered',
    category: 'hero',
    label: 'Light Centered Hero (TW)',
    description: 'Light background, centered heading with badge, 4 feature cards, and CTA. Tailwind classes.',
    generate: (content) => generateHeroTWLightCentered(p(content)),
    defaultContent: {
      heading: 'The Complete UI Toolkit',
      subtext: 'Everything you need to build professional websites. From simple buttons to complex dashboards.',
      badge: 'New',
      ctaText: 'Get Started',
      ctaHref: '#',
    },
  });

  registerTemplate<HeroContent>({
    id: 'hero_tw_split',
    category: 'hero',
    label: 'Split Image Hero (TW)',
    description: 'Left text (heading, features, CTA) + right image split layout. Tailwind classes.',
    generate: (content) => generateHeroTWSplit(p(content)),
    defaultContent: {
      heading: 'Design Without Limits',
      subtext: 'Create stunning, responsive websites with our comprehensive collection.',
      ctaText: 'Get Started',
      ctaHref: '#',
      ctaSecondaryText: 'Learn More',
      backgroundUrl: 'https://picsum.photos/seed/hero-office-modern/1200/800',
    },
  });

  // ─── Tailwind Features Variant ─────────────────────────────────────────
  registerTemplate<FeaturesContent>({
    id: 'features_tw_cards',
    category: 'features',
    label: 'Feature Cards (TW)',
    description: '3-column feature cards with icons, titles, and descriptions. Dark icon boxes. Tailwind classes.',
    generate: (content) => generateFeaturesTWCards(p(content)),
    defaultContent: {
      heading: 'Features',
      subtitle: 'Everything you need to build amazing websites',
      items: [
        { title: 'Fast Performance', description: 'Optimized for speed with lightning-fast load times and smooth interactions.' },
        { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime guarantee.' },
        { title: 'Easy Integration', description: 'Seamlessly connect with your existing tools and workflows.' },
      ],
    },
  });

  // ─── Tailwind Pricing Variant ──────────────────────────────────────────
  registerTemplate<PricingContent>({
    id: 'pricing_tw_2tier',
    category: 'pricing',
    label: 'Pricing Cards (TW)',
    description: '2 or 3-tier pricing cards with highlighted tier, feature checkmarks. Tailwind classes.',
    generate: (content) => generatePricingTW2Tier(p(content)),
    defaultContent: {
      heading: 'Pricing Plans',
      subtitle: 'Choose the plan that fits your needs',
      tiers: [
        { name: 'Starter', price: '$20', period: '/month', features: ['10 users', '2GB storage', 'Email support'], highlighted: false },
        { name: 'Pro', price: '$30', period: '/month', features: ['20 users', '5GB storage', 'Priority support', 'Phone support'], highlighted: true },
        { name: 'Enterprise', price: '$99', period: '/month', features: ['Unlimited users', '100GB storage', '24/7 support', 'Custom integrations'], highlighted: false },
      ],
    },
  });

  // ─── Tailwind Testimonial Variant ──────────────────────────────────────
  registerTemplate<TestimonialContent>({
    id: 'testimonial_tw_stars',
    category: 'testimonial',
    label: 'Star Rating Testimonials (TW)',
    description: 'Testimonial cards with 5-star ratings, quotes, and author info. Tailwind classes.',
    generate: (content) => generateTestimonialTWStars(p(content)),
    defaultContent: {
      heading: 'What Our Customers Say',
      subtitle: 'Trusted by thousands of teams worldwide',
      quotes: [
        { quote: 'This platform transformed our workflow. We shipped twice as fast.', author: 'Sarah Johnson', role: 'CTO, TechCorp' },
        { quote: 'The best builder experience I have ever used. Intuitive and powerful.', author: 'Mike Chen', role: 'Designer, StartupXYZ' },
        { quote: 'Our conversion rates improved by 40% after switching.', author: 'Emily Davis', role: 'Marketing Lead, GrowthCo' },
      ],
    },
  });

  // ─── Tailwind CTA Variant ──────────────────────────────────────────────
  registerTemplate<CTAContent>({
    id: 'cta_tw_split',
    category: 'cta',
    label: 'Split CTA (TW)',
    description: 'Dark background with split layout: heading + subtext on left, CTA buttons on right. Tailwind classes.',
    generate: (content) => generateCtaTWSplit(p(content)),
    defaultContent: {
      heading: 'Ready to Get Started?',
      subtext: 'Join thousands of users who are already building faster.',
      ctaText: 'Sign Up Now',
      ctaHref: '#',
    },
  });
}
