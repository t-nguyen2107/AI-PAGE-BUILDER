import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface StatItem {
  value: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: '10K+', label: 'Users' },
  { value: '98%', label: 'Satisfaction' },
  { value: '50M+', label: 'Data Points' },
  { value: '24/7', label: 'Support' },
];

function generateStatCard(stat: StatItem, now: string): ComponentNode {
  const cardId = generateId();
  const valueId = generateId();
  const labelId = generateId();

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'pb-card-static',
    category: ComponentCategory.STATS,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '0.5rem',
      padding: '2rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [
      {
        id: valueId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'pb-stat-value',
        content: stat.value,
        typography: { fontSize: '2.5rem', fontWeight: '700', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: labelId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'stat-label',
        content: stat.label,
        typography: { fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: '500', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };
}

/**
 * Generates a 2x2 stats grid section with stat cards.
 *
 * Props:
 *   heading?: string        - Section heading (default: 'By the Numbers')
 *   subtitle?: string       - Section subtitle
 *   stats?: StatItem[]      - Custom stat data (max 4)
 */
export function generateStatsGrid(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'By the Numbers';
  const subtitle = (props?.subtitle as string) ?? 'Key metrics that demonstrate our platform\'s impact.';
  const customStats = props?.stats as StatItem[] | undefined;

  const stats: StatItem[] = customStats
    ? customStats.slice(0, 4)
    : DEFAULT_STATS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const statCards = stats.map((stat) => generateStatCard(stat, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'stats-grid-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Stats Grid Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'stats-grid-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'stats-grid-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: heading,
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: subtitle,
                typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...statCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          maxWidth: '800px',
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
    background: { color: 'var(--muted)' },
  };
}
