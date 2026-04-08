/**
 * Full Pipeline E2E Test — Wizard + Builder AI + Full Mode
 *
 * Tests the complete AI pipeline from wizard to builder editing:
 *   Phase 1: Wizard (chat → settings → finalize → homepage)
 *   Phase 2: Builder AI (add section, modify section, clarify)
 *   Phase 3: Full AI mode (non-create_page intent)
 *
 * Usage: npx tsx scripts/e2e-full-pipeline.ts [--base-url http://localhost:3000]
 */

const BASE_URL = process.argv.find((a) => a === '--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3000';

// ─── Gemini pricing (per 1M tokens) ───────────────────────────────────────────
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-3-flash-preview': { input: 0.15, output: 0.60 },
  'gemini-2.5-flash-preview-05-20': { input: 0.15, output: 0.60 },
  'gemini-3.1-flash-lite-preview': { input: 0.10, output: 0.40 },
  'qwen3.5': { input: 0, output: 0 },
};

interface TimingResult {
  phase: string;
  step: string;
  durationMs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  details: string;
}

const results: TimingResult[] = [];
let totalCost = 0;

function estimateTokens(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length;
  const latin = text.length - cjk;
  return Math.ceil(latin / 4 + cjk / 2);
}

function calcCost(tokensIn: number, tokensOut: number, model: string = 'gemini-3.1-flash-lite-preview'): number {
  const p = PRICING[model] ?? { input: 0.10, output: 0.40 };
  return (tokensIn / 1_000_000) * p.input + (tokensOut / 1_000_000) * p.output;
}

function log(t: TimingResult) {
  results.push(t);
  totalCost += t.costUsd;
  const cost = t.costUsd > 0 ? `$${t.costUsd.toFixed(6)}` : '$0';
  console.log(`  [${t.phase}] ${t.step}: ${t.durationMs}ms | ~${t.tokensIn}/${t.tokensOut} tok | ${cost} | ${t.details}`);
}

async function measure<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

async function readSSE(url: string, body: Record<string, unknown>): Promise<{
  events: Record<string, unknown>[];
  durationMs: number;
  rawText: string;
}> {
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SSE failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const rawText = await res.text();
  const durationMs = Math.round(performance.now() - start);
  const events: Record<string, unknown>[] = [];
  for (const line of rawText.split('\n')) {
    if (line.startsWith('data: ')) {
      try { events.push(JSON.parse(line.slice(6))); } catch { /* skip */ }
    }
  }
  return { events, durationMs, rawText };
}

