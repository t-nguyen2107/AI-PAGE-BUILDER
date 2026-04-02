import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a clean centered CTA section with a single button on a muted background.
 * Minimal design — no badge, no gradient, no secondary button.
 *
 * Props:
 *   heading?: string   - CTA heading (default: "Ready to Get Started?")
 *   subtext?: string   - Subtext paragraph
 *   ctaText?: string   - Button label (default: "Get Started")
 *   ctaHref?: string   - Button link (default: "#")
 */
export function generateCtaCenteredSimple(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Ready to Get Started?';
  const subtext = (props?.subtext as string) ?? 'Join thousands of users who are already building faster. Start your free trial today.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Heading element
  const headingElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.H2,
    content: heading,
    typography: {
      fontSize: '2rem',
      fontWeight: '700',
      color: 'var(--foreground)',
      textAlign: TextAlign.CENTER,
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Subtext element
  const subtextElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: subtext,
    typography: {
      fontSize: '1.05rem',
      lineHeight: '1.7',
      color: 'var(--muted-foreground)',
      textAlign: TextAlign.CENTER,
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Single CTA button
  const buttonElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.BUTTON,
    className: 'pb-btn pb-btn-primary',
    content: ctaText,
    attributes: { 'data-href': ctaHref },
    inlineStyles: {
      padding: '0.875rem 2.5rem',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Content component wrapping heading + subtext + button
  const contentComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1.25rem',
    },
    children: [headingElement, subtextElement, buttonElement],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'pb-section-muted',
    meta: { createdAt: now, updatedAt: now, sectionName: 'CTA Centered Simple', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        meta: { createdAt: now, updatedAt: now },
        children: [contentComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
    },
  };
}
