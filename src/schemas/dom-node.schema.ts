import { z } from 'zod';
import {
  NodeType,
  SemanticTag,
  DisplayType,
  ComponentCategory,
  FlexDirection,
  TextAlign,
} from '@/types/enums';

const nodeMetaSchema = z.object({
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
  sourceLibraryId: z.string().optional(),
  aiGenerated: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const baseNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NodeType),
  tag: z.nativeEnum(SemanticTag),
  className: z.string().optional(),
  inlineStyles: z.record(z.string(), z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  meta: nodeMetaSchema.optional(),
});

const layoutPropertiesSchema = z.object({
  display: z.nativeEnum(DisplayType).optional(),
  flexDirection: z.nativeEnum(FlexDirection).optional(),
  justifyContent: z.string().optional(),
  alignItems: z.string().optional(),
  gap: z.string().optional(),
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  maxWidth: z.string().optional(),
  minWidth: z.string().optional(),
  minHeight: z.string().optional(),
  maxHeight: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  borderRadius: z.string().optional(),
  overflow: z.enum(['visible', 'hidden', 'scroll', 'auto']).optional(),
  position: z.enum(['static', 'relative', 'absolute', 'fixed', 'sticky']).optional(),
});

const typographyPropertiesSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  textAlign: z.nativeEnum(TextAlign).optional(),
  color: z.string().optional(),
  textDecoration: z.string().optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
});

const backgroundPropertiesSchema = z.object({
  color: z.string().optional(),
  imageUrl: z.string().optional(),
  gradient: z.string().optional(),
  size: z.enum(['cover', 'contain', 'auto']).optional(),
  position: z.string().optional(),
  repeat: z.enum(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).optional(),
});

// Recursive schemas using z.lazy
const itemNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.ITEM),
  typography: typographyPropertiesSchema.optional(),
  content: z.string().optional(),
});

const elementNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.ELEMENT),
  tag: z.nativeEnum(SemanticTag),
  children: z.lazy(() => z.array(z.union([elementNodeSchema, itemNodeSchema]))).optional(),
  typography: typographyPropertiesSchema.optional(),
  content: z.string().optional(),
  src: z.string().optional(),
  href: z.string().optional(),
});

const componentNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.COMPONENT),
  tag: z.nativeEnum(SemanticTag),
  children: z.array(elementNodeSchema),
  layout: layoutPropertiesSchema.optional(),
  category: z.nativeEnum(ComponentCategory).optional(),
});

const containerNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.CONTAINER),
  tag: z.literal(SemanticTag.DIV),
  children: z.array(componentNodeSchema),
  layout: layoutPropertiesSchema,
});

const sectionNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.SECTION),
  tag: z.nativeEnum(SemanticTag),
  children: z.array(containerNodeSchema),
  layout: layoutPropertiesSchema,
  background: backgroundPropertiesSchema.optional(),
  meta: nodeMetaSchema.extend({
    isGlobal: z.boolean().optional(),
    sectionName: z.string().optional(),
  }).optional(),
});

const pageNodeSchema: z.ZodType = baseNodeSchema.extend({
  type: z.literal(NodeType.PAGE),
  tag: z.literal(SemanticTag.MAIN),
  children: z.array(sectionNodeSchema),
  meta: nodeMetaSchema.extend({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string(),
    seoKeywords: z.array(z.string()).optional(),
    faviconUrl: z.string().optional(),
  }),
  styleguideId: z.string(),
  globalSectionIds: z.array(z.string()),
});

export const domNodeSchema = z.union([
  pageNodeSchema,
  sectionNodeSchema,
  containerNodeSchema,
  componentNodeSchema,
  elementNodeSchema,
  itemNodeSchema,
]);

export {
  baseNodeSchema,
  nodeMetaSchema,
  layoutPropertiesSchema,
  typographyPropertiesSchema,
  backgroundPropertiesSchema,
  pageNodeSchema,
  sectionNodeSchema,
  containerNodeSchema,
  componentNodeSchema,
  elementNodeSchema,
  itemNodeSchema,
};
