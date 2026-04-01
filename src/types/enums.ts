export enum NodeType {
  PAGE = 'page',
  SECTION = 'section',
  CONTAINER = 'container',
  COMPONENT = 'component',
  ELEMENT = 'element',
  ITEM = 'item',
}

export enum SemanticTag {
  HEADER = 'header',
  NAV = 'nav',
  MAIN = 'main',
  SECTION = 'section',
  ARTICLE = 'article',
  ASIDE = 'aside',
  FOOTER = 'footer',
  DIV = 'div',
  SPAN = 'span',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  P = 'p',
  A = 'a',
  IMG = 'img',
  UL = 'ul',
  OL = 'ol',
  LI = 'li',
  BUTTON = 'button',
  FORM = 'form',
  INPUT = 'input',
  FIGURE = 'figure',
  FIGCAPTION = 'figcaption',
}

export enum DisplayType {
  BLOCK = 'block',
  FLEX = 'flex',
  GRID = 'grid',
  INLINE = 'inline',
  INLINE_BLOCK = 'inline-block',
}

export enum ComponentCategory {
  HERO = 'hero',
  PRICING = 'pricing',
  FEATURES = 'features',
  TESTIMONIAL = 'testimonial',
  CTA = 'cta',
  FAQ = 'faq',
  GALLERY = 'gallery',
  CONTACT = 'contact',
  HEADER_NAV = 'header-nav',
  FOOTER = 'footer',
  STATS = 'stats',
  TEAM = 'team',
  LOGO_GRID = 'logo-grid',
  BLOG = 'blog',
  CUSTOM = 'custom',
}

export enum AIAction {
  INSERT_SECTION = 'insert_section',
  INSERT_COMPONENT = 'insert_component',
  MODIFY_NODE = 'modify_node',
  DELETE_NODE = 'delete_node',
  REPLACE_NODE = 'replace_node',
  REORDER_CHILDREN = 'reorder_children',
  FULL_PAGE = 'full_page',
  CLARIFY = 'clarify',
}

export enum FlexDirection {
  ROW = 'row',
  COLUMN = 'column',
  ROW_REVERSE = 'row-reverse',
  COLUMN_REVERSE = 'column-reverse',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum BackgroundSize {
  COVER = 'cover',
  CONTAIN = 'contain',
  AUTO = 'auto',
}

export enum BackgroundRepeat {
  NO_REPEAT = 'no-repeat',
  REPEAT = 'repeat',
  REPEAT_X = 'repeat-x',
  REPEAT_Y = 'repeat-y',
}
