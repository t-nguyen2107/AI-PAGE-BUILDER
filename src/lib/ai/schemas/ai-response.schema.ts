/**
 * JSON Schema for LangChain's withStructuredOutput().
 *
 * NOT a Zod schema — raw JSON Schema avoids Zod 3/4 version conflict.
 * Describes the Puck component format (flat ComponentData[]).
 *
 * Action names MUST match AIAction enum values exactly.
 */
export const aiResponseJsonSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'full_page',
        'insert_component',
        'insert_section',
        'modify_node',
        'replace_node',
        'delete_node',
        'reorder_children',
        'clarify',
      ],
      description: 'The action to perform. Must match enum values exactly.',
    },
    components: {
      type: 'array',
      items: { $ref: '#/definitions/componentData' },
      description: 'Array of Puck component data objects',
    },
    targetComponentId: {
      type: 'string',
      description: 'ID or name of the target component for modify/replace/delete actions. Can be the component "name" (e.g. "hero_main") or its "id" (e.g. "comp_a3x9k2").',
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
            // Sections
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
            'NewsletterSignup',
            'Gallery',
            'SocialProof',
            'ComparisonTable',
            'ProductCards',
            'FeatureShowcase',
            'CountdownTimer',
            'AnnouncementBar',
            'Banner',
            // Atomic / layout
            'TextBlock',
            'HeadingBlock',
            'RichTextBlock',
            'ImageBlock',
            'ButtonBlock',
            'CardBlock',
            'Spacer',
            'ColumnsLayout',
            'SectionBlock',
            'Blank',
            'Flex',
            'Grid',
            // Custom
            'CustomSection',
          ],
          description: 'Puck component type name (case-sensitive)',
        },
        props: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique component ID (e.g. "comp_a3x9k2")' },
            name: { type: 'string', description: 'Human-readable component name for targeting (e.g. "hero_main", "pricing_pro"). Use snake_case, max 30 chars.' },
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
