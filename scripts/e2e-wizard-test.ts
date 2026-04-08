/**
 * E2E Wizard Flow Test — measures timing + token cost for the full AI pipeline.
 *
 * Usage:
 *   npx tsx scripts/e2e-wizard-test.ts [--base-url http://localhost:3000]
 *
 * Prerequisites:
 *   - Dev server running (npm run dev)
 *   - .env.local with valid AI_API_KEY
 *   - Database accessible
 */

const BASE_URL = process.argv.find((a) => a === '--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3000';

// ─── Gemini pricing (per 1M tokens) ───────────────────────────────────────────
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-3-flash-preview': { input: 0.15, output: 0.60 },
  'gemini-2.5-flash-preview-05-20': { input: 0.15, output: 0.60 },
  'gemini-3.1-flash-lite-preview': { input: 0.10, output: 0.40 },
  'gemini-2.0-flash-lite': { input: 0.075, output: 0.30 },
  'qwen3.5': { input: 0, output: 0 }, // local ollama = free
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TimingResult {
  step: string;
  durationMs: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  details?: string;
}

const results: TimingResult[] = [];
let totalCost = 0;

function estimateTokens(text: string): number {
  // Rough: 1 token ≈ 4 chars for English, ~2 chars for CJK
  const cjk = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length;
  const latin = text.length - cjk;
  return Math.ceil(latin / 4 + cjk / 2);
}

function calcCost(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model] ?? { input: 0.10, output: 0.40 };
  return (tokensIn / 1_000_000) * p.input + (tokensOut / 1_000_000) * p.output;
}

function logTiming(t: TimingResult) {
  results.push(t);
  totalCost += t.costUsd ?? 0;
  const parts = [
    `  ${t.step}: ${t.durationMs}ms`,
    t.tokensIn ? `tokens: ~${t.tokensIn}in/~${t.tokensOut}out` : '',
    t.costUsd ? `$${t.costUsd.toFixed(6)}` : '',
    t.details ? `(${t.details})` : '',
  ].filter(Boolean).join(' | ');
  console.log(parts);
}

async function measure<T>(_step: string, fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

// ─── SSE reader ───────────────────────────────────────────────────────────────

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
    throw new Error(`SSE request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const events: Record<string, unknown>[] = [];
  const rawText = await res.text();
  const durationMs = Math.round(performance.now() - start);

  for (const line of rawText.split('\n')) {
    if (line.startsWith('data: ')) {
      try {
        events.push(JSON.parse(line.slice(6)));
      } catch { /* skip */ }
    }
  }

  return { events, durationMs, rawText };
}

// ─── Test: Wizard Chat ────────────────────────────────────────────────────────

async function testWizardChat() {
  console.log('\n═══ Step 1: Wizard Chat (3 turns) ═══');

  const messages: Array<{ role: string; content: string }> = [];
  let collectedInfo: Record<string, unknown> = {};

  const turns = [
    'Tôi muốn tạo website cho tiệm bánh ngọt tên "Sweet Dreams Bakery"',
    'Phong cách ấm cúng, màu hồng pastel và nâu',
    'Khách hàng mục tiêu là giới trẻ 18-35, thích bánh ngọt cao cấp',
  ];

  for (let i = 0; i < turns.length; i++) {
    const userMsg = turns[i];
    messages.push({ role: 'user', content: userMsg });

    const { events, durationMs } = await readSSE(`${BASE_URL}/api/ai/wizard/chat`, {
      userMessage: userMsg,
      messages: messages.slice(0, -1), // history = everything before this message
      collectedSoFar: collectedInfo,
    });

    // Find the done event
    const doneEvent = events.find((e) => e.type === 'done');
    const extracted = doneEvent?.extractedInfo as { reply?: string; collectedInfo?: Record<string, unknown>; isComplete?: boolean } | undefined;

    if (extracted?.collectedInfo) {
      collectedInfo = { ...collectedInfo, ...extracted.collectedInfo };
    }

    const reply = (extracted?.reply as string) || '';
    messages.push({ role: 'assistant', content: reply });

    const tokensIn = estimateTokens(
      // system prompt (~3KB) + messages + user message
      'Winnie system prompt ~3KB' + messages.map((m) => m.content).join(' ') + userMsg,
    );
    const tokensOut = estimateTokens(reply + JSON.stringify(collectedInfo));

    logTiming({
      step: `Chat turn ${i + 1}`,
      durationMs,
      tokensIn,
      tokensOut,
      costUsd: calcCost('gemini-3.1-flash-lite-preview', tokensIn, tokensOut),
      details: `reply: ${reply.slice(0, 60)}...`,
    });
  }

  return collectedInfo;
}

// ─── Test: Generate Settings ──────────────────────────────────────────────────

async function testGenerateSettings(collectedInfo: Record<string, unknown>) {
  console.log('\n═══ Step 2: Generate Settings ═══');

  const projectInfo = {
    name: (collectedInfo.name as string) || 'Sweet Dreams Bakery',
    idea: (collectedInfo.idea as string) || 'Tiệm bánh ngọt cao cấp',
    style: (collectedInfo.style as string) || 'Ấm cúng, hồng pastel và nâu',
    targetAudience: (collectedInfo.targetAudience as string) || 'Giới trẻ 18-35',
    tone: (collectedInfo.tone as string) || 'Friendly và warm',
    language: (collectedInfo.language as string) || 'vi',
  };

  const { result, durationMs } = await measure('settings', () =>
    fetch(`${BASE_URL}/api/ai/wizard/generate-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectInfo }),
    }).then((r) => r.json()),
  );

  const data = result.data;
  const styleguide = data?.styleguide;
  const seo = data?.seo;
  const general = data?.general;

  // Styleguide = deterministic (0 tokens), SEO = 1 LLM call (~1024 maxTokens)
  const seoTokensIn = estimateTokens(JSON.stringify(projectInfo) + 'SEO_PROMPT ~200 chars');
  const seoTokensOut = estimateTokens(JSON.stringify(seo));

  logTiming({
    step: 'Generate Settings',
    durationMs,
    tokensIn: seoTokensIn,
    tokensOut: seoTokensOut,
    costUsd: calcCost('gemini-3.1-flash-lite-preview', seoTokensIn, seoTokensOut),
    details: `styleguide: deterministic, seo: LLM`,
  });

  return { projectInfo, settings: { styleguide, seo, general } };
}

