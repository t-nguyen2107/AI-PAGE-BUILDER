import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Contact Form section with standard fields.
 *
 * Props:
 *   heading?: string    - Form heading (default: "Get in Touch")
 *   subtext?: string    - Subtext below heading
 *   fields?: string[]   - Field labels to include (default: ["Name", "Email", "Message"])
 *   submitText?: string - Submit button text (default: "Send Message")
 */
export function generateContactForm(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Get in Touch';
  const subtext = props?.subtext as string | undefined;
  const fields = (props?.fields as string[]) ?? ['Name', 'Email', 'Message'];
  const submitText = (props?.submitText as string) ?? 'Send Message';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Heading component with subtitle
  const headingComponentId = generateId();
  const headingElementId = generateId();
  const headingChildren: ElementNode[] = [
    {
      id: headingElementId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H2,
      className: 'pb-section-title',
      content: heading,
      typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'pb-section-subtitle',
      content: "We'd love to hear from you. Fill out the form below and we'll get back to you shortly.",
      typography: { fontSize: '1.05rem', color: 'var(--muted-foreground)', textAlign: TextAlign.CENTER },
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  if (subtext) {
    const subtextId = generateId();
    headingChildren.push({
      id: subtextId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'contact-subtext',
      content: subtext,
      typography: { fontSize: '1.05rem', color: 'var(--muted-foreground)', textAlign: TextAlign.CENTER },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  const headingComponent: ComponentNode = {
    id: headingComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'contact-header',
    meta: { createdAt: now, updatedAt: now },
    layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem' },
    children: headingChildren,
  };

  // Build form fields as element children of a form component
  const formElementId = generateId();
  const formComponentId = generateId();

  // Field labels + inputs wrapped in components
  const fieldComponents: ComponentNode[] = fields.map((fieldLabel) => {
    const labelId = generateId();
    const fieldId = generateId();

    const labelElement: ElementNode = {
      id: labelId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'contact-field-label',
      content: fieldLabel,
      typography: { fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    const fieldElement: ElementNode = {
      id: fieldId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'pb-input',
      content: '',
      meta: { createdAt: now, updatedAt: now },
      attributes: {
        'data-field-type': fieldLabel.toLowerCase() === 'message' ? 'textarea' : 'input',
        'data-label': fieldLabel,
        placeholder: `Enter your ${fieldLabel.toLowerCase()}`,
      },
    };

    return {
      id: generateId(),
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      className: 'contact-field-group',
      meta: { createdAt: now, updatedAt: now },
      layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, gap: '0.375rem' },
      children: [labelElement, fieldElement],
    };
  });

  // Subtext below form
  const formSubtextId = generateId();
  const formSubtextElement: ElementNode = {
    id: formSubtextId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'contact-form-subtext',
    content: 'We respect your privacy and will never share your information.',
    typography: { fontSize: '0.8125rem', color: 'var(--muted-foreground)' },
    meta: { createdAt: now, updatedAt: now },
  };

  // Submit button
  const submitButtonId = generateId();
  const submitButtonElement: ElementNode = {
    id: submitButtonId,
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

  // Form element wrapping fields, button, and subtext
  const formElement: ElementNode = {
    id: formElementId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.FORM,
    className: 'contact-form',
    meta: { createdAt: now, updatedAt: now },
    attributes: { 'data-form': 'contact' },
    children: [...fieldComponents.map((fc) => fc as unknown as ElementNode), submitButtonElement, formSubtextElement],
  };

  // Card wrapper for the form
  const cardComponent: ComponentNode = {
    id: formComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'pb-card-static',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1.25rem',
      maxWidth: '600px',
      padding: '2.5rem',
      margin: '0 auto',
    },
    children: [formElement],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'contact-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Contact Form', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'contact-container',
        meta: { createdAt: now, updatedAt: now },
        children: [headingComponent, cardComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: 'var(--background)' },
  };
}
