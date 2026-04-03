/**
 * Meta Generator — generates SEO meta tags from Puck page data.
 *
 * Extracts title, description, and Open Graph data from Puck component props.
 */

import type { Data, ComponentData } from '@puckeditor/core';
import type { SEOMeta } from '@/types/seo';

// ─── Helpers ─────────────────────────────────────────────────────────

function getProps(component: ComponentData): Record<string, unknown> {
  return (component.props ?? {}) as Record<string, unknown>;
}

/** Extract the first heading-like text from any component. */
function extractFirstText(data: Data, propNames: string[]): string {
  for (const component of data.content) {
    const props = getProps(component);
    for (const prop of propNames) {
      if (typeof props[prop] === 'string') {
        const text = (props[prop] as string).trim();
        if (text) return text;
      }
    }
  }
  return '';
}

/** Extract the first image URL from component props. */
function extractFirstImageUrl(data: Data): string {
  const imageProps = ['backgroundUrl', 'imageUrl', 'src'];
  for (const component of data.content) {
    const props = getProps(component);
    for (const prop of imageProps) {
      if (typeof props[prop] === 'string') return props[prop] as string;
    }
    // Check nested arrays (e.g., posts[].imageUrl, images[].src)
    const arrayKeys = ['posts', 'images', 'products', 'logos', 'testimonials', 'members'];
    for (const key of arrayKeys) {
      const arr = props[key];
      if (!Array.isArray(arr)) continue;
      for (const item of arr as Record<string, unknown>[]) {
        if (typeof item.imageUrl === 'string') return item.imageUrl;
        if (typeof item.src === 'string') return item.src;
        if (typeof item.avatarUrl === 'string') return item.avatarUrl;
      }
    }
  }
  return '';
}

/** Extract first paragraph-like text from subtext/description props. */
function extractFirstParagraph(data: Data): string {
  const paragraphProps = ['subtext', 'description', 'message', 'excerpt'];
  for (const component of data.content) {
    const props = getProps(component);
    for (const prop of paragraphProps) {
      if (typeof props[prop] === 'string') {
        const text = (props[prop] as string).trim();
        if (text) return text;
      }
    }
    // Check nested posts[].excerpt
    if (Array.isArray(props.posts)) {
      for (const post of props.posts as Record<string, unknown>[]) {
        if (typeof post.excerpt === 'string') {
          const text = (post.excerpt as string).trim();
          if (text) return text;
        }
      }
    }
  }
  return '';
}

// ─── Public API ─────────────────────────────────────────────────────

interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  slug?: string;
}

/**
 * Generates SEO meta tags from Puck Data and optional page metadata.
 *
 * Priority for title:
 *   1. pageMeta.title (from DB seoTitle or title)
 *   2. First hero/banner heading
 *   3. root.props.title
 *
 * Priority for description:
 *   1. pageMeta.description (from DB seoDescription)
 *   2. First subtext/description from components
 *   3. First paragraph-like text
 */
export function generateMetaFromPage(data: Data, baseUrl?: string, pageMeta?: PageMeta): SEOMeta {
  // Title
  const heroHeading = extractFirstText(data, ['heading', 'title']);
  const rootTitle = data.root?.props?.title as string | undefined;
  const title = pageMeta?.title || heroHeading || rootTitle || 'Untitled Page';

  // Description
  const firstParagraph = extractFirstParagraph(data);
  let description = pageMeta?.description || firstParagraph || '';
  if (description.length > 160) {
    description = description.slice(0, 157) + '...';
  }

  // Keywords
  const keywords = pageMeta?.keywords;

  // Open Graph
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = extractFirstImageUrl(data) || undefined;

  // Canonical
  let canonical: string | undefined;
  if (baseUrl && pageMeta?.slug) {
    const slug = pageMeta.slug.startsWith('/') ? pageMeta.slug : `/${pageMeta.slug}`;
    canonical = `${baseUrl.replace(/\/+$/, '')}${slug}`;
  }

  const meta: SEOMeta = { title, description };

  if (keywords && keywords.length > 0) meta.keywords = keywords;
  meta.ogTitle = ogTitle;
  meta.ogDescription = ogDescription;
  if (ogImage) meta.ogImage = ogImage;
  if (canonical) meta.canonical = canonical;

  return meta;
}
