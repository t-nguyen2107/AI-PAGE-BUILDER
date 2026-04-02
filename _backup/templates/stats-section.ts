import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface StatData {
  value: string;
  label: string;
}

const DEFAULT_STATS: StatData[] = [
  { value: '10K+', label: 'Active Users' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '50M+', label: 'Data Points Processed' },
  { value: '24/7', label: 'Support Available' },
];

function generateStatCard(stat: StatData, now: string): ComponentNode {
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
      } as ElementNode,
      {
        id: labelId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'stat-label',
        content: stat.label,
        typography: { fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: '500', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      } as ElementNode,
    ],
  };
}

/**
 * Generates a Stats counter section with configurable number of stat cards.
 *
 * Props:
 *   count?: number      - Number of stat cards (2-4, default: 4)
 *   stats?: StatData[]  - Custom stat data
 */
export function generateStatsSection(props?: Record<string, unknown>): SectionNode {
  const count = Math.max(2, Math.min(4, (props?.count as number) ?? 4));
  const customData = props?.stats as StatData[] | undefined;

  const stats: StatData[] = customData
    ? customData.slice(0, count)
    : DEFAULT_STATS.slice(0, count);

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
    className: 'stats-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Stats Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'stats-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'stats-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: 'Our Numbers Speak for Themselves',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: 'Key metrics that demonstrate the impact and reliability of our platform.',
                typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
                meta: { createdAt: now, updatedAt: now },
              } as ElementNode,
            ],
          },
          ...statCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${count}, 1fr)`,
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
    background: { color: 'var(--muted)' },
  };
}
