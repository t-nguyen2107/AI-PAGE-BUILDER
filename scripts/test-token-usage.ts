/**
 * Quick e2e token usage test for Gemini Flash models.
 *
 * Usage: npx tsx scripts/test-token-usage.ts
 *
 * Tests both AI_MODEL (main) and AI_FAST_MODEL (fast) with a realistic prompt,
 * reports token usage and latency.
 */
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load .env.local (Next.js convention) — dotenv only loads .env by default
dotenvConfig({ path: resolve(process.cwd(), ".env.local") });

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { resolveConfig, resolveFastConfig } from "../src/lib/ai/config";

const TEST_PROMPT = `Create a professional landing page for "LoomWeave" — an AI website builder.

Business: AI-powered website builder with visual editor
Target audience: Small business owners, freelancers, startups
Visual style: Modern, clean, teal accent
Tone: Professional but friendly

Generate a HeroSection and FeaturesGrid.`;

async function testModel(
  label: string,
  model: string,
  apiKey?: string,
) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${label}`);
  console.log(`Model: ${model}`);
  console.log(`${"=".repeat(60)}`);

  if (!apiKey) {
    console.error("SKIP: No API key provided");
    return;
  }

  const chat = new ChatGoogleGenerativeAI({
    model,
    apiKey,
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an AI website builder. Respond with valid JSON only. Create Puck component data."],
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(chat);

  const start = performance.now();

  try {
    const response = await chain.invoke({ input: TEST_PROMPT });
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);

    // Extract token usage — try both LangChain standard and Google native formats
    const usageMeta = response.usage_metadata as Record<string, number> | undefined;
    const meta = response.response_metadata as Record<string, unknown> | undefined;
    const googleUsage = (meta?.usageMetadata ?? meta?.usage) as Record<string, number> | undefined;

    const inputTokens = usageMeta?.input_tokens ?? googleUsage?.promptTokenCount ?? 0;
    const outputTokens = usageMeta?.output_tokens ?? googleUsage?.candidatesTokenCount ?? googleUsage?.completionTokenCount ?? 0;
    const totalTokens = usageMeta?.total_tokens ?? googleUsage?.totalTokenCount ?? 0;

    // Debug: show metadata structure
    if (!inputTokens && !outputTokens) {
      console.log(`DEBUG usage_metadata: ${JSON.stringify(usageMeta)}`);
      console.log(`DEBUG response_metadata keys: ${meta ? Object.keys(meta).join(", ") : "none"}`);
    }

    const outputText = typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content.map((c: unknown) => typeof c === "object" && c !== null && "text" in (c as Record<string, unknown>) ? (c as { text: string }).text : "").join("")
        : String(response.content);

    console.log(`\n--- Results ---`);
    console.log(`Latency: ${elapsed}s`);
    console.log(`Input tokens:  ${inputTokens || "N/A"}`);
    console.log(`Output tokens: ${outputTokens || "N/A"}`);
    console.log(`Total tokens:  ${totalTokens || "N/A"}`);
    console.log(`Output length: ${outputText.length} chars`);
    console.log(`Output preview: ${outputText.slice(0, 200)}...`);

    // Estimate cost (Gemini Flash pricing)
    const inputCost = (inputTokens / 1_000_000) * 0.15;   // $0.15/1M input
    const outputCost = (outputTokens / 1_000_000) * 0.60;  // $0.60/1M output
    console.log(`Estimated cost: $${(inputCost + outputCost).toFixed(6)}`);
  } catch (err) {
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    console.error(`ERROR after ${elapsed}s:`, err instanceof Error ? err.message : err);
  }
}

async function main() {
  const config = resolveConfig();
  const fastConfig = resolveFastConfig();

  console.log("LoomWeave — Gemini Token Usage Test");
  console.log(`Provider: ${config.provider}`);

  // Test main model (full generation)
  await testModel(
    "Main Model (full generation)",
    config.model,
    config.apiKey,
  );

  // Test fast model (template mode)
  await testModel(
    "Fast Model (template mode)",
    fastConfig.model,
    fastConfig.apiKey,
  );

  console.log(`\n${"=".repeat(60)}`);
  console.log("Done!");
}

main().catch(console.error);
