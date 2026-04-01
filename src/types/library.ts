import type { ComponentCategory } from './enums';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from './dom-tree';

export type LibraryNodeData = SectionNode | ContainerNode | ComponentNode | ElementNode;

export interface LibraryItem {
  id: string;
  name: string;
  description?: string;
  category: ComponentCategory | 'section' | 'container';
  thumbnailUrl?: string;
  nodeData: LibraryNodeData;
  tags: string[];
  embedding?: number[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveToLibraryInput {
  name: string;
  description?: string;
  category: ComponentCategory | 'section' | 'container';
  nodeData: LibraryNodeData;
  tags: string[];
  isPublic?: boolean;
}
