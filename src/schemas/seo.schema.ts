import { z } from 'zod';

/**
 * Zod schemas for SEO-related types.
 * Mirrors the interfaces defined in @/types/seo.
 */

const seoIssueSeveritySchema = z.enum(['error', 'warning', 'info']);

const seoIssueCategorySchema = z.enum([
  'heading',
  'semantic',
  'meta',
  'accessibility',
  'performance',
]);

const headingIssueKindSchema = z.enum([
  'multiple_h1',
  'skipped_level',
  'empty_heading',
]);

export const seoIssueSchema = z.object({
  severity: seoIssueSeveritySchema,
  category: seoIssueCategorySchema,
  nodeId: z.string().optional(),
  message: z.string(),
  suggestion: z.string().optional(),
});

export const seoAuditResultSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(seoIssueSchema),
  passed: z.boolean(),
});

export const seoMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
});

export const headingIssueSchema = z.object({
  nodeId: z.string(),
  level: z.number().int().min(1).max(6),
  issue: headingIssueKindSchema,
  message: z.string(),
});
