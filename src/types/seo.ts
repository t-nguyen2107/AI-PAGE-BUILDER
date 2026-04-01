/**
 * SEO-related type definitions.
 *
 * Central source of truth for all SEO types used across
 * the audit, meta-generation, and heading-validation modules.
 */

/** Issue severity levels for SEO audit findings. */
export type SEOIssueSeverity = 'error' | 'warning' | 'info';

/** Categories that an SEO issue can belong to. */
export type SEOIssueCategory = 'heading' | 'semantic' | 'semantic-html' | 'meta' | 'accessibility' | 'performance';

/** Kinds of heading hierarchy problems. */
export type HeadingIssueKind = 'multiple_h1' | 'skipped_level' | 'empty_heading';

/**
 * Represents a single SEO issue found during audit.
 */
export interface SEOIssue {
  severity: SEOIssueSeverity;
  category: SEOIssueCategory;
  nodeId?: string;
  message: string;
  suggestion?: string;
}

/**
 * The full result of an SEO audit run.
 *
 * `score` ranges from 0 to 100; the audit is considered
 * `passed` when score >= 70.
 */
export interface SEOAuditResult {
  score: number;
  issues: SEOIssue[];
  passed: boolean;
}

/**
 * Open Graph and meta tag data generated from a page tree.
 */
export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * Represents a heading hierarchy problem found during validation.
 */
export interface HeadingIssue {
  nodeId: string;
  level: number;
  issue: HeadingIssueKind;
  message: string;
}
