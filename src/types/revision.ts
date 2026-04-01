import type { PageNode } from './dom-tree';

export interface Revision {
  id: string;
  pageId: string;
  snapshot: PageNode;
  label?: string;
  diff?: JsonPatch[];
  createdAt: string;
}

export interface RevisionDiff {
  revisionId: string;
  previousRevisionId?: string;
  patches: JsonPatch[];
}

export interface JsonPatch {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}
