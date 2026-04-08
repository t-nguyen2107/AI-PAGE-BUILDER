/**
 * E2E Test — Full Wizard Flow + Makeup Pipeline
 *
 * Steps:
 * 1. Skip chat (simulated collected info)
 * 2. Generate settings (styleguide + SEO)
 * 3. Finalize (create project + pages)
 * 4. Update styleguide with CSS vars
 * 5. Generate page via makeup stream pipeline
 * 6. Save page
 * 7. Report
 */

const BASE_URL = 'http://localhost:3000';

interface TimingResult {
  step: string;
  durationMs: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  details: string;
}

const results: TimingResult[] = [];
const totalCost = { usd: 0 };

function timing(step: string, start: number, details: string): TimingResult {
  const t: TimingResult = { step, durationMs: Date.now() - start, details };
  results.push(t);
  console.log(`  [${t.durationMs}ms] ${step}: ${details}`);
  return t;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!text) return {} as T;
  const data = JSON.parse(text);
  if (!data.success) throw new Error(`API error: ${JSON.stringify(data.error)}`);
  return data.data as T;
}

interface SSEEvent {
  type: string;
  [key: string]: unknown;
}

async function fetchSSE(url: string, body: unknown): Promise<{ events: SSEEvent[]; finalResult: unknown }> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    throw new Error(`SSE failed (${res.status}): ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: SSEEvent[] = [];
  let finalResult: unknown = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const match = part.match(/^data: (.+)$/s);
      if (!match) continue;
      try {
        const event = JSON.parse(match[1]);
        events.push(event);
        if (event.type === 'done') finalResult = event.result;
        if (event.type === 'error') console.error('  SSE ERROR:', event.message);
      } catch { /* skip */ }
    }
  }

  return { events, finalResult };
}

// ─── Main Test ────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(70));
  console.log('E2E TEST — Full Wizard Flow + Makeup Pipeline');
  console.log('='.repeat(70));

  const testInfo = {
    name: 'Bella Rosa Italian Restaurant',
    idea: 'Nhà hàng Ý sang trọng với không gian ấm cúng, phục vụ mỳ Ý tươi, pizza nướng củi và rượu vang chọn lọc',
    style: 'elegant',
    targetAudience: 'couples, food enthusiasts, business dining',
    tone: 'warm and sophisticated',
    language: 'vi',
    pages: [
      { title: 'Home', slug: 'home', description: 'Trang chủ nhà hàng Bella Rosa' },
    ],
  };

  try {
    // ── STEP 2: Generate Settings ──
    console.log('\n## Step 1: Generate Settings (styleguide + SEO)');
    let t0 = Date.now();
    const settings = await apiFetch<{
      styleguide: Record<string, unknown>;
      seo: Record<string, unknown>;
      general: Record<string, unknown>;
    }>('/api/ai/wizard/generate-settings', { projectInfo: testInfo });
    timing('generate-settings', t0, `styleguide colors: ${Object.keys(settings.styleguide.colors as object || {}).length} tokens`);

    // ── STEP 3: Finalize ──
    console.log('\n## Step 2: Finalize (create project)');
    t0 = Date.now();
    const finalize = await apiFetch<{
      projectId: string;
      homePageId: string;
      styleguideId: string;
      pages: Array<{ id: string; title: string; slug: string }>;
    }>('/api/ai/wizard/finalize', {
      projectInfo: testInfo,
      settings,
    });
    timing('finalize', t0, `projectId=${finalize.projectId}, homePageId=${finalize.homePageId}, styleguideId=${finalize.styleguideId}`);

    const { projectId, homePageId, styleguideId } = finalize;

    // ── STEP 4a: Update Styleguide ──
    console.log('\n## Step 3: Update Styleguide');
    t0 = Date.now();
    await apiFetch(`/api/projects/${projectId}/styleguide`, {
      ...settings.styleguide,
      cssVariables: settings.styleguide.cssVariables || {},
    }, 'PUT');
    timing('update-styleguide', t0, 'CSS variables + tokens saved');

    // ── STEP 4c: AI Generate Homepage (MAKEUP PIPELINE) ──
    console.log('\n## Step 4: AI Generate Homepage (Makeup Pipeline)');
    const prompt = `Tạo landing page hoàn chỉnh cho "${testInfo.name}".\nBusiness: ${testInfo.idea}\nTarget audience: ${testInfo.targetAudience}\nVisual style: ${testInfo.style}\nTone: ${testInfo.tone}\n\nGenerate a professional landing page with all essential sections.`;

    t0 = Date.now();
    const { events, finalResult } = await fetchSSE('/api/ai/generate/stream', {
      prompt,
      projectId,
      pageId: homePageId,
      styleguideId,
    });
    timing('ai-generate', t0, `${events.length} SSE events`);

    // ── Analyze SSE Events ──
    console.log('\n## Step 5: SSE Event Analysis');

    const statusEvents = events.filter(e => e.type === 'status');
    const planEvent = events.find(e => e.type === 'plan');
    const componentStreams = events.filter(e => e.type === 'component_stream');
    const doneEvent = events.find(e => e.type === 'done');
    const errorEvents = events.filter(e => e.type === 'error');

    console.log('\n### Event Timeline:');
    for (const e of statusEvents) {
      console.log(`  [status] ${e.step}: ${e.label}`);
    }
    if (planEvent) {
      const plan = planEvent.plan as Array<{ type: string; skeletonId: string }>;
      console.log(`  [plan] ${plan.length} components planned:`);
      for (const p of plan) {
        console.log(`    - ${p.type} (skel: ${p.skeletonId.slice(0, 12)}...)`);
      }
    }
    for (const e of componentStreams) {
      const c = e.component as { type: string; props: Record<string, unknown> };
      const skel = (e.replacesSkelId as string) || '';
      console.log(`  [component_stream] ${c.type} (replaces: ${skel.slice(0, 12)}...)`);
    }
    if (doneEvent) {
      console.log(`  [done] action=${(doneEvent.result as Record<string, unknown>)?.action}`);
    }
    for (const e of errorEvents) {
      console.log(`  [error] ${e.message}`);
    }

    // ── Quality Analysis ──
    console.log('\n## Step 6: Quality Analysis');

    if (!finalResult) {
      console.error('  ERROR: No final result from AI generation!');
      process.exit(1);
    }

    const result = finalResult as {
      action: string;
      components: Array<{ type: string; props: Record<string, unknown> }>;
      message: string;
    };

    const comps = result.components || [];
    console.log(`  Total components: ${comps.length}`);
    console.log(`  Types: ${comps.map(c => c.type).join(' → ')}`);

    // Skeleton mapping check
    if (planEvent) {
      const plan = (planEvent as { plan: Array<{ type: string; skeletonId: string }> }).plan;
      const skelToType = new Map(plan.map(p => [p.skeletonId, p.type]));
      let allCorrect = true;
      console.log('\n  Skeleton Replacement Check:');
      for (const cs of componentStreams) {
        const ctype = (cs.component as { type: string }).type;
        const skel = (cs.replacesSkelId as string) || '';
        const expected = skelToType.get(skel) || '?';
        const ok = ctype === expected;
        if (!ok) allCorrect = false;
        console.log(`    ${ctype}:25s → expected ${expected} ${ok ? '✅' : '❌ MISMATCH'}`);
      }
      console.log(`  All skeleton replacements correct: ${allCorrect ? '✅' : '❌'}`);
    }

    // Animation check
    const withAnimation = comps.filter(c => 'animation' in c.props);
    console.log(`\n  Animation props: ${withAnimation.length}/${comps.length}`);
    for (const c of withAnimation) {
      console.log(`    ${c.type}: animation=${c.props.animation}`);
    }

    // Variant check
    const withVariant = comps.filter(c => c.props.variant);
    console.log(`  Variant props: ${withVariant.length}/${comps.length}`);
    for (const c of withVariant) {
      console.log(`    ${c.type}: variant=${c.props.variant}`);
    }

    // Hover effect check
    const withHover = comps.filter(c => c.props.hoverEffect);
    console.log(`  Hover effects: ${withHover.length}/${comps.length}`);
    for (const c of withHover) {
      console.log(`    ${c.type}: hoverEffect=${c.props.hoverEffect}`);
    }

    // Stock images check
    const withImages = comps.filter(c => c.props.backgroundUrl || c.props.image);
    console.log(`  Background images: ${withImages.length}/${comps.length}`);
    for (const c of withImages) {
      console.log(`    ${c.type}: ${(c.props.backgroundUrl || c.props.image) as string}`);
    }

    // Gradient check
    const withGradient = comps.filter(c => c.props.gradientFrom || c.props.gradientTo);
    console.log(`  Gradient props: ${withGradient.length}/${comps.length}`);
    for (const c of withGradient) {
      console.log(`    ${c.type}: from=${c.props.gradientFrom} to=${c.props.gradientTo}`);
    }

    // Vietnamese content check
    const viMarkers = ['đ', 'ệ', 'ả', 'ạ', 'ù', 'ế', 'ề', 'ũ', 'ỷ', 'ă', 'â', 'ô', 'ơ', 'ư'];
    const viHeadings = comps.filter(c => {
      const h = (c.props.heading || c.props.logo || '') as string;
      return viMarkers.some(m => h.includes(m));
    });
    console.log(`  Vietnamese headings: ${viHeadings.length}/${comps.length}`);

    // Styleguide color usage
    const styleguideColors = (settings.styleguide.colors as Record<string, string>) || {};
    const usedColors = new Set<string>();
    for (const c of comps) {
      for (const key of ['gradientFrom', 'gradientTo', 'bgColor', 'borderColor']) {
        const val = c.props[key] as string | undefined;
        if (val && val.startsWith('#')) usedColors.add(val.toUpperCase());
      }
    }
    const paletteColors = new Set(Object.values(styleguideColors).filter(v => typeof v === 'string' && v.startsWith('#')).map(v => v.toUpperCase()));
    console.log(`\n  Styleguide palette: ${[...paletteColors].join(', ')}`);
    console.log(`  Colors used by AI: ${usedColors.size > 0 ? [...usedColors].join(', ') : 'none'}`);

    // ── STEP 4d: Save Page ──
    console.log('\n## Step 7: Save Page');
    t0 = Date.now();
    await apiFetch(`/api/projects/${projectId}/pages/${homePageId}`, {
      treeData: {
        root: { props: { title: 'Home' } },
        content: comps,
      },
    }, 'PUT');
    timing('save-page', t0, `${comps.length} components saved`);

    // ── Final Summary ──
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`  Project: ${testInfo.name} (${projectId})`);
    console.log(`  Page: Home (${homePageId})`);
    console.log(`  Styleguide: ${styleguideId}`);
    console.log(`  Components generated: ${comps.length}`);
    console.log(`  Errors: ${errorEvents.length}`);
    console.log(`  Animation: ${withAnimation.length}/${comps.length}`);
    console.log(`  Gradients: ${withGradient.length}/${comps.length}`);
    console.log(`  Vietnamese: ${viHeadings.length}/${comps.length}`);
    console.log(`  Stock images: ${withImages.length}/${comps.length}`);
    console.log('\nTiming:');
    for (const r of results) {
      console.log(`  ${r.step}: ${r.durationMs}ms — ${r.details}`);
    }
    console.log(`  TOTAL: ${results.reduce((s, r) => s + r.durationMs, 0)}ms`);
    console.log('\n✅ E2E test PASSED');

  } catch (err) {
    console.error('\n❌ E2E test FAILED:', err);
    process.exit(1);
  }
}

main();
