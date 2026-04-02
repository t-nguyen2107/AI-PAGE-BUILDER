import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import type { PageNode, SectionNode } from '@/types';
import { PreviewPageContent } from './PreviewPageContent';

interface PreviewPageProps {
  params: Promise<{
    projectId: string;
    pageId: string;
  }>;
}

/**
 * Fetch page data and global sections for preview.
 * Returns null if page not found.
 */
async function getPageData(projectId: string, pageId: string) {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      projectId,
    },
  });

  if (!page) return null;

  // Fetch global sections (header/footer) for the project
  const globalSections = await prisma.globalSection.findMany({
    where: { projectId },
  });

  return { page, globalSections };
}

/**
 * Generate metadata for the preview page.
 * Uses SEO fields from the Page model, falling back to the page title.
 */
export async function generateMetadata(props: PreviewPageProps): Promise<Metadata> {
  const { projectId, pageId } = await props.params;
  const data = await getPageData(projectId, pageId);

  if (!data) {
    return { title: 'Page Not Found' };
  }

  const { page } = data;

  // Try to extract meta from the treeData as a fallback
  let treeTitle: string | undefined;
  let treeDescription: string | undefined;
  try {
    const tree = JSON.parse(page.treeData) as PageNode;
    treeTitle = tree.meta?.title;
    treeDescription = tree.meta?.description;
  } catch {
    // treeData may be malformed — ignore
  }

  const title = page.seoTitle || treeTitle || page.title;
  const description = page.seoDescription || treeDescription || undefined;
  const keywords = page.seoKeywords ?? undefined;

  return {
    title,
    description,
    keywords,
  };
}

/**
 * Preview Page — Server Component.
 *
 * Fetches the page and global sections from the database, parses the tree
 * data, and renders a clean preview with no builder UI. The actual rendering
 * is delegated to the client-side PreviewPageContent component.
 */
export default async function PreviewPage(props: PreviewPageProps) {
  const { projectId, pageId } = await props.params;
  const data = await getPageData(projectId, pageId);

  if (!data) {
    notFound();
  }

  const { page, globalSections } = data;

  // Parse the page tree
  let tree: PageNode;
  try {
    tree = JSON.parse(page.treeData) as PageNode;
  } catch {
    notFound();
  }

  // Parse global sections into SectionNode objects
  const headerSections: SectionNode[] = [];
  const footerSections: SectionNode[] = [];

  for (const gs of globalSections) {
    try {
      const sectionNode = JSON.parse(gs.treeData) as SectionNode;
      if (gs.sectionType === 'header' || gs.sectionType === 'nav') {
        headerSections.push(sectionNode);
      } else if (gs.sectionType === 'footer') {
        footerSections.push(sectionNode);
      }
    } catch {
      // Skip malformed global sections
    }
  }

  return (
    <PreviewPageContent
      tree={tree}
      headerSections={headerSections}
      footerSections={footerSections}
      projectId={projectId}
      pageId={pageId}
    />
  );
}
