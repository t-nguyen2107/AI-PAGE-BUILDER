import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PreviewPageContent } from "./PreviewPageContent";
import { convertTreeDataToPuck } from "@/puck/migration";

interface PreviewPageProps {
  params: Promise<{
    projectId: string;
    pageId: string;
  }>;
}

async function getPageData(projectId: string, pageId: string) {
  const page = await prisma.page.findFirst({
    where: { id: pageId, projectId },
  });

  if (!page) return null;

  const globalSections = await prisma.globalSection.findMany({
    where: { projectId },
  });

  return { page, globalSections };
}

export async function generateMetadata(props: PreviewPageProps): Promise<Metadata> {
  const { projectId, pageId } = await props.params;
  const data = await getPageData(projectId, pageId);

  if (!data) return { title: "Page Not Found" };

  const { page } = data;
  const title = page.seoTitle || page.title;
  const description = page.seoDescription || undefined;
  const keywords = page.seoKeywords ?? undefined;

  return { title, description, keywords };
}

export default async function PreviewPage(props: PreviewPageProps) {
  const { projectId, pageId } = await props.params;
  const data = await getPageData(projectId, pageId);

  if (!data) notFound();

  const { page } = data;

  // Parse treeData — support both Puck and old DOM formats
  let puckData;
  try {
    const raw = JSON.parse(page.treeData);
    puckData = convertTreeDataToPuck(raw);
  } catch {
    notFound();
  }

  if (!puckData) notFound();

  return (
    <PreviewPageContent
      data={puckData}
      projectId={projectId}
      pageId={pageId}
    />
  );
}
