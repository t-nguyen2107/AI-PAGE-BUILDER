/**
 * E2E test for auto-polish pipeline.
 *
 * Tests the full flow: skeleton detection → makeup stream → polished components.
 * Compares skeleton JSON vs polished JSON for quality validation.
 *
 * Usage: npx tsx scripts/test-auto-polish-e2e.ts
 */
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";

dotenvConfig({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../src/lib/prisma";
import { createMakeupStream } from "../src/lib/ai/streaming";
import type { SSEEvent } from "../src/lib/ai/streaming";

// ─── Test Skeleton Components (same structure wizard creates) ───────────────

const SKELETON_COMPONENTS = [
  { type: "HeaderNav", props: { id: "skel_test_header_01", purpose: "Main navigation for restaurant website" } },
  { type: "HeroSection", props: { id: "skel_test_hero_02", heading: "Experience Culinary Excellence", subtext: "Where fresh ingredients meet professional craftsmanship." } },
  { type: "FeaturesGrid", props: { id: "skel_test_feat_03", title: "Our Culinary Commitment", features: [
    { title: "Farm-to-Table", description: "Fresh ingredients from local farmers." },
    { title: "Expert Chefs", description: "Award-winning culinary professionals." },
    { title: "Exquisite Ambiance", description: "Sophisticated setting for memorable evenings." },
  ] } },
  { type: "Gallery", props: { id: "skel_test_gal_04", heading: "A Visual Taste", purpose: "Food photography showcase" } },
  { type: "CTASection", props: { id: "skel_test_cta_05", heading: "Ready to dine with us?", subtext: "Book your table today.", buttonText: "Reserve a Table" } },
  { type: "FooterSection", props: { id: "skel_test_foot_06", purpose: "Contact and social links" } },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

interface CollectedEvent {
  type: string;
  step?: string;
  label?: string;
  component?: { type: string; props: Record<string, unknown> };
  componentIndex?: number;
  componentTotal?: number;
  replacesSkelId?: string;
  result?: unknown;
  message?: string;
}

function collectStreamEvents(stream: ReadableStream<Uint8Array>): Promise<CollectedEvent[]> {
  return new Promise(async (resolve, reject) => {
    const events: CollectedEvent[] = [];
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as SSEEvent;
            events.push({
              type: event.type,
              step: event.step,
              label: event.label,
              component: event.component as { type: string; props: Record<string, unknown> } | undefined,
              componentIndex: event.componentIndex,
              componentTotal: event.componentTotal,
              replacesSkelId: event.replacesSkelId,
              result: event.result,
              message: event.message,
            });
          } catch { /* skip */ }
        }
      }
      resolve(events);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Main Test ──────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(70));
  console.log("E2E TEST: Auto-Polish Pipeline (Skeleton → Polished)");
  console.log("=".repeat(70));

  // Step 1: Load a real project + styleguide from DB
  console.log("\n[1] Loading project + styleguide from database...");
  const project = await prisma.project.findFirst({
    include: { styleguide: true, pages: true },
  });

  if (!project) {
    console.error("ERROR: No projects found in database. Create one first.");
    process.exit(1);
  }

  const styleguide = project.styleguide;
  console.log(`  Project: ${project.name} (${project.id})`);
  console.log(`  Styleguide: ${styleguide?.id ?? "NONE"}`);
  console.log(`  Styleguide colors: ${styleguide?.colors ? "YES" : "NO"}`);
  console.log(`  Pages: ${project.pages.length}`);

  // Step 2: Load styleguide data for stream
  const styleguideData = styleguide ? {
    colors: styleguide.colors as string | undefined,
    typography: styleguide.typography as string | undefined,
    spacing: styleguide.spacing as string | undefined,
    cssVariables: styleguide.cssVariables as string | undefined,
  } : undefined;

  // Step 3: Build skeleton input (simulating auto-polish with modify intent)
  console.log("\n[2] Building skeleton input (modify mode)...");
  const treeData = {
    root: { props: { title: "Home" } },
    content: SKELETON_COMPONENTS,
    zones: {},
  };

  console.log("  SKELETON JSON:");
  console.log(JSON.stringify(treeData.content.map(c => ({
    type: c.type,
    id: c.props.id,
    props: Object.keys(c.props).filter(k => k !== 'id'),
  })), null, 2));

  // Step 4: Create makeup stream (modify mode = extract from treeData)
  console.log("\n[3] Creating makeup stream (intent=modify, existingTreeData=skeletons)...");
  const startTime = Date.now();

  const stream = createMakeupStream(
    'Polish a restaurant website for "Test Restaurant". Target audience: general. Tone: professional. Style: rich colors, food photography focus.',
    {
      styleguideData,
      businessType: "restaurant",
      existingTreeData: treeData,
      intent: "modify",
      timeoutMs: 120_000,
    },
  );

  // Step 5: Collect events
  console.log("\n[4] Streaming AI polish...");
  const events = await collectStreamEvents(stream);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`  Completed in ${elapsed}s — ${events.length} events`);

  // Step 6: Analyze events
  console.log("\n" + "=".repeat(70));
  console.log("EVENT ANALYSIS");
  console.log("=".repeat(70));

  const statusEvents = events.filter(e => e.type === "status");
  const componentEvents = events.filter(e => e.type === "component_stream");
  const planEvents = events.filter(e => e.type === "plan");
  const doneEvents = events.filter(e => e.type === "done");
  const errorEvents = events.filter(e => e.type === "error");

  console.log(`\n  Status events: ${statusEvents.length}`);
  statusEvents.forEach(e => console.log(`    → ${e.step}: ${e.label}`));

  console.log(`\n  Plan events: ${planEvents.length}`);
  console.log(`  Component stream events: ${componentEvents.length}`);
  console.log(`  Done events: ${doneEvents.length}`);
  console.log(`  Error events: ${errorEvents.length}`);

  if (errorEvents.length > 0) {
    console.log("\n  ERRORS:");
    errorEvents.forEach(e => console.log(`    → ${e.message}`));
  }

  // Step 7: Compare skeleton vs polished
  console.log("\n" + "=".repeat(70));
  console.log("SKELETON vs POLISHED COMPARISON");
  console.log("=".repeat(70));

  const polishedComponents = componentEvents.map(e => e.component).filter(Boolean);

  console.log("\n  SKELETON COMPONENTS:");
  SKELETON_COMPONENTS.forEach((c, i) => {
    console.log(`    ${i + 1}. ${c.type} (id: ${c.props.id})`);
    console.log(`       Props: ${Object.keys(c.props).filter(k => k !== 'id').join(', ') || 'minimal'}`);
  });

  console.log("\n  POLISHED COMPONENTS:");
  polishedComponents.forEach((c, i) => {
    if (!c) return;
    const props = c.props as Record<string, unknown>;
    console.log(`    ${i + 1}. ${c.type} (id: ${props?.id})`);
    const polishProps = {
      animation: props?.animation,
      gradientFrom: props?.gradientFrom,
      gradientTo: props?.gradientTo,
      hoverEffect: props?.hoverEffect,
      backgroundUrl: props?.backgroundUrl ? "YES" : undefined,
      variant: props?.variant,
      cardStyle: props?.cardStyle,
    };
    const active = Object.entries(polishProps).filter(([, v]) => v !== undefined);
    if (active.length > 0) {
      console.log(`       Polished: ${active.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    console.log(`       All props: ${Object.keys(props).filter(k => k !== 'id').join(', ')}`);
  });

  // Step 8: Quality checks
  console.log("\n" + "=".repeat(70));
  console.log("QUALITY CHECKS");
  console.log("=".repeat(70));

  const checks = [
    {
      name: "All skeleton components polished",
      pass: polishedComponents.length >= SKELETON_COMPONENTS.length,
      detail: `${polishedComponents.length}/${SKELETON_COMPONENTS.length} components`,
    },
    {
      name: "Components have animation",
      pass: polishedComponents.some(c => (c?.props as Record<string, unknown>)?.animation),
      detail: `${polishedComponents.filter(c => (c?.props as Record<string, unknown>)?.animation).length} components with animation`,
    },
    {
      name: "HeroSection has gradient",
      pass: polishedComponents.some(c => c?.type === "HeroSection" && (c.props as Record<string, unknown>)?.gradientFrom),
      detail: polishedComponents.some(c => c?.type === "HeroSection")
        ? `gradientFrom=${(polishedComponents.find(c => c?.type === "HeroSection")?.props as Record<string, unknown>)?.gradientFrom}`
        : "No HeroSection found",
    },
    {
      name: "component_stream has replacesSkelId",
      pass: componentEvents.some(e => e.replacesSkelId),
      detail: `${componentEvents.filter(e => e.replacesSkelId).length}/${componentEvents.length} events with replacesSkelId`,
    },
    {
      name: "Done event received",
      pass: doneEvents.length > 0,
      detail: `${doneEvents.length} done events`,
    },
    {
      name: "No errors",
      pass: errorEvents.length === 0,
      detail: `${errorEvents.length} errors`,
    },
    {
      name: "Polished components have animation or enrichment",
      pass: polishedComponents.every(c => Object.keys(c?.props ?? {}).length >= 3),
      detail: `Prop counts: ${polishedComponents.map(c => `${c?.type}(${Object.keys(c?.props ?? {}).length})`).join(', ')}`,
    },
  ];

  let allPass = true;
  for (const check of checks) {
    const icon = check.pass ? "PASS" : "FAIL";
    if (!check.pass) allPass = false;
    console.log(`  [${icon}] ${check.name}`);
    console.log(`         ${check.detail}`);
  }

  // Step 9: Write comparison JSON
  console.log("\n" + "=".repeat(70));
  console.log("JSON OUTPUT (for detailed comparison)");
  console.log("=".repeat(70));

  const comparison = {
    skeleton: SKELETON_COMPONENTS,
    polished: polishedComponents,
    events: events.map(e => ({ type: e.type, step: e.step, label: e.label, replacesSkelId: e.replacesSkelId })),
    qualityChecks: checks.map(c => ({ name: c.name, pass: c.pass, detail: c.detail })),
    meta: { elapsed: `${elapsed}s`, eventCount: events.length },
  };

  console.log(JSON.stringify(comparison, null, 2));

  // Write comparison to file for detailed review
  const outPath = resolve(process.cwd(), "json_test_result.json");
  writeFileSync(outPath, JSON.stringify(comparison, null, 2), "utf-8");
  console.log(`\n  Comparison JSON written to: ${outPath}`);

  // Final verdict
  console.log("\n" + "=".repeat(70));
  console.log(allPass ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED");
  console.log("=".repeat(70));

  await prisma.$disconnect();
  process.exit(allPass ? 0 : 1);
}

main().catch(async (err) => {
  console.error("FATAL:", err);
  await prisma.$disconnect();
  process.exit(1);
});