// ─── Test: Finalize ┐══════════════════════════════════════════════════════════

async function testFinalize(
  projectInfo: Record<string, unknown>,
  settings: Record<string, unknown>,
) {
  console.log('\n═══ Step 3: Finalize (create project) ═══');

  const { result, durationMs } = await measure('finalize', () =>
    fetch(`${BASE_URL}/api/ai/wizard/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectInfo, settings }),
    }).then((r) => r.json()),
  );

  const data = result.data;

  logTiming({
    step: 'Finalize',
    durationMs,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    details: `projectId: ${data?.projectId?.slice(0, 8)}..., pages: ${data?.pages?.length || 1}`,
  });

  return {
    projectId: data?.projectId as string,
    homePageId: data?.homePageId as string,
    styleguideId: data?.styleguideId as string,
  };
}

// ─── Test: Generate Homepage (streaming) ──────────────────────────────────────

async function testGenerateHomepage(
  projectInfo: Record<string, unknown>,
  ids: { projectId: string; homePageId: string; styleguideId: string },
) {
  console.log('\n═══ Step 4: Generate Homepage (streaming) ═══');

  const prompt = `Create a complete homepage for "${projectInfo.name}".
Business: ${projectInfo.idea}
Target audience: ${projectInfo.targetAudience}
Visual style: ${projectInfo.style}
Tone: ${projectInfo.tone}

Generate a professional landing page with all essential sections including header, hero, features, and footer.`;

  const { events, durationMs, rawText } = await readSSE(
    `${BASE_URL}/api/ai/generate/stream`,
    {
      prompt,
      projectId: ids.projectId,
      pageId: ids.homePageId,
      styleguideId: ids.styleguideId,
    },
  );

  const doneEvent = events.find((e) => e.type === 'done');
  const statusEvents = events.filter((e) => e.type === 'status');
  const componentEvents = events.filter((e) => e.type === 'component_stream');
  const errorEvent = events.find((e) => e.type === 'error');

  if (errorEvent) {
    console.log('  ERROR:', errorEvent.message);
  }

  const result = doneEvent?.result as { components?: unknown[]; message?: string } | undefined;
  const componentCount = result?.components?.length ?? 0;

  // Estimate tokens for the generation (template mode = fast model, ~16384 maxTokens)
  const tokensIn = estimateTokens(prompt + 'template_prompt ~10KB with component catalog');
  const tokensOut = estimateTokens(rawText);

  logTiming({
    step: 'Homepage Generation',
    durationMs,
    tokensIn,
    tokensOut,
    costUsd: calcCost('gemini-3.1-flash-lite-preview', tokensIn, tokensOut),
    details: `${componentCount} components, ${statusEvents.length} status events, ${componentEvents.length} component_stream events`,
  });

  // Print status timeline
  console.log('\n  Status timeline:');
  for (const s of statusEvents) {
    console.log(`    - ${(s.step as string)}: ${(s.label as string)}`);
  }

  // Print component list
  if (result?.components) {
    console.log('\n  Generated components:');
    for (const comp of result.components as Array<{ type: string; props?: Record<string, unknown> }>) {
      const heading = (comp.props?.heading as string) || (comp.props?.content as string) || '';
      console.log(`    - ${comp.type}${heading ? `: "${heading.slice(0, 50)}"` : ''}`);
    }
  }

  return { componentCount, durationMs };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  AI Pipeline E2E Test — Wizard Flow                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Base URL: ${BASE_URL.padEnd(44)} ║`);
  console.log(`║  Time: ${new Date().toISOString().padEnd(45)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Health check
  try {
    const health = await fetch(`${BASE_URL}/api/ai/wizard/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (health.status === 422) {
      console.log('✓ Server is running (got expected validation error)');
    } else {
      console.log(`⚠ Server responded with status ${health.status}`);
    }
  } catch {
    console.error('✗ Server is not running! Start with: npm run dev');
    process.exit(1);
  }

  const totalStart = performance.now();

  try {
    // Step 1: Wizard chat
    const collectedInfo = await testWizardChat();

    // Step 2: Generate settings
    const { projectInfo, settings } = await testGenerateSettings(collectedInfo);

    // Step 3: Finalize (create project in DB)
    const ids = await testFinalize(projectInfo, settings as Record<string, unknown>);

    // Step 4: Generate homepage via streaming
    await testGenerateHomepage(projectInfo, ids);

    const totalDuration = Math.round(performance.now() - totalStart);

    // ─── Summary ────────────────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Summary                                                 ║');
    console.log('╠══════════════════════════════════════════════════════════╣');

    let totalTokensIn = 0;
    let totalTokensOut = 0;
    for (const r of results) {
      totalTokensIn += r.tokensIn ?? 0;
      totalTokensOut += r.tokensOut ?? 0;
    }

    console.log(`║  Total time: ${(totalDuration / 1000).toFixed(1)}s${''.padEnd(42)}`);
    console.log(`║  Total tokens (est): ~${totalTokensIn} in / ~${totalTokensOut} out${''.padEnd(12)}`);
    console.log(`║  Total cost (est): $${totalCost.toFixed(6)}${''.padEnd(36)}`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  Breakdown:                                              ║');

    for (const r of results) {
      const cost = r.costUsd ? `$${r.costUsd.toFixed(6)}` : '$0';
      const tokens = r.tokensIn ? `~${r.tokensIn}/${r.tokensOut}tok` : '0 tok';
      const line = `${r.step.padEnd(25)} ${(r.durationMs + 'ms').padEnd(8)} ${tokens.padEnd(16)} ${cost}`;
      console.log(`║  ${line.padEnd(57)}║`);
    }

    console.log('╚══════════════════════════════════════════════════════════╝');

    // ─── Pipeline Architecture ──────────────────────────────────────────────────
    console.log('\n═══ AI Pipeline Architecture ═══');
    console.log(`
  Wizard Flow:
  ┌─────────────┐    SSE     ┌──────────────────┐
  │ WinnieChat   │──────────→│ /api/ai/wizard/   │  Fast model × 3 turns
  │ (3 turns)    │←──────────│ chat              │  ~1,500in/800out each
  └─────────────┘            └──────────────────┘
       │
       ▼
  ┌─────────────┐   REST     ┌──────────────────┐
  │ Settings     │──────────→│ /api/ai/wizard/   │  Styleguide = 0ms (deterministic)
  │ Step         │←──────────│ generate-settings │  SEO = fast model × 1
  └─────────────┘            └──────────────────┘
       │
       ▼
  ┌─────────────┐   REST     ┌──────────────────┐
  │ Finalize     │──────────→│ /api/ai/wizard/   │  Prisma transaction (0 LLM)
  │ Step         │←──────────│ finalize          │  + AI Profile upsert
  └─────────────┘            └──────────────────┘
       │
       ▼
  ┌─────────────┐   SSE      ┌──────────────────┐
  │ Homepage     │──────────→│ /api/ai/generate/ │  Template mode: fast model
  │ Generation   │←──────────│ stream            │  ~5,000in/6,000out
  └─────────────┘            └──────────────────┘  (or Two-Pass: plan + parallel sections)

  Cache Layer:
  ┌─ AIConfigCache (5min) ──── avoid re-reading env vars
  ├─ EmbeddingLRUCache (60min, 200 entries) ─── avoid re-embedding
  └─ ProfileCache (60s) ──── avoid repeated DB + vector queries

  Fallback Chain:
  Template mode → Full AI chain → Template generator → Error

  Supported Providers: Gemini, OpenAI, Anthropic, Ollama
  Current Provider: Gemini (gemini-3.1-flash-lite-preview for fast, gemini-3-flash-preview for main)
`);
  } catch (err) {
    console.error('\n✗ Test failed:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack.split('\n').slice(1, 5).join('\n'));
    }
    process.exit(1);
  }
}

main();
