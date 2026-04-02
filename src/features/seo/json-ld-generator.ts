import { ComponentCategory, NodeType, SemanticTag } from '@/types/enums';
import type {
  PageNode,
  DOMNode,
  ComponentNode,
  ElementNode,
  ItemNode,
  SectionNode,
  ContainerNode,
} from '@/types/dom-tree';

// ---- Public result type ----

export interface JsonLdResult {
  type: string;
  data: Record<string, unknown>;
}

// ---- Internal helpers ----

/** Heading tags in descending order of importance. */
const HEADING_TAGS = new Set<string>([
  SemanticTag.H1,
  SemanticTag.H2,
  SemanticTag.H3,
  SemanticTag.H4,
  SemanticTag.H5,
  SemanticTag.H6,
]);

/** Extract the first non-empty text content from descendant elements matching a predicate. */
function extractText(
  node: DOMNode,
  tagFilter?: Set<string>,
): string | undefined {
  if (node.type === NodeType.ELEMENT || node.type === NodeType.ITEM) {
    const elem = node as ElementNode | ItemNode;
    if (!tagFilter || tagFilter.has(elem.tag)) {
      const text = elem.content?.trim();
      if (text) return text;
    }
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      const result = extractText(child, tagFilter);
      if (result) return result;
    }
  }

  return undefined;
}

/** Extract all non-empty text content from descendant elements matching a predicate. */
function extractAllTexts(
  node: DOMNode,
  tagFilter?: Set<string>,
): string[] {
  const results: string[] = [];

  if (node.type === NodeType.ELEMENT || node.type === NodeType.ITEM) {
    const elem = node as ElementNode | ItemNode;
    if (!tagFilter || tagFilter.has(elem.tag)) {
      const text = elem.content?.trim();
      if (text) results.push(text);
    }
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      results.push(...extractAllTexts(child, tagFilter));
    }
  }

  return results;
}

/** Extract the first image `src` from descendant img elements. */
function extractImage(node: DOMNode): string | undefined {
  if (node.type === NodeType.ELEMENT && node.tag === SemanticTag.IMG) {
    const elem = node as ElementNode;
    return elem.src?.trim() || undefined;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      const result = extractImage(child);
      if (result) return result;
    }
  }

  return undefined;
}

/** Extract all image `src` URLs from descendant img elements. */
function extractAllImages(node: DOMNode): string[] {
  const results: string[] = [];

  if (node.type === NodeType.ELEMENT && node.tag === SemanticTag.IMG) {
    const elem = node as ElementNode;
    const src = elem.src?.trim();
    if (src) results.push(src);
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      results.push(...extractAllImages(child));
    }
  }

  return results;
}

/** Extract the first heading text (h1-h6) from a node tree. */
function extractHeading(node: DOMNode): string | undefined {
  return extractText(node, HEADING_TAGS);
}

// ---- Category-specific Schema.org builders ----

function buildHeroLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const description = extractText(component, new Set([SemanticTag.P]));
  const image = extractImage(component);

  const data: Record<string, unknown> = {
    '@type': 'WebPage',
  };
  if (name) data.name = name;
  if (description) data.description = description;
  if (image) data.image = { '@type': 'ImageObject', url: image };

  return { type: 'WebPage', data };
}

function buildPricingLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const paragraphs = extractAllTexts(component, new Set([SemanticTag.P]));

  // Build Offer entries from paragraph text blocks (heuristic).
  const offers = paragraphs
    .filter((p) => p.length > 0)
    .slice(0, 20) // reasonable upper bound
    .map((p) => ({
      '@type': 'Offer',
      name: p,
    }));

  const data: Record<string, unknown> = {
    '@type': 'OfferCatalog',
  };
  if (name) data.name = name;
  if (offers.length > 0) data.offers = offers;

  return { type: 'OfferCatalog', data };
}

function buildFeaturesLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const items = extractAllTexts(component).slice(0, 50);

  const listItems = items.map((text, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: text,
  }));

  const data: Record<string, unknown> = {
    '@type': 'ItemList',
  };
  if (name) data.name = name;
  if (listItems.length > 0) data.itemListElement = listItems;

  return { type: 'ItemList', data };
}

function buildTestimonialLd(component: ComponentNode): JsonLdResult {
  const texts = extractAllTexts(component, new Set([SemanticTag.P]));

  const reviews = texts.map((t) => ({
    '@type': 'Review',
    reviewBody: t,
  }));

  const data: Record<string, unknown> = {
    '@type': 'AggregateRating',
  };
  if (reviews.length > 0) {
    data.reviewCount = reviews.length;
    data.reviews = reviews;
  }

  return { type: 'AggregateRating', data };
}

function buildCtaLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const description = extractText(component, new Set([SemanticTag.P]));

  const data: Record<string, unknown> = {
    '@type': 'WebPage',
  };
  if (name) data.name = name;
  if (description) data.description = description;

  return { type: 'WebPage', data };
}

function buildFaqLd(component: ComponentNode): JsonLdResult {
  // Heuristic: pair heading texts with paragraph texts as question/answer.
  const headings = extractAllTexts(component, HEADING_TAGS);
  const paragraphs = extractAllTexts(component, new Set([SemanticTag.P]));

  const questions: Record<string, unknown>[] = [];

  // Pair headings with paragraphs by index.
  const count = Math.min(headings.length, paragraphs.length);
  for (let i = 0; i < count; i++) {
    questions.push({
      '@type': 'Question',
      name: headings[i],
      acceptedAnswer: {
        '@type': 'Answer',
        text: paragraphs[i],
      },
    });
  }

  // If there are leftover headings without paragraphs, add them without answers.
  for (let i = count; i < headings.length; i++) {
    questions.push({
      '@type': 'Question',
      name: headings[i],
    });
  }

  const data: Record<string, unknown> = {
    '@type': 'FAQPage',
  };
  if (questions.length > 0) data.mainEntity = questions;

  return { type: 'FAQPage', data };
}

function buildGalleryLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const imageUrls = extractAllImages(component);

  const images = imageUrls.map((url) => ({
    '@type': 'ImageObject',
    url,
  }));

  const data: Record<string, unknown> = {
    '@type': 'ImageGallery',
  };
  if (name) data.name = name;
  if (images.length > 0) data.image = images;

  return { type: 'ImageGallery', data };
}

function buildContactLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const description = extractText(component, new Set([SemanticTag.P]));

  const data: Record<string, unknown> = {
    '@type': 'ContactPage',
  };
  if (name) data.name = name;
  if (description) data.description = description;

  return { type: 'ContactPage', data };
}

function buildHeaderNavLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);

  const data: Record<string, unknown> = {
    '@type': 'WPHeader',
  };
  if (name) data.name = name;

  return { type: 'WPHeader', data };
}

function buildFooterLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);

  const data: Record<string, unknown> = {
    '@type': 'WPFooter',
  };
  if (name) data.name = name;

  return { type: 'WPFooter', data };
}

function buildStatsLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const description = extractText(component, new Set([SemanticTag.P]));

  const data: Record<string, unknown> = {
    '@type': 'Dataset',
  };
  if (name) data.name = name;
  if (description) data.description = description;

  return { type: 'Dataset', data };
}

function buildTeamLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const image = extractImage(component);

  // Heuristic: heading = person name, first paragraph = job title.
  const paragraphs = extractAllTexts(component, new Set([SemanticTag.P]));

  const data: Record<string, unknown> = {
    '@type': 'Person',
  };
  if (name) data.name = name;
  if (paragraphs.length > 0) data.jobTitle = paragraphs[0];
  if (image) data.image = image;

  return { type: 'Person', data };
}

function buildLogoGridLd(component: ComponentNode): JsonLdResult {
  const name = extractHeading(component);
  const images = extractAllImages(component);

  const data: Record<string, unknown> = {
    '@type': 'Organization',
  };
  if (name) data.name = name;
  if (images.length > 0) data.logo = images[0];

  return { type: 'Organization', data };
}

function buildBlogLd(component: ComponentNode): JsonLdResult {
  const headline = extractHeading(component);
  const description = extractText(component, new Set([SemanticTag.P]));
  const image = extractImage(component);

  const data: Record<string, unknown> = {
    '@type': 'BlogPosting',
  };
  if (headline) data.headline = headline;
  if (description) data.description = description;
  if (image) data.image = { '@type': 'ImageObject', url: image };

  return { type: 'BlogPosting', data };
}

// ---- Category dispatch map ----

type CategoryBuilder = (component: ComponentNode) => JsonLdResult;

const CATEGORY_BUILDERS: Partial<Record<ComponentCategory, CategoryBuilder>> = {
  [ComponentCategory.HERO]: buildHeroLd,
  [ComponentCategory.PRICING]: buildPricingLd,
  [ComponentCategory.FEATURES]: buildFeaturesLd,
  [ComponentCategory.TESTIMONIAL]: buildTestimonialLd,
  [ComponentCategory.CTA]: buildCtaLd,
  [ComponentCategory.FAQ]: buildFaqLd,
  [ComponentCategory.GALLERY]: buildGalleryLd,
  [ComponentCategory.CONTACT]: buildContactLd,
  [ComponentCategory.HEADER_NAV]: buildHeaderNavLd,
  [ComponentCategory.FOOTER]: buildFooterLd,
  [ComponentCategory.STATS]: buildStatsLd,
  [ComponentCategory.TEAM]: buildTeamLd,
  [ComponentCategory.LOGO_GRID]: buildLogoGridLd,
  [ComponentCategory.BLOG]: buildBlogLd,
};

// ---- Tree traversal ----

/** Recursively collect all ComponentNodes that have a category. */
function collectCategorizedComponents(node: DOMNode): ComponentNode[] {
  const results: ComponentNode[] = [];

  if (
    node.type === NodeType.COMPONENT &&
    (node as ComponentNode).category
  ) {
    results.push(node as ComponentNode);
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      results.push(...collectCategorizedComponents(child));
    }
  }

  return results;
}

// ---- Public API ----

/**
 * Generate Schema.org JSON-LD structured data from a page tree.
 *
 * Walks the tree, finds every `ComponentNode` that has a `category`,
 * and builds the corresponding Schema.org JSON-LD object with data
 * extracted from child elements (headings, paragraphs, images, etc.).
 *
 * Sections without a category or with `CUSTOM` category are skipped.
 * Missing data is handled gracefully — properties are omitted when
 * no matching content is found.
 *
 * @param tree - The root `PageNode` of the page.
 * @returns An array of `JsonLdResult` objects, one per recognizable section.
 */
export function generateJsonLd(tree: PageNode): JsonLdResult[] {
  const components = collectCategorizedComponents(tree);

  const results: JsonLdResult[] = [];

  for (const component of components) {
    const category = component.category!;
    const builder = CATEGORY_BUILDERS[category];

    if (builder) {
      results.push(builder(component));
    }
    // CUSTOM and unmapped categories are intentionally skipped.
  }

  return results;
}
