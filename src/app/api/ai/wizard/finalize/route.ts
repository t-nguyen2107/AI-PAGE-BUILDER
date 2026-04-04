import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FinalizeRequest, FinalizeResponse } from "@/types/wizard";

function buildDefaultPageTree(title: string) {
  return {
    root: { props: { title } },
    content: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectInfo, settings } = body as FinalizeRequest;

    if (!projectInfo?.name) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "projectInfo.name is required" } },
        { status: 422 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create project
      const project = await tx.project.create({
        data: {
          name: projectInfo.name.trim(),
          description: projectInfo.idea?.trim() ?? null,
          siteName: settings?.general?.siteName?.trim() || projectInfo.name.trim(),
          companyName: settings?.general?.companyName?.trim() || null,
          language: settings?.general?.language || projectInfo.language || "en",
        },
      });

      // 2. Create styleguide with AI-suggested values
      const defaultSpacing = {
        values: {
          "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
          "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem",
          "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem",
        },
      };

      const styleguide = await tx.styleguide.create({
        data: {
          projectId: project.id,
          name: "Default Styleguide",
          colors: JSON.stringify(settings?.styleguide?.colors ?? {}),
          typography: JSON.stringify(settings?.styleguide?.typography ?? {}),
          spacing: JSON.stringify(settings?.styleguide?.spacing ?? defaultSpacing),
          componentVariants: JSON.stringify([]),
          cssVariables: JSON.stringify(settings?.styleguide?.cssVariables ?? {}),
        },
      });

      // 3. Create homepage
      const homeTreeData = buildDefaultPageTree("Home");
      const homePage = await tx.page.create({
        data: {
          projectId: project.id,
          title: "Home",
          slug: "home",
          isHomePage: true,
          order: 0,
          treeData: JSON.stringify(homeTreeData),
          seoTitle: settings?.seo?.seoTitle || null,
          seoDescription: settings?.seo?.seoDescription || null,
          seoKeywords: settings?.seo?.seoKeywords
            ? JSON.stringify(settings.seo.seoKeywords.split(",").map((k: string) => k.trim()).filter(Boolean))
            : null,
          ogTitle: settings?.seo?.ogTitle || null,
          ogDescription: settings?.seo?.ogDescription || null,
        },
      });

      // 4. Create page shells for sitemap
      const createdPages: Array<{ id: string; title: string; slug: string }> = [
        { id: homePage.id, title: "Home", slug: "home" },
      ];

      if (projectInfo.pages && projectInfo.pages.length > 0) {
        for (let i = 0; i < projectInfo.pages.length; i++) {
          const page = projectInfo.pages[i];
          // Skip if it's "Home" (already created)
          if (page.slug === "home" || page.title.toLowerCase() === "home") continue;

          const pageTreeData = buildDefaultPageTree(page.title);
          const createdPage = await tx.page.create({
            data: {
              projectId: project.id,
              title: page.title,
              slug: page.slug,
              isHomePage: false,
              order: i + 1,
              treeData: JSON.stringify(pageTreeData),
            },
          });
          createdPages.push({ id: createdPage.id, title: page.title, slug: page.slug });
        }
      }

      // 5. Populate ProjectAIProfile
      await tx.projectAIProfile.upsert({
        where: { projectId: project.id },
        update: {
          businessName: projectInfo.name,
          businessType: projectInfo.idea?.slice(0, 100) || "",
          industry: projectInfo.idea?.slice(0, 100) || "",
          targetAudience: projectInfo.targetAudience || "",
          tone: projectInfo.tone || "",
          preferredStyle: projectInfo.style || "",
          language: projectInfo.language || "en",
          totalSessions: 1,
          lastAnalysisAt: new Date(),
        },
        create: {
          projectId: project.id,
          businessName: projectInfo.name,
          businessType: projectInfo.idea?.slice(0, 100) || "",
          industry: projectInfo.idea?.slice(0, 100) || "",
          targetAudience: projectInfo.targetAudience || "",
          tone: projectInfo.tone || "",
          preferredStyle: projectInfo.style || "",
          language: projectInfo.language || "en",
          totalSessions: 1,
          lastAnalysisAt: new Date(),
        },
      });

      return {
        projectId: project.id,
        homePageId: homePage.id,
        styleguideId: styleguide.id,
        pages: createdPages,
      };
    });

    return Response.json({
      success: true,
      data: result as FinalizeResponse,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err) {
    console.error("Finalize error:", err);
    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Failed to create project" } },
      { status: 500 },
    );
  }
}
