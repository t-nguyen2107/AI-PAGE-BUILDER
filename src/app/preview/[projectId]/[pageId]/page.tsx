import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PreviewPageContent } from "./PreviewPageContent";
import { convertTreeDataToPuck } from "@/puck/migration";
import type { StyleguideColors } from "@/puck/inspector/StyleguideContext";
import { normalizePuckData } from "@/lib/ai/normalize-puck-data";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

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

async function getStyleguideColors(projectId: string): Promise<StyleguideColors | null> {
  const styleguide = await prisma.styleguide.findUnique({
    where: { projectId },
  });
  if (!styleguide) return null;

  const colors = typeof styleguide.colors === "string"
    ? JSON.parse(styleguide.colors)
    : styleguide.colors;

  if (!colors) return null;

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textMuted,
    border: colors.border,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  };
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

  // Normalize: fix invalid types, wrong prop names, bad nested shapes
  const finalData = normalizePuckData(puckData!);

  // Fetch styleguide colors for CSS variable injection
  const styleguideColors = await getStyleguideColors(projectId);

  return (
    <PreviewPageContent
      data={finalData}
      projectId={projectId}
      pageId={pageId}
      styleguideColors={styleguideColors}
    />
  );
}
