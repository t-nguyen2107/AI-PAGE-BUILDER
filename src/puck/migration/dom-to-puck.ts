/**
 * Data migration: old DOMNode tree → Puck Data format
 *
 * Old format: PageNode → SectionNode → ContainerNode → ComponentNode → ElementNode → ItemNode
 * New format: { root: { props: { title } }, content: ComponentData[] }
 *
 * Each old component type maps to a Puck component name + props extraction.
 */

import type { Data, ComponentData } from "@puckeditor/core";
import type { PageNode, SectionNode, ComponentNode } from "@/types/dom-tree";
import { generateId } from "@/lib/id";

/** Map old NodeType → Puck component name */
const NODE_TYPE_MAP: Record<string, string> = {
  HERO: "HeroSection",
  HERO_SPLIT: "HeroSection",
  HERO_BG: "HeroSection",
  HERO_DARK: "HeroSection",
  FEATURES: "FeaturesGrid",
  FEATURES_ZIGZAG: "FeaturesGrid",
  FEATURES_2COL: "FeaturesGrid",
  PRICING: "PricingTable",
  PRICING_MINIMAL: "PricingTable",
  TESTIMONIAL: "TestimonialSection",
  TESTIMONIAL_SINGLE: "TestimonialSection",
  CTA: "CTASection",
  CTA_SIMPLE: "CTASection",
  FAQ: "FAQSection",
  FAQ_2COL: "FAQSection",
  STATS: "StatsSection",
  STATS_GRID: "StatsSection",
  TEAM: "TeamSection",
  BLOG: "BlogSection",
  LOGO_GRID: "LogoGrid",
  CONTACT: "ContactForm",
  CONTACT_MINIMAL: "ContactForm",
  HEADER: "HeaderNav",
  HEADER_DARK: "HeaderNav",
  FOOTER: "FooterSection",
  FOOTER_MINIMAL: "FooterSection",
  TEXT: "TextBlock",
  IMAGE: "ImageBlock",
  SPACER: "Spacer",
  COLUMNS: "ColumnsLayout",
};

/**
 * Extract Puck component props from an old SectionNode.
 * This is a best-effort mapping — some props may need manual adjustment.
 */
function extractSectionProps(section: SectionNode): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  // Walk the section tree to find text content, images, etc.
  for (const child of section.children ?? []) {
    if (child.type === "container") {
      for (const comp of child.children ?? []) {
        extractFromComponent(comp, props);
      }
    }
  }

  return props;
}

function extractFromComponent(
  comp: ComponentNode,
  props: Record<string, unknown>
): void {
  // Extract text content from component children
  for (const child of comp.children ?? []) {
    if ((child.type as string) === "element" || (child.type as string) === "item") {
      const textContent = extractTextContent(child);
      if (textContent) {
        // Map semantic tags to props
        const tag = child.tag as string;
        if (tag === "h1" || tag === "h2" || tag === "h3") {
          if (!props.heading) props.heading = textContent;
        } else if (tag === "p" || tag === "span") {
          if (!props.subtext) props.subtext = textContent;
        } else if (tag === "a") {
          if (!props.ctaText) props.ctaText = textContent;
          if (child.attributes?.href) props.ctaHref = child.attributes.href;
        } else if (tag === "img") {
          if (child.attributes?.src) props.backgroundUrl = child.attributes.src;
          if (child.attributes?.alt) props.alt = child.attributes.alt;
        }
      }
    }
  }
}

function extractTextContent(node: {
  children?: Array<{ text?: string; children?: unknown[] }>;
}): string {
  if (!node.children) return "";
  return node.children
    .map((child) => {
      if ("text" in child && typeof child.text === "string") return child.text;
      if ("children" in child && Array.isArray(child.children))
        return extractTextContent(child as never);
      return "";
    })
    .join("")
    .trim();
}

/**
 * Convert a PageNode tree (old format) to Puck Data.
 */
export function domToPuck(page: PageNode): Data {
  const content: ComponentData[] = [];

  for (const section of page.children ?? []) {
    if (section.type !== "section") continue;

    // Use meta.sectionName as key, fallback to tag for header/footer
    const sectionKey = section.meta?.sectionName ?? (section.tag === "header" ? "HEADER" : section.tag === "footer" ? "FOOTER" : "");
    const componentName = NODE_TYPE_MAP[sectionKey];
    if (!componentName) {
      console.warn(`Unknown section: ${sectionKey}, skipping`);
      continue;
    }

    const extractedProps = extractSectionProps(section);

    content.push({
      type: componentName,
      props: {
        id: section.id || generateId(),
        ...extractedProps,
      },
    });
  }

  return {
    root: {
      props: {
        title: page.name || "Untitled Page",
      },
    },
    content,
  };
}

/**
 * Convert old treeData (stored as JSON in DB) to Puck Data.
 * Returns null if conversion fails (e.g., already Puck format).
 */
export function convertTreeDataToPuck(
  treeData: unknown
): Data | null {
  if (!treeData || typeof treeData !== "object") return null;

  const tree = treeData as Record<string, unknown>;

  // Already Puck format (has root + content)
  if ("root" in tree && "content" in tree) {
    return tree as unknown as Data;
  }

  // Old format (has type: "page" + children)
  if ("type" in tree && tree.type === "page" && "children" in tree) {
    try {
      return domToPuck(tree as unknown as PageNode);
    } catch (e) {
      console.error("Failed to convert old tree to Puck format:", e);
      return null;
    }
  }

  return null;
}
