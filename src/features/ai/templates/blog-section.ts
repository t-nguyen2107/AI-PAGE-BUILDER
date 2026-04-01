import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface BlogPostData {
  title: string;
  excerpt: string;
  imageUrl?: string;
  linkUrl?: string;
}

const DEFAULT_BLOG_POSTS: BlogPostData[] = [
  {
    title: 'Getting Started with Modern Web Development',
    excerpt: 'Learn the fundamentals of building modern web applications with the latest tools and best practices.',
  },
  {
    title: '10 Tips for Better User Experience Design',
    excerpt: 'Discover actionable strategies to create intuitive and engaging user experiences that convert.',
  },
  {
    title: 'Optimizing Performance for Production',
    excerpt: 'A comprehensive guide to making your web applications lightning-fast and scalable.',
  },
];

function generateBlogPostCard(post: BlogPostData, index: number, now: string): ComponentNode {
  const cardId = generateId();
  const imageId = generateId();
  const titleId = generateId();
  const excerptId = generateId();
  const linkId = generateId();

  const imageUrl = post.imageUrl ?? `https://picsum.photos/seed/blog-${index}/400/250`;
  const linkUrl = post.linkUrl ?? '#';

  const children: ElementNode[] = [
    {
      id: imageId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'blog-post-image',
      src: imageUrl,
      attributes: { alt: post.title },
      inlineStyles: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: titleId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      className: 'blog-post-title',
      content: post.title,
      typography: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4' },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode,
    {
      id: excerptId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'blog-post-excerpt',
      content: post.excerpt,
      typography: { fontSize: '0.95rem', lineHeight: '1.6', color: '#64748b' },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode,
    {
      id: linkId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.A,
      className: 'blog-post-link',
      content: 'Read More',
      href: linkUrl,
      typography: { fontSize: '0.9rem', fontWeight: '600', color: '#3b82f6', textDecoration: 'underline' },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode,
  ];

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'blog-post-card',
    category: ComponentCategory.BLOG,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      padding: '1.5rem',
    },
    inlineStyles: {
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a Blog posts section with configurable number of post cards.
 *
 * Props:
 *   count?: number         - Number of blog posts (1-4, default: 3)
 *   posts?: BlogPostData[] - Custom blog post data
 */
export function generateBlogSection(props?: Record<string, unknown>): SectionNode {
  const count = Math.max(1, Math.min(4, (props?.count as number) ?? 3));
  const customData = props?.posts as BlogPostData[] | undefined;

  const blogPosts: BlogPostData[] = customData
    ? customData.slice(0, count)
    : DEFAULT_BLOG_POSTS.slice(0, count);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();

  const postCards = blogPosts.map((post, i) => generateBlogPostCard(post, i, now));
  const colCount = Math.min(postCards.length, 3);

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'blog-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Blog Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'blog-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'blog-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, justifyContent: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'blog-title',
                content: 'Latest from Our Blog',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...postCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      } as ContainerNode,
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: '#ffffff' },
  };
}
