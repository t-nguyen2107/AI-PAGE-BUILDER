/**
 * Puck Adapter — converts old DOMNode template output → Puck ComponentData.
 *
 * Templates currently output SectionNode trees (old 6-level DOMNode format).
 * This adapter extracts props and maps them to the corresponding Puck component.
 *
 * When templates are natively updated to output ComponentData, this adapter
 * can be removed.
 */

import type { ComponentData } from '@puckeditor/core';
import type { SectionNode } from '@/types/dom-tree';
import type { ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';

// ─── Category → Puck component type ─────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  hero: 'HeroSection',
  features: 'FeaturesGrid',
  pricing: 'PricingTable',
  testimonial: 'TestimonialSection',
  cta: 'CTASection',
  faq: 'FAQSection',
  stats: 'StatsSection',
  team: 'TeamSection',
  blog: 'BlogSection',
  'logo-grid': 'LogoGrid',
  contact: 'ContactForm',
  'header-nav': 'HeaderNav',
  footer: 'FooterSection',
  gallery: 'TextBlock', // no direct Puck equivalent
  custom: 'TextBlock',
};

// ─── Tree walkers ────────────────────────────────────────────────────────────

/** Walk any node tree depth-first, collecting all nodes matching a predicate. */
function walkNodes(
  node: unknown,
  predicate: (n: Record<string, unknown>) => boolean,
  results: Record<string, unknown>[] = [],
): Record<string, unknown>[] {
  if (!node || typeof node !== 'object') return results;
  const n = node as Record<string, unknown>;
  if (predicate(n)) results.push(n);
  const children = n.children as unknown[];
  if (Array.isArray(children)) {
    for (const child of children) walkNodes(child, predicate, results);
  }
  return results;
}

/** Extract text content from a node tree (depth-first). */
function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (typeof n.content === 'string') return n.content;
  const children = n.children as unknown[];
  if (!Array.isArray(children)) return '';
  return children.map(extractText).join(' ').trim();
}

/** Find first text content by tag name. */
function findTextByTag(section: SectionNode, tag: string): string {
  const nodes = walkNodes(section, (n) => n.tag === tag);
  return nodes.length > 0 ? extractText(nodes[0]) : '';
}

/** Find all text content by tag name. */
function findAllTextByTag(section: SectionNode, tag: string): string[] {
  const nodes = walkNodes(section, (n) => n.tag === tag);
  return nodes.map(extractText);
}

/** Find first attribute value by tag. */
function findAttrByTag(section: SectionNode, tag: string, attr: string): string | undefined {
  const nodes = walkNodes(section, (n) => n.tag === tag);
  if (nodes.length === 0) return undefined;
  const attrs = nodes[0].attributes as Record<string, unknown> | undefined;
  return attrs?.[attr] as string | undefined;
}

/** Find background image URL from section. */
function findBackgroundUrl(section: SectionNode): string | undefined {
  const bg = section.background as Record<string, unknown> | undefined;
  if (bg?.imageUrl) return bg.imageUrl as string;
  // Fallback: find img tag
  const imgNodes = walkNodes(section, (n) => n.tag === 'img');
  if (imgNodes.length > 0) {
    const attrs = imgNodes[0].attributes as Record<string, unknown> | undefined;
    if (attrs?.src) return attrs.src as string;
  }
  return undefined;
}

// ─── Category-specific prop extractors ────────────────────────────────────────

function extractHeroProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h1') || findTextByTag(section, 'h2');
  const subtext = findTextByTag(section, 'p');
  const buttons = walkNodes(section, (n) => n.tag === 'button');
  const ctaText = buttons.length > 0 ? extractText(buttons[0]) : 'Get Started';
  const ctaHref = buttons.length > 0
    ? ((buttons[0].attributes as Record<string, unknown>)?.['data-href'] as string) ?? '#'
    : '#';
  const backgroundUrl = findBackgroundUrl(section);

  return {
    heading: heading || 'Welcome to Our Website',
    subtext: subtext || 'Build something amazing with our platform.',
    ctaText,
    ctaHref,
    align: 'center',
    backgroundUrl,
    backgroundOverlay: !!backgroundUrl,
    padding: '96px',
  };
}

function extractFeaturesProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2') || findTextByTag(section, 'h3');
  const subtext = findTextByTag(section, 'p');
  const cards = walkNodes(section, (n) => n.tag === 'article' || (n.tag === 'div' && typeof n.className === 'string' && n.className.includes('card')));

  const features = cards.length > 0
    ? cards.slice(0, 6).map((card) => {
        const title = extractText(
          walkNodes(card, (n) => n.tag === 'h3' || n.tag === 'h4')[0] ?? {},
        );
        const desc = extractText(
          walkNodes(card, (n) => n.tag === 'p')[0] ?? {},
        );
        return { title: title || 'Feature', description: desc || '', icon: 'zap' };
      })
    : [
        { title: 'Feature 1', description: 'Description for feature 1.', icon: 'zap' },
        { title: 'Feature 2', description: 'Description for feature 2.', icon: 'speed' },
        { title: 'Feature 3', description: 'Description for feature 3.', icon: 'shield' },
      ];

  return {
    heading: heading || 'Our Features',
    subtext: subtext || undefined,
    columns: Math.min(features.length, 4) as 2 | 3 | 4,
    features,
  };
}

function extractPricingProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const subtext = findTextByTag(section, 'p');

  const cards = walkNodes(section, (n) =>
    n.tag === 'div' && typeof n.className === 'string' &&
    (n.className.includes('pricing-card') || n.className.includes('pb-card')),
  );

  const plans = cards.length > 0
    ? cards.slice(0, 4).map((card) => {
        const name = extractText(
          walkNodes(card, (n) => n.tag === 'h3' || n.tag === 'h4')[0] ?? {},
        );
        const price = extractText(
          walkNodes(card, (n) => {
            const cls = n.className as string;
            return typeof cls === 'string' && cls.includes('price');
          })[0] ?? {},
        );
        const highlighted = typeof card.className === 'string' && card.className.includes('highlight');
        const featureItems = walkNodes(card, (n) => n.tag === 'li');
        const features = featureItems.map((li) => ({ value: extractText(li) }));

        return {
          name: name || 'Plan',
          price: price || '$0',
          period: '/month',
          description: '',
          features: features.length > 0 ? features : [{ value: 'Basic feature' }],
          ctaText: 'Get Started',
          ctaHref: '#',
          highlighted,
        };
      })
    : [
        { name: 'Free', price: '$0', period: '/month', description: '', features: [{ value: '1 Project' }], ctaText: 'Start', ctaHref: '#', highlighted: false },
        { name: 'Pro', price: '$29', period: '/month', description: '', features: [{ value: 'Unlimited' }], ctaText: 'Go Pro', ctaHref: '#', highlighted: true },
      ];

  return {
    heading: heading || 'Pricing Plans',
    subtext: subtext || undefined,
    plans,
  };
}

function extractTestimonialProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const quotes = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('testimonial') || n.className.includes('quote')),
  );

  const testimonials = quotes.length > 0
    ? quotes.map((q) => {
        const quote = extractText(walkNodes(q, (n) => n.tag === 'blockquote' || n.tag === 'p')[0] ?? {});
        const author = extractText(walkNodes(q, (n) => typeof n.className === 'string' && n.className.includes('author'))[0] ?? {});
        const role = extractText(walkNodes(q, (n) => typeof n.className === 'string' && n.className.includes('role'))[0] ?? {});
        return { quote: quote || 'Great product!', author: author || 'Anonymous', role: role || '' };
      })
    : [{ quote: 'Great product!', author: 'Anonymous', role: '' }];

  return { heading: heading || 'Testimonials', testimonials };
}

function extractCTAProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2') || findTextByTag(section, 'h1');
  const paragraphs = findAllTextByTag(section, 'p');
  const subtext = paragraphs.length > 0 ? paragraphs[0] : undefined;
  const buttons = walkNodes(section, (n) => n.tag === 'button');
  const ctaText = buttons.length > 0 ? extractText(buttons[0]) : 'Get Started';
  const ctaHref = buttons.length > 0
    ? ((buttons[0].attributes as Record<string, unknown>)?.['data-href'] as string) ?? '#'
    : '#';

  return {
    heading: heading || 'Ready to Get Started?',
    subtext,
    ctaText,
    ctaHref,
  };
}

function extractFAQProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const questions = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('faq') || n.className.includes('accordion')),
  );

  const items = questions.length > 0
    ? questions.map((q) => ({
        question: extractText(walkNodes(q, (n) => n.tag === 'h3' || n.tag === 'h4' || (typeof n.className === 'string' && n.className.includes('question')))[0] ?? {}),
        answer: extractText(walkNodes(q, (n) => n.tag === 'p' || (typeof n.className === 'string' && n.className.includes('answer')))[0] ?? {}),
      }))
    : [{ question: 'Question?', answer: 'Answer.' }];

  return { heading: heading || 'FAQ', items };
}

function extractStatsProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const statNodes = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('stat') || n.className.includes('counter')),
  );

  const stats = statNodes.length > 0
    ? statNodes.slice(0, 4).map((s) => {
        const value = extractText(walkNodes(s, (n) => typeof n.className === 'string' && n.className.includes('value'))[0] ?? {});
        const label = extractText(walkNodes(s, (n) => typeof n.className === 'string' && n.className.includes('label'))[0] ?? {});
        return { value: value || '0', label: label || 'Metric' };
      })
    : [{ value: '100+', label: 'Users' }, { value: '99%', label: 'Uptime' }];

  return {
    heading: heading || 'Stats',
    stats,
    columns: Math.min(stats.length, 4) as 2 | 3 | 4,
  };
}

function extractTeamProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const members = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('team') || n.className.includes('member')),
  );

  const memberList = members.length > 0
    ? members.map((m) => {
        const name = extractText(walkNodes(m, (n) => n.tag === 'h3' || n.tag === 'h4')[0] ?? {});
        const role = extractText(walkNodes(m, (n) => n.tag === 'p')[0] ?? {});
        return { name: name || 'Team Member', role: role || 'Team' };
      })
    : [{ name: 'Team Member', role: 'Role' }];

  return { heading: heading || 'Our Team', members: memberList };
}

function extractBlogProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const posts = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('blog') || n.className.includes('post') || n.className.includes('article')),
  );

  const postList = posts.length > 0
    ? posts.slice(0, 3).map((p) => ({
        title: extractText(walkNodes(p, (n) => n.tag === 'h3' || n.tag === 'h4')[0] ?? {}) || 'Blog Post',
        excerpt: extractText(walkNodes(p, (n) => n.tag === 'p')[0] ?? {}) || '',
        date: '2025-01-01',
        href: '#',
      }))
    : [{ title: 'Blog Post', excerpt: 'Post excerpt.', date: '2025-01-01', href: '#' }];

  return { heading: heading || 'Latest Posts', posts: postList, columns: Math.min(postList.length, 3) as 2 | 3 };
}

function extractLogoGridProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const logos = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('logo') || n.className.includes('brand')),
  );

  const logoList = logos.length > 0
    ? logos.slice(0, 6).map((l) => ({
        name: extractText(l) || 'Brand',
        imageUrl: ((l.attributes as Record<string, unknown>)?.src as string) || '/logos/placeholder.svg',
      }))
    : [{ name: 'Brand', imageUrl: '/logos/placeholder.svg' }];

  return { heading: heading || 'Trusted By', logos: logoList };
}

function extractContactProps(section: SectionNode): Record<string, unknown> {
  const heading = findTextByTag(section, 'h2');
  const subtext = findTextByTag(section, 'p');
  return {
    heading: heading || 'Contact Us',
    subtext: subtext || undefined,
    showPhone: false,
    showCompany: false,
    buttonText: 'Send Message',
  };
}

function extractHeaderProps(section: SectionNode): Record<string, unknown> {
  const logo = extractText(
    walkNodes(section, (n) => typeof n.className === 'string' && n.className.includes('logo'))[0] ?? {},
  );
  const links = walkNodes(section, (n) => n.tag === 'a');
  const linkItems = links.map((l) => ({
    label: extractText(l) || 'Link',
    href: ((l.attributes as Record<string, unknown>)?.href as string) || '#',
  }));
  const buttons = walkNodes(section, (n) => n.tag === 'button');
  const ctaText = buttons.length > 0 ? extractText(buttons[0]) : undefined;
  const ctaHref = buttons.length > 0
    ? ((buttons[0].attributes as Record<string, unknown>)?.['data-href'] as string) ?? '#'
    : undefined;

  return {
    logo: logo || 'YourBrand',
    links: linkItems.length > 0 ? linkItems : [{ label: 'Home', href: '#' }],
    ctaText,
    ctaHref,
    sticky: true,
  };
}

function extractFooterProps(section: SectionNode): Record<string, unknown> {
  const logo = extractText(
    walkNodes(section, (n) => typeof n.className === 'string' && n.className.includes('logo'))[0] ?? {},
  );
  const description = findTextByTag(section, 'p');

  // Extract link groups from column-like containers
  const columns = walkNodes(section, (n) =>
    typeof n.className === 'string' && (n.className.includes('column') || n.className.includes('group')),
  );

  const linkGroups = columns.length > 0
    ? columns.slice(0, 4).map((col) => {
        const title = extractText(
          walkNodes(col, (n) => n.tag === 'h4' || n.tag === 'h3')[0] ?? {},
        );
        const links = walkNodes(col, (n) => n.tag === 'a');
        return {
          title: title || 'Links',
          links: links.map((l) => ({
            label: extractText(l) || 'Link',
            href: ((l.attributes as Record<string, unknown>)?.href as string) || '#',
          })),
        };
      })
    : [{ title: 'Links', links: [{ label: 'Home', href: '#' }] }];

  return {
    logo: logo || 'YourBrand',
    description: description || undefined,
    linkGroups,
    copyright: `\u00a9 ${new Date().getFullYear()} YourBrand. All rights reserved.`,
  };
}

