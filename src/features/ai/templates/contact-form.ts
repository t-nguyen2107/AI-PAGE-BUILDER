import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

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

  // Heading component
  const headingComponentId = generateId();
  const headingElementId = generateId();
  const headingChildren: ElementNode[] = [
    {
      id: headingElementId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H2,
      className: 'contact-heading',
      content: heading,
      typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
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
      typography: { fontSize: '1.05rem', color: '#64748b', textAlign: TextAlign.CENTER },
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

  const formChildren: ElementNode[] = fields.map((fieldLabel) => {
    const fieldId = generateId();
    return {
      id: fieldId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'contact-field',
      content: fieldLabel,
      meta: { createdAt: now, updatedAt: now },
      attributes: {
        'data-field-type': fieldLabel.toLowerCase() === 'message' ? 'textarea' : 'input',
        'data-label': fieldLabel,
        placeholder: `Enter your ${fieldLabel.toLowerCase()}`,
      },
    };
  });

  // Submit button
  const submitButtonId = generateId();
  formChildren.push({
    id: submitButtonId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.BUTTON,
    className: 'contact-submit',
    content: submitText,
    attributes: { type: 'submit' },
    inlineStyles: {
      padding: '0.875rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: '#3b82f6',
      color: '#ffffff',
    },
    meta: { createdAt: now, updatedAt: now },
  });

  const formComponent: ComponentNode = {
    id: formComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'contact-form-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1.25rem',
      maxWidth: '600px',
      margin: '0 auto',
    },
    children: [
      {
        id: formElementId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.FORM,
        className: 'contact-form',
        meta: { createdAt: now, updatedAt: now },
        attributes: { 'data-form': 'contact' },
        children: formChildren,
      },
    ],
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
        children: [headingComponent, formComponent],
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
    background: { color: '#ffffff' },
  };
}
