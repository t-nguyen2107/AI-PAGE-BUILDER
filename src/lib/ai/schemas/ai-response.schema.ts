/**
 * JSON Schema for LangChain's withStructuredOutput().
 *
 * NOT a Zod schema — raw JSON Schema avoids Zod 3/4 version conflict.
 * LangChain enforces this shape at generation time; Zod 4 post-validates after.
 */
export const aiResponseJsonSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'insert_section',
        'insert_component',
        'modify_node',
        'delete_node',
        'replace_node',
        'reorder_children',
        'full_page',
        'clarify',
      ],
      description: 'The action to perform on the DOM tree',
    },
    nodes: {
      type: 'array',
      items: { $ref: '#/definitions/domNode' },
      description: 'Array of DOM nodes matching the action',
    },
    targetNodeId: {
      type: 'string',
      description: 'ID of the target node (optional for insert actions)',
    },
    position: {
      type: 'number',
      description: 'Insert position index (0-based)',
    },
    message: {
      type: 'string',
      description: 'REQUIRED for "clarify" action — questions to ask the user. Optional for other actions — brief summary of what was generated.',
    },
  },
  required: ['action'],
  additionalProperties: false,

  definitions: {
    domNode: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique node ID (e.g. "n_" + random)' },
        type: {
          type: 'string',
          enum: ['section', 'container', 'component', 'element', 'item'],
          description: 'Node type in the hierarchy',
        },
        tag: {
          type: 'string',
          description: 'Semantic HTML tag (section, div, h1, p, img, a, button, etc.)',
        },
        className: { type: 'string', description: 'Tailwind CSS classes' },
        inlineStyles: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Inline CSS styles',
        },
        meta: {
          type: 'object',
          properties: {
            locked: { type: 'boolean' },
            hidden: { type: 'boolean' },
            aiGenerated: { type: 'boolean' },
            sectionName: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        layout: {
          type: 'object',
          properties: {
            display: { type: 'string', enum: ['block', 'flex', 'grid'] },
            flexDirection: { type: 'string', enum: ['row', 'column'] },
            justifyContent: { type: 'string' },
            alignItems: { type: 'string' },
            gap: { type: 'string' },
            padding: { type: 'string' },
            margin: { type: 'string' },
            maxWidth: { type: 'string' },
            width: { type: 'string' },
            height: { type: 'string' },
            borderRadius: { type: 'string' },
          },
        },
        background: {
          type: 'object',
          properties: {
            color: { type: 'string' },
            imageUrl: { type: 'string' },
            gradient: { type: 'string' },
          },
        },
        typography: {
          type: 'object',
          properties: {
            fontFamily: { type: 'string' },
            fontSize: { type: 'string' },
            fontWeight: { type: 'string' },
            lineHeight: { type: 'string' },
            color: { type: 'string' },
            textAlign: { type: 'string', enum: ['left', 'center', 'right'] },
          },
        },
        content: { type: 'string', description: 'Text content for text elements' },
        src: { type: 'string', description: 'Image source URL' },
        href: { type: 'string', description: 'Link URL' },
        category: {
          type: 'string',
          enum: ['hero', 'pricing', 'features', 'testimonial', 'cta', 'faq', 'gallery', 'contact', 'header-nav', 'footer', 'custom'],
        },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/domNode' },
          description: 'Child nodes (empty for item nodes)',
        },
      },
      required: ['id', 'type', 'tag'],
      additionalProperties: false,
    },
  },
} as const;
