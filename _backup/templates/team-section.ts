import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface TeamMemberData {
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

const DEFAULT_TEAM: TeamMemberData[] = [
  { name: 'Alex Rivera', role: 'CEO & Founder', bio: 'Visionary leader with 15+ years of experience.' },
  { name: 'Sarah Chen', role: 'CTO', bio: 'Tech innovator specializing in scalable systems.' },
  { name: 'Marcus Johnson', role: 'Head of Design', bio: 'Award-winning designer with a passion for UX.' },
  { name: 'Emily Davis', role: 'Head of Marketing', bio: 'Growth strategist who built brands from scratch.' },
];

function generateTeamMemberCard(member: TeamMemberData, now: string): ComponentNode {
  const cardId = generateId();
  const nameId = generateId();
  const roleId = generateId();

  const children: ElementNode[] = [];

  // Avatar image using picsum.photos
  const imageUrl = member.imageUrl ?? `https://picsum.photos/seed/${member.name.replace(/\s/g, '')}/200/200`;
  const imageId = generateId();
  children.push({
    id: imageId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.IMG,
    className: 'pb-avatar',
    src: imageUrl,
    attributes: { alt: `${member.name} photo` },
    inlineStyles: { width: '96px', height: '96px', objectFit: 'cover' },
    meta: { createdAt: now, updatedAt: now },
  });

  children.push(
    {
      id: nameId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H4,
      className: 'team-member-name',
      content: member.name,
      typography: { fontSize: '1.25rem', fontWeight: '600', textAlign: TextAlign.CENTER, color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode,
    {
      id: roleId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'team-member-role',
      content: member.role,
      typography: { fontSize: '0.95rem', color: 'var(--primary-container)', fontWeight: '500', textAlign: TextAlign.CENTER },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode
  );

  if (member.bio) {
    const bioId = generateId();
    children.push({
      id: bioId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'team-member-bio',
      content: member.bio,
      typography: { fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--muted-foreground)', textAlign: TextAlign.CENTER },
      meta: { createdAt: now, updatedAt: now },
    } as ElementNode);
  }

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'pb-card',
    category: ComponentCategory.TEAM,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a Team members section with configurable number of cards.
 *
 * Props:
 *   count?: number        - Number of team members (2-6, default: 4)
 *   members?: TeamMemberData[] - Custom team member data
 */
export function generateTeamSection(props?: Record<string, unknown>): SectionNode {
  const count = Math.max(2, Math.min(6, (props?.count as number) ?? 4));
  const customData = props?.members as TeamMemberData[] | undefined;

  const teamMembers: TeamMemberData[] = customData
    ? customData.slice(0, count)
    : DEFAULT_TEAM.slice(0, count);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const memberCards = teamMembers.map((member) => generateTeamMemberCard(member, now));
  const colCount = Math.min(memberCards.length, 4);

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'team-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Team Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'team-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'team-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: 'Meet Our Team',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: 'The talented people behind our success, dedicated to delivering excellence.',
                typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
                meta: { createdAt: now, updatedAt: now },
              } as ElementNode,
            ],
          },
          ...memberCards,
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
    background: { color: 'var(--background)' },
  };
}
