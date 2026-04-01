import { NodeType, SemanticTag } from '@/types/enums';
import type { PageNode, DOMNode, ElementNode } from '@/types/dom-tree';
import type { SEOMeta } from '@/types/seo';

/**
 * Extracts the first h1 text content found in the tree.
 */
function extractFirstH1(node: DOMNode): string {
  if (
    node.type === NodeType.ELEMENT &&
    node.tag === SemanticTag.H1
  ) {
    const elem = node as ElementNode;
    return elem.content?.trim() ?? '';
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      const result = extractFirstH1(child);
      if (result) return result;
    }
  }
  return '';
}

/**
 * Extracts the first paragraph text content found in the tree.
 */
function extractFirstParagraph(node: DOMNode): string {
  if (
    node.type === NodeType.ELEMENT &&
    node.tag === SemanticTag.P
  ) {
    const elem = node as ElementNode;
    return elem.content?.trim() ?? '';
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      const result = extractFirstParagraph(child);
      if (result) return result;
    }
  }
  return '';
}

/**
 * Extracts the first image src found in the tree.
 */
function extractFirstImage(node: DOMNode): string {
  if (
    node.type === NodeType.ELEMENT &&
    node.tag === SemanticTag.IMG
  ) {
    const elem = node as ElementNode;
    return elem.src ?? '';
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      const result = extractFirstImage(child);
      if (result) return result;
    }
  }
  return '';
}

/**
 * Generates SEO meta tags from a PageNode tree.
 *
 * Priority for title:
 *   1. Page meta.title
 *   2. First h1 text content
 *
 * Priority for description:
 *   1. Page meta.description
 *   2. First paragraph text content (truncated to 160 chars)
 *
 * Open Graph fields mirror title/description if not explicitly set.
 * ogImage uses the first image found in the tree.
 * canonical is built from baseUrl + page slug when baseUrl is provided.
 */
export function generateMetaFromPage(page: PageNode, baseUrl?: string): SEOMeta {
  const h1Text = extractFirstH1(page);
  const firstParagraph = extractFirstParagraph(page);
  const firstImage = extractFirstImage(page);

  const title = page.meta.title || h1Text || 'Untitled Page';

  let description = page.meta.description || firstParagraph || '';
  if (description.length > 160) {
    description = description.slice(0, 157) + '...';
  }

  const keywords = page.meta.seoKeywords;

  const ogTitle = title;
  const ogDescription = description;
  const ogImage = firstImage || undefined;

  let canonical: string | undefined;
  if (baseUrl) {
    const slug = page.meta.slug.startsWith('/') ? page.meta.slug : `/${page.meta.slug}`;
    canonical = `${baseUrl.replace(/\/+$/, '')}${slug}`;
  }

  const meta: SEOMeta = {
    title,
    description,
  };

  if (keywords && keywords.length > 0) {
    meta.keywords = keywords;
  }

  meta.ogTitle = ogTitle;
  meta.ogDescription = ogDescription;

  if (ogImage) {
    meta.ogImage = ogImage;
  }

  if (canonical) {
    meta.canonical = canonical;
  }

  return meta;
}
