import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Call-to-Action section with heading, subtext, and button.
 * Uses shadcn CSS variables for theming and pb-section-gradient + pb-btn helpers.
 *
 * Props:
 *   heading?: string   - CTA heading (default: "Ready to Get Started?")
 *   subtext?: string   - Optional subtext paragraph
 *   ctaText?: string   - Button label (default: "Sign Up Now")
 *   ctaHref?: string   - Button link (default: "#")
 */
export function generateCtaSection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Ready to Get Started?';
  const subtext = (props?.subtext as string) ?? 'Join thousands of users who are already building faster. Start your free trial today.';
  const ctaText = (props?.ctaText as string) ?? 'Sign Up Now';
  const ctaHref = (props?.ctaHref as string) ?? '#';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Decorative badge
  const badgeComponentId = generateId();
  const badgeId = generateId();

  const badgeComponent: ComponentNode = {
    id: badgeComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'cta-badge-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      justifyContent: 'center',
    },
    children: [
      {
        id: badgeId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-badge',
        content: 'Limited Time Offer',
        typography: { fontSize: '0.8125rem', fontWeight: '600', letterSpacing: '0.03em', textTransform: 'uppercase' as const },
        inlineStyles: {
          background: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
          padding: '0.375rem 1rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.2)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // Main content component: heading + subtext + button
  const componentId = generateId();
  const headingId = generateId();
  const subtextId = generateId();
  const buttonId = generateId();
  const secondaryBtnId = generateId();

  const componentChildren: ElementNode[] = [
    {
      id: headingId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H2,
      className: 'pb-section-title',
      content: heading,
      typography: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#ffffff',
        textAlign: TextAlign.CENTER,
        lineHeight: '1.15',
        letterSpacing: '-0.02em',
      },
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  componentChildren.push({
    id: subtextId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'pb-section-subtitle',
    content: subtext,
    typography: {
      fontSize: '1.1875rem',
      lineHeight: '1.7',
      color: 'rgba(255,255,255,0.85)',
      textAlign: TextAlign.CENTER,
    },
    meta: { createdAt: now, updatedAt: now },
  });

  // Buttons wrapped in their own component for row layout
  const buttonRowId = generateId();
  const buttonRowComponent: ComponentNode = {
    id: buttonRowId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'cta-buttons',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.ROW,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
    },
    children: [
      {
        id: buttonId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-white',
        content: ctaText,
        attributes: { 'data-href': ctaHref },
        typography: { fontWeight: '600', fontSize: '1rem' },
        inlineStyles: {
          padding: '0.875rem 2.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: secondaryBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-outline',
        content: 'Contact Sales',
        attributes: { 'data-href': '/contact' },
        typography: { fontWeight: '600', fontSize: '1rem', color: '#ffffff' },
        inlineStyles: {
          padding: '0.875rem 2.5rem',
          borderRadius: '0.75rem',
          border: '2px solid rgba(255,255,255,0.35)',
          background: 'transparent',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

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
      gap: '1.25rem',
    },
    children: componentChildren,
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'pb-section-gradient',
    meta: { createdAt: now, updatedAt: now, sectionName: 'CTA Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'cta-container',
        meta: { createdAt: now, updatedAt: now },
        children: [badgeComponent, ctaComponent, buttonRowComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          maxWidth: '700px',
          margin: '0 auto',
          gap: '1rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
    },
  };
}