async function postJSON<T>(url: string, body: Record<string, unknown>): Promise<{ data: T; durationMs: number }> {
  const { result, durationMs } = await measure(() =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  );
  return { data: result.data as T, durationMs };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: WIZARD FLOW
// ═══════════════════════════════════════════════════════════════════════════════

async function phase1Wizard() {
  console.log('\n═══ Phase 1: Wizard Flow ═══');

  // Step 1: Chat (3 turns)
  const messages: Array<{ role: string; content: string }> = [];
  let collectedInfo: Record<string, unknown> = {};

  const turns = [
    'I want to build a website for my fitness coaching business called "FitForge"',
    'Bold, energetic style with dark theme and neon accents',
    'Target audience: busy professionals 25-45 looking for quick effective workouts',
  ];

  for (let i = 0; i < turns.length; i++) {
    messages.push({ role: 'user', content: turns[i] });
    const { events, durationMs } = await readSSE(`${BASE_URL}/api/ai/wizard/chat`, {
      userMessage: turns[i],
      messages: messages.slice(0, -1),
      collectedSoFar: collectedInfo,
    });
    const doneEvent = events.find((e) => e.type === 'done');
    const extracted = doneEvent?.extractedInfo as { reply?: string; collectedInfo?: Record<string, unknown> } | undefined;
    if (extracted?.collectedInfo) collectedInfo = { ...collectedInfo, ...extracted.collectedInfo };
    const reply = extracted?.reply || '';
    messages.push({ role: 'assistant', content: reply });

    const tokensIn = estimateTokens('system ~3KB' + messages.map((m) => m.content).join(' '));
    const tokensOut = estimateTokens(reply + JSON.stringify(collectedInfo));
    log({
      phase: 'Wizard', step: `Chat turn ${i + 1}`, durationMs, tokensIn, tokensOut,
      costUsd: calcCost(tokensIn, tokensOut),
      details: reply.slice(0, 60) + '...',
    });
  }

  // Step 2: Generate Settings
  const projectInfo = {
    name: collectedInfo.name || 'FitForge',
    idea: collectedInfo.idea || 'Fitness coaching',
    style: collectedInfo.style || 'Bold, energetic, dark theme',
    targetAudience: collectedInfo.targetAudience || 'Busy professionals 25-45',
    tone: collectedInfo.tone || 'Motivational',
    language: collectedInfo.language || 'en',
  };

  const { data: settings, durationMs: settingsMs } = await postJSON<Record<string, unknown>>(
    `${BASE_URL}/api/ai/wizard/generate-settings`,
    { projectInfo },
  );
  const seoTokens = estimateTokens(JSON.stringify(projectInfo) + JSON.stringify(settings?.seo));
  log({
    phase: 'Wizard', step: 'Generate Settings', durationMs: settingsMs,
    tokensIn: Math.round(seoTokens * 0.3), tokensOut: Math.round(seoTokens * 0.7),
    costUsd: calcCost(Math.round(seoTokens * 0.3), Math.round(seoTokens * 0.7)),
    details: 'styleguide=deterministic, seo=LLM',
  });

  // Step 3: Finalize
  const { data: finalizeData, durationMs: finalizeMs } = await postJSON<{
    projectId: string; homePageId: string; styleguideId: string;
  }>(`${BASE_URL}/api/ai/wizard/finalize`, { projectInfo, settings });
  log({
    phase: 'Wizard', step: 'Finalize', durationMs: finalizeMs, tokensIn: 0, tokensOut: 0,
    costUsd: 0, details: `projectId: ${finalizeData.projectId?.slice(0, 8)}...`,
  });

  // Step 4: Generate Homepage
  const homepagePrompt = `Create a complete homepage for "${projectInfo.name}".
Business: ${projectInfo.idea}
Target audience: ${projectInfo.targetAudience}
Visual style: ${projectInfo.style}
Tone: ${projectInfo.tone}

Generate a professional landing page with all essential sections including header, hero, features, and footer.`;

  const { events: genEvents, durationMs: genMs, rawText: genRaw } = await readSSE(
    `${BASE_URL}/api/ai/generate/stream`,
    {
      prompt: homepagePrompt,
      projectId: finalizeData.projectId,
      pageId: finalizeData.homePageId,
      styleguideId: finalizeData.styleguideId,
    },
  );

  const doneGen = genEvents.find((e) => e.type === 'done');
  const genResult = doneGen?.result as { components?: unknown[]; message?: string } | undefined;
  const compCount = genResult?.components?.length ?? 0;
  const tokensIn = estimateTokens(homepagePrompt + 'template_prompt ~10KB');
  const tokensOut = estimateTokens(genRaw);

  log({
    phase: 'Wizard', step: 'Homepage Generation', durationMs: genMs, tokensIn, tokensOut,
    costUsd: calcCost(tokensIn, tokensOut),
    details: `${compCount} components: ${(genResult?.components as Array<{ type: string }>)?.map((c) => c.type).join(', ')}`,
  });

  return {
    projectInfo,
    settings,
    ids: finalizeData,
    componentCount: compCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: BUILDER AI — Edit existing page
// ═══════════════════════════════════════════════════════════════════════════════

async function phase2Builder(ids: { projectId: string; homePageId: string; styleguideId: string }) {
  console.log('\n═══ Phase 2: Builder AI (edit page) ═══');

  // Test 2a: Add a new section (create_page intent → template mode)
  const addPrompt = 'Add a pricing section with 3 tiers: Basic $29/mo, Pro $59/mo, Elite $99/mo';
  const { events: addEvents, durationMs: addMs, rawText: addRaw } = await readSSE(
    `${BASE_URL}/api/ai/generate/stream`,
    { prompt: addPrompt, projectId: ids.projectId, pageId: ids.homePageId, styleguideId: ids.styleguideId },
  );
  const addDone = addEvents.find((e) => e.type === 'done');
  const addResult = addDone?.result as { components?: unknown[]; action?: string } | undefined;
  log({
    phase: 'Builder', step: 'Add Pricing Section', durationMs: addMs,
    tokensIn: estimateTokens(addPrompt + 'template_prompt ~10KB'),
    tokensOut: estimateTokens(addRaw),
    costUsd: calcCost(estimateTokens(addPrompt + 'template_prompt ~10KB'), estimateTokens(addRaw)),
    details: `action: ${addResult?.action}, components: ${(addResult?.components as Array<{ type: string }>)?.map((c) => c.type).join(', ')}`,
  });

  // Test 2b: Modify existing content (non-create_page → full AI mode)
  const modifyPrompt = 'Change the hero section heading to "Transform Your Body in 30 Days" and make the CTA button say "Start Free Trial"';
  const { events: modEvents, durationMs: modMs, rawText: modRaw } = await readSSE(
    `${BASE_URL}/api/ai/generate/stream`,
    { prompt: modifyPrompt, projectId: ids.projectId, pageId: ids.homePageId, styleguideId: ids.styleguideId },
  );
  const modDone = modEvents.find((e) => e.type === 'done');
  const modResult = modDone?.result as { components?: unknown[]; action?: string; message?: string } | undefined;
  const modTokensIn = estimateTokens(modifyPrompt + 'full_system_prompt ~12KB');
  const modTokensOut = estimateTokens(modRaw);
  log({
    phase: 'Builder', step: 'Modify Hero Section', durationMs: modMs,
    tokensIn: modTokensIn, tokensOut: modTokensOut,
    costUsd: calcCost(modTokensIn, modTokensOut, 'gemini-3-flash-preview'),
    details: `action: ${modResult?.action}, msg: ${(modResult?.message as string)?.slice(0, 60)}`,
  });

  // Test 2c: Clarification request (ambiguous prompt → clarify action)
  const clarifyPrompt = 'Make it look better';
  const { events: clarifyEvents, durationMs: clarifyMs, rawText: clarifyRaw } = await readSSE(
    `${BASE_URL}/api/ai/generate/stream`,
    { prompt: clarifyPrompt, projectId: ids.projectId, pageId: ids.homePageId, styleguideId: ids.styleguideId },
  );
  const clarifyDone = clarifyEvents.find((e) => e.type === 'done');
  const clarifyResult = clarifyDone?.result as { action?: string; message?: string } | undefined;
  log({
    phase: 'Builder', step: 'Ambiguous Request', durationMs: clarifyMs,
    tokensIn: estimateTokens(clarifyPrompt + 'full_system_prompt ~12KB'),
    tokensOut: estimateTokens(clarifyRaw),
    costUsd: calcCost(estimateTokens(clarifyPrompt + 'full_system_prompt ~12KB'), estimateTokens(clarifyRaw), 'gemini-3-flash-preview'),
    details: `action: ${clarifyResult?.action}, msg: ${(clarifyResult?.message as string)?.slice(0, 80)}`,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3: NON-STREAMING GENERATE (full chain)
// ═══════════════════════════════════════════════════════════════════════════════

async function phase3FullChain(ids: { projectId: string; homePageId: string; styleguideId: string }) {
  console.log('\n═══ Phase 3: Full AI Chain (non-streaming) ═══');

  const prompt = 'Add a testimonials section with 3 customer reviews about weight loss results';
  const { result, durationMs } = await measure(() =>
    fetch(`${BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        projectId: ids.projectId,
        pageId: ids.homePageId,
        styleguideId: ids.styleguideId,
      }),
    }).then((r) => r.json()),
  );

  const data = result.data as { action?: string; components?: unknown[]; message?: string } | null;
  const compCount = data?.components?.length ?? 0;
  const tokensIn = estimateTokens(prompt + 'full_chain_prompt ~12KB');
  const tokensOut = estimateTokens(JSON.stringify(data));

  log({
    phase: 'FullChain', step: 'Non-streaming Generate', durationMs,
    tokensIn, tokensOut,
    costUsd: calcCost(tokensIn, tokensOut, 'gemini-3-flash-preview'),
    details: `action: ${data?.action}, ${compCount} components`,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Full AI Pipeline E2E Test                              ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Base URL: ${BASE_URL.padEnd(44)} ║`);
  console.log(`║  Time: ${new Date().toISOString().padEnd(45)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Health check
  try {
    const r = await fetch(`${BASE_URL}/api/ai/wizard/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    });
    if (r.status === 422) console.log('✓ Server running\n');
    else console.log(`⚠ Server status: ${r.status}\n`);
  } catch {
    console.error('✗ Server not running! npm run dev');
    process.exit(1);
  }

  const totalStart = performance.now();

  try {
    // Phase 1: Wizard
    const { ids, componentCount } = await phase1Wizard();

    // Phase 2: Builder AI
    await phase2Builder(ids);

    // Phase 3: Full chain
    await phase3FullChain(ids);

    const totalDuration = Math.round(performance.now() - totalStart);

    // ─── Summary ────────────────────────────────────────────────────────────────
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    for (const r of results) {
      totalTokensIn += r.tokensIn;
      totalTokensOut += r.tokensOut;
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Full Pipeline Summary                                  ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Total time: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`║  Total tokens: ~${totalTokensIn} in / ~${totalTokensOut} out`);
    console.log(`║  Total cost: $${totalCost.toFixed(6)}`);
    console.log('╠══════════════════════════════════════════════════════════╣');

    // Group by phase
    const phases = ['Wizard', 'Builder', 'FullChain'];
    for (const phase of phases) {
      const phaseResults = results.filter((r) => r.phase === phase);
      if (phaseResults.length === 0) continue;
      const phaseTime = phaseResults.reduce((s, r) => s + r.durationMs, 0);
      console.log(`║  ${phase} (${(phaseTime / 1000).toFixed(1)}s):`);
      for (const r of phaseResults) {
        const cost = r.costUsd > 0 ? `$${r.costUsd.toFixed(6)}` : '$0';
        console.log(`║    ${r.step.padEnd(25)} ${(r.durationMs + 'ms').padEnd(8)} ~${r.tokensIn}/${r.tokensOut}tok  ${cost}`);
      }
    }

    console.log('╚══════════════════════════════════════════════════════════╝');

    // Pipeline flow diagram
    console.log(`
  Full AI Pipeline Flow:
  ┌─────────────────────────────────────────────────────────────┐
  │  Phase 1: WIZARD                                            │
  │  Winnie Chat (3 turns) → Settings → Finalize → Homepage Gen │
  │  Model: Fast (lite)     │ 4 LLM calls │ ~$0.0004            │
  ├─────────────────────────────────────────────────────────────┤
  │  Phase 2: BUILDER AI                                        │
  │  Add section → Modify section → Ambiguous request           │
  │  Model: Fast (template) + Main (full) │ 3 LLM calls         │
  ├─────────────────────────────────────────────────────────────┤
  │  Phase 3: FULL CHAIN (non-streaming)                        │
  │  Single invoke → validate → response                        │
  │  Model: Main (full chain) │ 1 LLM call                      │
  ├─────────────────────────────────────────────────────────────┤
  │  Total: 8 LLM calls | ~$0.001 | ~20-60s                    │
  └─────────────────────────────────────────────────────────────┘
`);
  } catch (err) {
    console.error('\n✗ Test failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
