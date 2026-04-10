/**
 * E2E Token Measurement Script for Polish Pipeline Optimization
 *
 * Compares token costs before vs after optimization in makeup/polish mode.
 * Run: npx tsx scripts/measure-polish-tokens.ts
 */

import { buildBatchSectionPrompt, buildSectionPrompt } from '../src/lib/ai/prompts/section-prompt';
import {
  buildSystemLevelDesignRules,
  buildPolishRules,
  buildUnifiedDesignTokensBlock,
} from '../src/lib/ai/prompts/prompt-utils';
import { resolveDesignGuidance } from '../src/lib/ai/knowledge/design-knowledge';
import type { MinimalStyleguideTokens } from '../src/lib/ai/prompts/prompt-utils';

// ─── Rough token estimator (1 token ≈ 3.5-4 chars for mixed EN/code) ───
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.8);
}

// ─── Pricing per 1M tokens (as of 2026-04) ───
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash':   { input: 0.075,  output: 0.30 },
  'gemini-2.5-pro':     { input: 1.25,   output: 5.00 },
  'gpt-4o-mini':        { input: 0.15,   output: 0.60 },
  'gpt-4o':             { input: 2.50,   output: 10.00 },
  'claude-sonnet-4-6':  { input: 3.00,   output: 15.00 },
  'claude-haiku-4-5':   { input: 0.80,   output: 4.00 },
};

// ─── Simulate a typical 7-section restaurant landing page ───

const TYPICAL_SECTIONS = [
  { type: 'HeaderNav', props: { logo: 'Trattoria Bella', links: [] } },
  { type: 'HeroSection', props: { heading: '', subtext: '' } },
  { type: 'FeaturesGrid', props: { heading: '', features: [] } },
  { type: 'TestimonialSection', props: { heading: '', testimonials: [] } },
  { type: 'Gallery', props: { heading: '', images: [] } },
  { type: 'CTASection', props: { heading: '', subtext: '', ctaText: '' } },
  { type: 'FooterSection', props: { logo: '', linkGroups: [] } },
];

const BUSINESS_TYPE = 'restaurant/dining';
const BUSINESS_NAME = 'Trattoria Bella';

// ─── Build context objects ───

const designGuidance = resolveDesignGuidance(BUSINESS_TYPE);

const styleguideData: MinimalStyleguideTokens = {
  colors: JSON.stringify({
    primary: '#22746e',
    secondary: '#45a29e',
    accent: '#e39c37',
    background: '#fafaf8',
    surface: '#f5f5f0',
    text: '#1a1a2e',
    textMuted: '#64748b',
    border: '#e2e8f0',
  }),
  typography: JSON.stringify({
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
  }),
};

// ─── Measurement ───

