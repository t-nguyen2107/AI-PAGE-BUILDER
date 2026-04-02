// Enums
export { NodeType, SemanticTag, DisplayType, ComponentCategory, AIAction, FlexDirection, TextAlign, BackgroundSize, BackgroundRepeat } from './enums';

// DOM Tree
export type {
  NodeMeta,
  BaseNode,
  LayoutProperties,
  TypographyProperties,
  BackgroundProperties,
  EffectsProperties,
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
  DOMNode,
  NodeByType,
  ParentNode,
  ContentNode,
} from './dom-tree';

// Styleguide
export type {
  ColorPalette,
  TypographySystem,
  SpacingScale,
  ComponentVariant,
  Styleguide,
} from './styleguide';

// Project
export type {
  Project,
  Page,
  GlobalSection,
  CreateProjectInput,
  CreatePageInput,
} from './project';

// Revision
export type {
  Revision,
  RevisionDiff,
  JsonPatch,
} from './revision';

// Library
export type {
  LibraryNodeData,
  LibraryItem,
  SaveToLibraryInput,
} from './library';

// AI
export type {
  AIGenerationRequest,
  AIGenerationResponse,
  AIDiff,
  ParsedIntent,
} from './ai';

// SEO
export type {
  SEOIssueSeverity,
  SEOIssueCategory,
  HeadingIssueKind,
  SEOIssue,
  SEOAuditResult,
  SEOMeta,
  HeadingIssue,
} from './seo';

// API
export type {
  ApiResponse,
  PaginatedResponse,
  ProjectParams,
  PageParams,
  RevisionParams,
} from './api';
