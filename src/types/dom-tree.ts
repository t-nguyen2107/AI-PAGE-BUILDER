import {
  NodeType,
  SemanticTag,
  DisplayType,
  ComponentCategory,
  FlexDirection,
  TextAlign,
} from './enums';

// ===========================================
// BASE TYPES
// ===========================================

export interface NodeMeta {
  locked?: boolean;
  hidden?: boolean;
  isGlobal?: boolean;
  sourceLibraryId?: string;
  aiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BaseNode {
  id: string;
  name?: string;
  type: NodeType;
  tag: SemanticTag;
  className?: string;
  inlineStyles?: Record<string, string>;
  attributes?: Record<string, string>;
  meta?: NodeMeta;
  effects?: EffectsProperties;
}

// ===========================================
// LAYOUT & TYPOGRAPHY PROPERTIES
// ===========================================

export interface LayoutProperties {
  display?: DisplayType;
  flexDirection?: FlexDirection;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  gap?: string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;
  order?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  padding?: string;
  margin?: string;
  maxWidth?: string;
  minWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
}

export interface TypographyProperties {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: TextAlign;
  color?: string;
  textDecoration?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface BackgroundProperties {
  color?: string;
  imageUrl?: string;
  gradient?: string;
  size?: 'cover' | 'contain' | 'auto';
  position?: string;
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
}

export interface EffectsProperties {
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;
  transform?: string;
  transformOrigin?: string;
  transition?: string;
  filter?: string;
}

// ===========================================
// HIERARCHICAL NODE INTERFACES
// ===========================================

/** Level 1: Page — root node */
export interface PageNode extends BaseNode {
  type: NodeType.PAGE;
  tag: SemanticTag.MAIN;
  children: SectionNode[];
  meta: NodeMeta & {
    title: string;
    description?: string;
    slug: string;
    seoKeywords?: string[];
    faviconUrl?: string;
  };
  styleguideId: string;
  globalSectionIds: string[];
}

/** Level 2: Section — top-level content block */
export interface SectionNode extends BaseNode {
  type: NodeType.SECTION;
  tag: SemanticTag.SECTION | SemanticTag.HEADER | SemanticTag.FOOTER | SemanticTag.NAV;
  children: ContainerNode[];
  layout: LayoutProperties;
  background?: BackgroundProperties;
  meta: NodeMeta & {
    isGlobal?: boolean;
    sectionName?: string;
  };
}

/** Level 3: Container — layout wrapper */
export interface ContainerNode extends BaseNode {
  type: NodeType.CONTAINER;
  tag: SemanticTag.DIV;
  children: ComponentNode[];
  layout: LayoutProperties;
}

/** Level 4: Component — a meaningful UI unit */
export interface ComponentNode extends BaseNode {
  type: NodeType.COMPONENT;
  tag: SemanticTag.DIV | SemanticTag.ARTICLE | SemanticTag.FIGURE;
  children: ElementNode[];
  layout?: LayoutProperties;
  category?: ComponentCategory;
}

/** Level 5: Element — atomic content element */
export interface ElementNode extends BaseNode {
  type: NodeType.ELEMENT;
  tag:
    | SemanticTag.H1
    | SemanticTag.H2
    | SemanticTag.H3
    | SemanticTag.H4
    | SemanticTag.H5
    | SemanticTag.H6
    | SemanticTag.P
    | SemanticTag.IMG
    | SemanticTag.A
    | SemanticTag.BUTTON
    | SemanticTag.FORM
    | SemanticTag.UL
    | SemanticTag.OL;
  children?: ElementNode[] | ItemNode[];
  typography?: TypographyProperties;
  content?: string;
  src?: string;
  href?: string;
}

/** Level 6: Item — leaf node */
export interface ItemNode extends BaseNode {
  type: NodeType.ITEM;
  tag: SemanticTag.LI | SemanticTag.SPAN | SemanticTag.FIGCAPTION | SemanticTag.DIV;
  typography?: TypographyProperties;
  content?: string;
  children?: never;
}

// ===========================================
// UNION TYPES
// ===========================================

/** Union type for any node in the tree */
export type DOMNode =
  | PageNode
  | SectionNode
  | ContainerNode
  | ComponentNode
  | ElementNode
  | ItemNode;

/** Helper for type narrowing by NodeType */
export type NodeByType<T extends NodeType> =
  T extends NodeType.PAGE ? PageNode :
  T extends NodeType.SECTION ? SectionNode :
  T extends NodeType.CONTAINER ? ContainerNode :
  T extends NodeType.COMPONENT ? ComponentNode :
  T extends NodeType.ELEMENT ? ElementNode :
  T extends NodeType.ITEM ? ItemNode :
  never;

/** Node types that can have children */
export type ParentNode = PageNode | SectionNode | ContainerNode | ComponentNode;

/** Node types that are content-level (no layout) */
export type ContentNode = ElementNode | ItemNode;
