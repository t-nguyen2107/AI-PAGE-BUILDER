import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Default styleguide values
// ---------------------------------------------------------------------------

const DEFAULT_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

const DEFAULT_TYPOGRAPHY = {
  headingFont: 'Inter, sans-serif',
  bodyFont: 'Inter, sans-serif',
  monoFont: 'JetBrains Mono, monospace',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

const DEFAULT_SPACING = {
  values: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
  },
};

// ---------------------------------------------------------------------------
// Helpers — build default home page treeData
// ---------------------------------------------------------------------------

function buildHomePageTree(styleguideId: string): string {
  const now = new Date().toISOString();
  const id = () => nanoid(10);

  const tree = {
    id: `page_${id()}`,
    type: 'page',
    tag: 'main',
    children: [
      {
        id: `section_hero_${id()}`,
        type: 'section',
        tag: 'section',
        children: [
          {
            id: `container_hero_${id()}`,
            type: 'container',
            tag: 'div',
            children: [
              {
                id: `comp_hero_${id()}`,
                type: 'component',
                tag: 'div',
                children: [
                  {
                    id: `elem_heading_${id()}`,
                    type: 'element',
                    tag: 'h2',
                    content: 'Welcome',
                    meta: { createdAt: now, updatedAt: now },
                  },
                  {
                    id: `elem_text_${id()}`,
                    type: 'element',
                    tag: 'p',
                    content: 'Start building your page',
                    meta: { createdAt: now, updatedAt: now },
                  },
                ],
                meta: { createdAt: now, updatedAt: now },
              },
            ],
            layout: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '6rem 2rem',
              maxWidth: '800px',
              margin: '0 auto',
            },
            meta: { createdAt: now, updatedAt: now },
          },
        ],
        layout: { display: 'block' },
        meta: { sectionName: 'Hero', createdAt: now, updatedAt: now },
      },
    ],
    meta: { title: 'Home', slug: 'home', createdAt: now, updatedAt: now },
    styleguideId,
    globalSectionIds: [] as string[],
  };

  return JSON.stringify(tree);
}

// ---------------------------------------------------------------------------
// GET /api/projects — list all projects with page count
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { pages: true } } },
    });

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      pageCount: p._count.pages,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return successResponse(result);
  } catch (err) {
    console.error('Failed to list projects:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch projects', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects — create project + default styleguide + home page
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body as { name?: string; description?: string };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Project name is required', 422);
    }

    // Use a transaction to ensure atomicity
    const project = await prisma.$transaction(async (tx) => {
      // 1. Create project
      const newProject = await tx.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() ?? null,
        },
      });

      // 2. Create default styleguide
      const styleguide = await tx.styleguide.create({
        data: {
          projectId: newProject.id,
          name: 'Default Styleguide',
          colors: JSON.stringify(DEFAULT_COLORS),
          typography: JSON.stringify(DEFAULT_TYPOGRAPHY),
          spacing: JSON.stringify(DEFAULT_SPACING),
          componentVariants: JSON.stringify([]),
          cssVariables: JSON.stringify({}),
        },
      });

      // 3. Create home page with basic hero section
      const treeData = buildHomePageTree(styleguide.id);

      await tx.page.create({
        data: {
          projectId: newProject.id,
          title: 'Home',
          slug: 'home',
          isHomePage: true,
          order: 0,
          treeData,
        },
      });

      // Return the project with its relations
      return tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          pages: { orderBy: { order: 'asc' } },
          styleguide: true,
        },
      });
    });

    return successResponse(project, 201);
  } catch (err) {
    console.error('Failed to create project:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create project', 500);
  }
}
