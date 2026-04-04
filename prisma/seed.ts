import { PrismaClient } from '@prisma/client';
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

async function main() {
  console.log('Seeding database...');

  // Create default project
  const project = await prisma.project.create({
    data: {
      id: 'proj_default',
      name: 'My First Website',
      description: 'A sample project created by AI Website Builder',
    },
  });

  // Create default styleguide
  const styleguide = await prisma.styleguide.create({
    data: {
      id: 'sg_default',
      projectId: project.id,
      name: 'Default Styleguide',
      colors: JSON.stringify({
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
      }),
      typography: JSON.stringify({
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        monoFont: 'JetBrains Mono, monospace',
        fontSizes: {
          xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
          xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
        },
        fontWeights: {
          light: '300', normal: '400', medium: '500', semibold: '600', bold: '700',
        },
      }),
      spacing: JSON.stringify({
        values: {
          '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem',
          '5': '1.25rem', '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem',
          '16': '4rem', '20': '5rem', '24': '6rem',
        },
      }),
      componentVariants: JSON.stringify([]),
      cssVariables: JSON.stringify({
        '--color-primary': '#3b82f6',
        '--color-secondary': '#10b981',
        '--color-accent': '#f59e0b',
        '--color-background': '#ffffff',
        '--color-surface': '#f8fafc',
        '--color-text': '#0f172a',
        '--color-text-muted': '#64748b',
        '--color-border': '#e2e8f0',
      }),
    },
  });

  // Create global header section
  const headerSection = await prisma.globalSection.create({
    data: {
      id: 'gs_header',
      projectId: project.id,
      sectionType: 'header',
      sectionName: 'Header Navigation',
      treeData: JSON.stringify({
        id: 'section_header',
        type: 'section',
        tag: 'header',
        children: [
          {
            id: 'container_header_main',
            type: 'container',
            tag: 'div',
            children: [
              {
                id: 'comp_logo',
                type: 'component',
                tag: 'div',
                children: [
                  { id: 'elem_logo_text', type: 'element', tag: 'h1', content: 'My Website', meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
                ],
                meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              },
              {
                id: 'comp_nav',
                type: 'component',
                tag: 'div',
                children: [
                  {
                    id: 'elem_nav_list',
                    type: 'element',
                    tag: 'ul',
                    children: [
                      { id: 'item_nav_1', type: 'item', tag: 'li', content: 'Home', meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
                      { id: 'item_nav_2', type: 'item', tag: 'li', content: 'About', meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
                      { id: 'item_nav_3', type: 'item', tag: 'li', content: 'Contact', meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
                    ],
                    meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                  },
                ],
                meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              },
            ],
            layout: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' },
            meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          },
        ],
        layout: { display: 'block' },
        meta: { isGlobal: true, sectionName: 'Header Navigation', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      }),
    },
  });

  // Create global footer section
  const footerSection = await prisma.globalSection.create({
    data: {
      id: 'gs_footer',
      projectId: project.id,
      sectionType: 'footer',
      sectionName: 'Footer',
      treeData: JSON.stringify({
        id: 'section_footer',
        type: 'section',
        tag: 'footer',
        children: [
          {
            id: 'container_footer_main',
            type: 'container',
            tag: 'div',
            children: [
              {
                id: 'elem_footer_text',
                type: 'element',
                tag: 'p',
                content: '© 2026 My Website. All rights reserved.',
                meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              },
            ],
            layout: { display: 'flex', justifyContent: 'center', padding: '2rem' },
            meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          },
        ],
        layout: { display: 'block' },
        meta: { isGlobal: true, sectionName: 'Footer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      }),
    },
  });

  // Create home page with a hero section
  const page = await prisma.page.create({
    data: {
      id: 'page_home',
      projectId: project.id,
      title: 'Home',
      slug: 'home',
      order: 0,
      isHomePage: true,
      seoTitle: 'Home - My Website',
      seoDescription: 'Welcome to my website built with AI Website Builder',
      treeData: JSON.stringify({
        id: 'page_home_root',
        type: 'page',
        tag: 'main',
        children: [
          {
            id: 'section_hero',
            type: 'section',
            tag: 'section',
            children: [
              {
                id: 'container_hero',
                type: 'container',
                tag: 'div',
                children: [
                  {
                    id: 'comp_hero_content',
                    type: 'component',
                    tag: 'div',
                    children: [
                      {
                        id: 'elem_hero_heading',
                        type: 'element',
                        tag: 'h2',
                        content: 'Welcome to Your AI-Built Website',
                        typography: { fontSize: '3xl', fontWeight: 'bold', textAlign: 'center' },
                        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                      },
                      {
                        id: 'elem_hero_text',
                        type: 'element',
                        tag: 'p',
                        content: 'This is your first website built with the AI Website Builder. Start editing by clicking on any element!',
                        typography: { fontSize: 'lg', textAlign: 'center', color: '#64748b' },
                        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                      },
                      {
                        id: 'elem_hero_cta',
                        type: 'element',
                        tag: 'button',
                        content: 'Get Started',
                        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                      },
                    ],
                    meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                  },
                ],
                layout: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' },
                meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              },
            ],
            layout: { display: 'block' },
            background: { color: '#f8fafc' },
            meta: { sectionName: 'Hero', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          },
        ],
        meta: {
          title: 'Home',
          description: 'Welcome to my website',
          slug: 'home',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        styleguideId: styleguide.id,
        globalSectionIds: [headerSection.id, footerSection.id],
      }),
    },
  });

  // Create initial revision
  await prisma.revision.create({
    data: {
      id: 'rev_initial',
      pageId: page.id,
      snapshot: page.treeData,
      label: 'Initial state',
    },
  });

  console.log('Seed completed!');
  console.log(`  Project: ${project.name} (${project.id})`);
  console.log(`  Styleguide: ${styleguide.name} (${styleguide.id})`);
  console.log(`  Page: ${page.title} (${page.id})`);
  console.log(`  Global Sections: header, footer`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
