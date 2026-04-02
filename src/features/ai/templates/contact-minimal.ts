import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a minimal contact form — simple centered form, no card wrapper.
 *
 * Props:
 *   heading?: string    - Form heading (default: "Contact Us")
 *   subtitle?: string   - Subtext below heading
 *   fields?: string[]   - Field labels to include (default: ["Name", "Email", "Message"])
 *   submitText?: string - Submit button text (default: "Send Message")
 */
export function generateContactMinimal(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Contact Us';
  const subtitle = (props?.subtitle as string) ?? "We'd love to hear from you. Fill out the form below and we'll get back to you shortly.";
  const fields = (props?.fields as string[]) ?? ['Name', 'Email', 'Message'];
  const submitText = (props?.submitText as string) ?? 'Send Message';

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
      textAlign: TextAlign.CENTER,
      color: 'var(--foreground)',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Subtitle element
  const subtitleElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: subtitle,
    typography: {
      fontSize: '1.05rem',
      color: 'var(--muted-foreground)',
      textAlign: TextAlign.CENTER,
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Header component wrapping heading + subtitle
  const headerComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '0.5rem',
    },
    children: [headingElement, subtitleElement],
  };

  // Build form field components — each field is a label P + input P
  const fieldComponents: ComponentNode[] = fields.map((fieldLabel) => {
    const labelElement: ElementNode = {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      content: fieldLabel,
      typography: { fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    const inputElement: ElementNode = {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'pb-input',
      content: '',
      attributes: {
        'data-field-type': fieldLabel.toLowerCase() === 'message' ? 'textarea' : 'input',
        'data-label': fieldLabel,
        placeholder: `Enter your ${fieldLabel.toLowerCase()}`,
      },
      meta: { createdAt: now, updatedAt: now },
    };

    return {
      id: generateId(),
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      meta: { createdAt: now, updatedAt: now },
      layout: {
        display: DisplayType.FLEX,
        flexDirection: FlexDirection.COLUMN,
        gap: '0.375rem',
      },
      children: [labelElement, inputElement],
    };
  });

  // Submit button
  const submitButtonElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.BUTTON,
    className: 'pb-btn pb-btn-primary',
    content: submitText,
    attributes: { type: 'submit' },
    inlineStyles: {
      padding: '0.875rem 2rem',
      width: '100%',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Form element wrapping all fields + button (no card wrapper)
  const formElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.FORM,
    meta: { createdAt: now, updatedAt: now },
    attributes: { 'data-form': 'contact' },
    children: [...fieldComponents.map((fc) => fc as unknown as ElementNode), submitButtonElement],
  };

  // Form component to satisfy tree hierarchy (form element needs to be inside a component)
  const formComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
    },
    children: [formElement],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    meta: { createdAt: now, updatedAt: now, sectionName: 'Contact Minimal', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        meta: { createdAt: now, updatedAt: now },
        children: [headerComponent, formComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '500px',
          margin: '0 auto',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 2rem',
    },
    background: { color: 'var(--background)' },
  };
}
