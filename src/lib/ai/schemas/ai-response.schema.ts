/**
 * JSON Schema for LangChain's withStructuredOutput().
 *
 * NOT a Zod schema — raw JSON Schema avoids Zod 3/4 version conflict.
 * Describes the Puck component format (flat ComponentData[]).
 */
export const aiResponseJsonSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'full_page',
        'insert_component',
        'modify_component',
        'replace_component',
        'delete_component',
        'clarify',
      ],
      description: 'The action to perform',
    },
    components: {
      type: 'array',
      items: { $ref: '#/definitions/componentData' },
      description: 'Array of Puck component data objects',
    },
    targetComponentId: {
      type: 'string',
      description: 'ID of the target component for modify/replace/delete actions',
    },
    position: {
      type: 'number',
      description: 'Insert position index (0-based)',
    },
    message: {
      type: 'string',
      description: 'REQUIRED for "clarify" action — questions to ask the user. Optional for other actions — brief summary.',
    },
  },
  required: ['action'],
  additionalProperties: false,

  definitions: {
    componentData: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'HeroSection',
            'FeaturesGrid',
            'PricingTable',
            'TestimonialSection',
            'CTASection',
            'FAQSection',
            'StatsSection',
            'TeamSection',
            'BlogSection',
            'LogoGrid',
            'ContactForm',
            'HeaderNav',
            'FooterSection',
            'TextBlock',
            'ImageBlock',
            'Spacer',
            'ColumnsLayout',
          ],
          description: 'Puck component type name (case-sensitive)',
        },
        props: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique component ID (e.g. "comp_a3x9k2")' },
          },
          required: ['id'],
          additionalProperties: true,
          description: 'Component props — varies by type. See system prompt for full schema.',
        },
      },
      required: ['type', 'props'],
      additionalProperties: false,
    },
  },
} as const;