async function measure() {
  console.log('='.repeat(70));
  console.log('POLISH PIPELINE — Token Cost E2E Measurement');
  console.log('='.repeat(70));
  console.log(`Scenario: ${TYPICAL_SECTIONS.length} sections, ${BUSINESS_TYPE}`);
  console.log();

  // ── 1. Individual block sizes ──
  console.log('── Block-Level Analysis ──');
  console.log();

  const fullSystemRules = buildSystemLevelDesignRules();
  const polishRules = buildPolishRules();
  const designTokens = buildUnifiedDesignTokensBlock(designGuidance, styleguideData);

  console.log(`buildSystemLevelDesignRules(): ${estimateTokens(fullSystemRules)} tokens (${fullSystemRules.length} chars)`);
  console.log(`buildPolishRules():             ${estimateTokens(polishRules)} tokens (${polishRules.length} chars)`);
  console.log(`buildUnifiedDesignTokensBlock():${estimateTokens(designTokens)} tokens (${designTokens.length} chars)`);
  console.log(`  → Savings if skipped:         ${estimateTokens(designTokens)} tokens`);
  console.log();

  // ── 2. Full prompt comparison ──
  console.log('── Full Prompt Comparison ──');
  console.log();

  // BEFORE: Full system rules + design tokens (simulating old behavior)
  const beforeBatchPrompt = buildBatchSectionPrompt(TYPICAL_SECTIONS, {
    userPrompt: `Create a landing page for ${BUSINESS_NAME}, an Italian restaurant`,
    businessType: BUSINESS_TYPE,
    businessName: BUSINESS_NAME,
    designGuidance: designGuidance ?? undefined,
    styleguideData,
    isMakeup: false, // Before optimization: no differentiation
  });

  // AFTER: Optimized polish mode (isMakeup=true)
  const afterBatchPrompt = buildBatchSectionPrompt(TYPICAL_SECTIONS, {
    userPrompt: `Create a landing page for ${BUSINESS_NAME}, an Italian restaurant`,
    businessType: BUSINESS_TYPE,
    businessName: BUSINESS_NAME,
    designGuidance: designGuidance ?? undefined,
    styleguideData,
    isMakeup: true, // After optimization: lightweight rules
  });

  // Format messages to get actual string sizes
  const beforeMessages = await beforeBatchPrompt.formatMessages({
    input: `Create a landing page for ${BUSINESS_NAME}, an Italian restaurant`,
  });
  const afterMessages = await afterBatchPrompt.formatMessages({
    input: `Create a landing page for ${BUSINESS_NAME}, an Italian restaurant`,
  });

  const beforeSystemMsg = beforeMessages[0].content as string;
  const afterSystemMsg = afterMessages[0].content as string;
  const humanMsg = (beforeMessages[1].content as string);

  const beforeSystemTokens = estimateTokens(beforeSystemMsg);
  const afterSystemTokens = estimateTokens(afterSystemMsg);
  const humanTokens = estimateTokens(humanMsg);

  // Estimate output: ~230 tokens per section (typical JSON output)
  const outputTokens = TYPICAL_SECTIONS.length * 230;

  console.log(`BEFORE (full system rules + design tokens):`);
  console.log(`  System message: ${beforeSystemTokens} tokens`);
  console.log(`  Human message:  ${humanTokens} tokens`);
  console.log(`  Input total:    ${beforeSystemTokens + humanTokens} tokens`);
  console.log(`  Output (est):   ${outputTokens} tokens`);
  console.log();
  console.log(`AFTER (polish rules, no design tokens):`);
  console.log(`  System message: ${afterSystemTokens} tokens`);
  console.log(`  Human message:  ${humanTokens} tokens`);
  console.log(`  Input total:    ${afterSystemTokens + humanTokens} tokens`);
  console.log(`  Output (est):   ${outputTokens} tokens`);
  console.log();

  const inputSavings = (beforeSystemTokens + humanTokens) - (afterSystemTokens + humanTokens);
  const totalBefore = beforeSystemTokens + humanTokens + outputTokens;
  const totalAfter = afterSystemTokens + humanTokens + outputTokens;
  const pctSavings = ((inputSavings) / (beforeSystemTokens + humanTokens) * 100);

  console.log(`── Savings ──`);
  console.log(`  Input tokens saved: ${inputSavings} (${pctSavings.toFixed(0)}%)`);
  console.log(`  Total tokens:       ${totalBefore} → ${totalAfter} (${((totalBefore - totalAfter) / totalBefore * 100).toFixed(0)}% reduction)`);
  console.log();

  // ── 3. Cost per provider ──
  console.log('── Cost Per Polish Request (by provider) ──');
  console.log();

  const col = 18;
  console.log(`${'Provider'.padEnd(col)} ${'Before'.padStart(12)} ${'After'.padStart(12)} ${'Saved'.padStart(12)} ${'%/100req'.padStart(12)}`);
  console.log('-'.repeat(66));

  for (const [provider, pricing] of Object.entries(PRICING)) {
    const costBefore = (totalBefore / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
    const costAfter = (totalAfter / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
    const saved = costBefore - costAfter;
    const per100 = saved * 100;
    console.log(`${provider.padEnd(col)} $${costBefore.toFixed(5).padStart(10)} $${costAfter.toFixed(5).padStart(10)} $${saved.toFixed(5).padStart(10)} $${per100.toFixed(3).padStart(10)}`);
  }

  console.log();
  console.log('── Scalability (Gemini 2.5 Flash at 1000 polish requests/day) ──');
  const flashPricing = PRICING['gemini-2.5-flash'];
  const dailyBefore = (totalBefore / 1_000_000) * flashPricing.input * 1000 + (outputTokens / 1_000_000) * flashPricing.output * 1000;
  const dailyAfter = (totalAfter / 1_000_000) * flashPricing.input * 1000 + (outputTokens / 1_000_000) * flashPricing.output * 1000;
  console.log(`  Before: $${dailyBefore.toFixed(2)}/day ($${(dailyBefore * 30).toFixed(2)}/month)`);
  console.log(`  After:  $${dailyAfter.toFixed(2)}/day ($${(dailyAfter * 30).toFixed(2)}/month)`);
  console.log(`  Savings: $${((dailyBefore - dailyAfter) * 30).toFixed(2)}/month`);
  console.log();
  console.log('='.repeat(70));
}

measure().catch(console.error);
