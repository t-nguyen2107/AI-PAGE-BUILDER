import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Call-to-Action section with heading and button.
 *
 * Props:
 *   heading?: string   - CTA heading (default: "Ready to Get Started?")
 *   subtext?: string   - Optional subtext paragraph
 *   ctaText?: string   - Button label (default: "Sign Up Now")
 *   ctaHref?: string   - Button link (default: "#")
 */
export function generateCtaSection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Ready to Get Started?';
  const subtext = props?.subtext as string | undefined;
  const ctaText = (props?.ctaText as string) ?? 'Sign Up Now';
  const ctaHref = (props?.ctaHref as string) ?? '#';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Build element children inside a wrapping component
  const componentId = generateId();
  const headingId = generateId();
  const buttonId = generateId();

  const componentChildren: ElementNode[] = [
    {
      id: headingId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H2,
      className: 'cta-heading',
      content: heading,
      typography: { fontSize: '2.25rem', fontWeight: '700', color: '#ffffff' },
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  if (subtext) {
    const subtextId = generateId();
    componentChildren.push({
      id: subtextId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'cta-subtext',
      content: subtext,
      typography: { fontSize: '1.125rem', color: '#e2e8f0' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  componentChildren.push({
    id: buttonId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.BUTTON,
    className: 'cta-button',
    content: ctaText,
    attributes: { 'data-href': ctaHref },
    inlineStyles: {
      padding: '1rem 2.5rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: '#ffffff',
      color: '#3b82f6',
    },
    meta: { createdAt: now, updatedAt: now },
  });

  const ctaComponent: ComponentNode = {
    id: componentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'cta-content',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1.5rem',
    },
    children: componentChildren,
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'cta-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'CTA Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'cta-container',
        meta: { createdAt: now, updatedAt: now },
        children: [ctaComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          maxWidth: '700px',
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
    background: { color: '#3b82f6' },
  };
}
