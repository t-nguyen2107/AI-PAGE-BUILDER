export { COMPONENT_SEMANTIC_MAP, getRecommendedTag, getSemanticTags } from './semantic-mapper';
export { validateHeadingHierarchy, collectHeadings } from './heading-validator';
export { generateMetaFromPage } from './meta-generator';
export { auditSEO } from './seo-audit';
export { validateSemanticHTML } from './html-validator';
export { generateJsonLd } from './json-ld-generator';
export type { HeadingIssue, SEOMeta, SEOIssue, SEOAuditResult } from '@/types/seo';
export type { JsonLdResult } from './json-ld-generator';