// ─── Category detection ──────────────────────────────────────────────────────

function detectCategory(section: SectionNode): string {
  // Check meta.sectionName first
  const meta = section.meta as unknown as Record<string, unknown> | undefined;
  const sectionName = meta?.sectionName as string | undefined;

  if (sectionName) {
    const lower = sectionName.toLowerCase();
    for (const key of Object.keys(CATEGORY_MAP)) {
      if (lower.includes(key)) return key;
    }
  }

  // Check className
  const cls = (section.className ?? '') as string;
  const classMap: Record<string, string> = {
    hero: 'hero',
    feature: 'features',
    pricing: 'pricing',
    testimonial: 'testimonial',
    cta: 'cta',
    faq: 'faq',
    stat: 'stats',
    team: 'team',
    blog: 'blog',
    logo: 'logo-grid',
    contact: 'contact',
    nav: 'header-nav',
    footer: 'footer',
    gallery: 'gallery',
  };
  for (const [pattern, category] of Object.entries(classMap)) {
    if (cls.toLowerCase().includes(pattern)) return category;
  }

  // Check tag
  if (section.tag === 'header' || section.tag === 'nav') return 'header-nav';
  if (section.tag === 'footer') return 'footer';

  return 'custom';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Extract props from a section based on category. */
const PROP_EXTRACTORS: Record<string, (section: SectionNode) => Record<string, unknown>> = {
  hero: extractHeroProps,
  features: extractFeaturesProps,
  pricing: extractPricingProps,
  testimonial: extractTestimonialProps,
  cta: extractCTAProps,
  faq: extractFAQProps,
  stats: extractStatsProps,
  team: extractTeamProps,
  blog: extractBlogProps,
  'logo-grid': extractLogoGridProps,
  contact: extractContactProps,
  'header-nav': extractHeaderProps,
  footer: extractFooterProps,
};

/**
 * Convert a single old SectionNode → Puck ComponentData.
 */
export function sectionToPuckComponent(section: SectionNode): ComponentData {
  const category = detectCategory(section);
  const puckType = CATEGORY_MAP[category] ?? 'TextBlock';
  const extractor = PROP_EXTRACTORS[category];
  const props = extractor ? extractor(section) : {};

  return {
    type: puckType,
    props: {
      id: section.id || generateId(),
      ...props,
    },
  };
}

/**
 * Convert an array of old SectionNode → Puck ComponentData[].
 */
export function sectionsToPuckComponents(sections: SectionNode[]): ComponentData[] {
  return sections.map(sectionToPuckComponent);
}

/**
 * Convert old AIGenerationResponse.nodes (old DOMNode[]) → ComponentData[].
 * Handles both SectionNode arrays and PageNode-wrapped trees.
 */
export function convertAIResponseNodes(nodes: unknown[]): ComponentData[] {
  const components: ComponentData[] = [];

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const n = node as Record<string, unknown>;

    // PageNode wrapper — extract children
    if (n.type === 'page' && Array.isArray(n.children)) {
      for (const child of n.children as unknown[]) {
        if (child && typeof child === 'object') {
          const c = child as Record<string, unknown>;
          if (c.type === 'section') {
            components.push(sectionToPuckComponent(child as unknown as SectionNode));
          }
        }
      }
    }
    // SectionNode directly
    else if (n.type === 'section' || n.tag === 'header' || n.tag === 'footer' || n.tag === 'nav') {
      components.push(sectionToPuckComponent(node as unknown as SectionNode));
    }
    // Fallback: wrap as TextBlock
    else {
      components.push({
        type: 'TextBlock',
        props: {
          id: (n.id as string) || generateId(),
          content: `<p>${extractText(node)}</p>`,
          align: 'left',
          maxWidth: 'lg',
        },
      });
    }
  }

  return components;
}

// ─── Section ordering ────────────────────────────────────────────────────────

const SECTION_ORDER: Record<string, number> = {
  HeaderNav: 0,
  HeroSection: 1,
  FeaturesGrid: 2,
  StatsSection: 3,
  LogoGrid: 4,
  TestimonialSection: 5,
  PricingTable: 6,
  FAQSection: 7,
  BlogSection: 8,
  CTASection: 9,
  ContactForm: 10,
  FooterSection: 11,
};

/**
 * Order Puck components by section priority (header → hero → ... → footer).
 */
export function orderPuckComponents(components: ComponentData[]): ComponentData[] {
  return [...components].sort((a, b) => {
    const orderA = SECTION_ORDER[a.type] ?? 99;
    const orderB = SECTION_ORDER[b.type] ?? 99;
    return orderA - orderB;
  });
}
