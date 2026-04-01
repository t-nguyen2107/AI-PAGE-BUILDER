import type { PageNode } from './dom-tree';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  styleguideId: string;
  globalSectionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isHomePage: boolean;
  treeData: PageNode;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalSection {
  id: string;
  projectId: string;
  sectionType: 'header' | 'footer' | 'nav' | 'custom';
  sectionName: string;
  treeData: import('./dom-tree').SectionNode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  isHomePage?: boolean;
}
