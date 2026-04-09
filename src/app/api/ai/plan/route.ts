import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { optimizePrompt } from '@/lib/ai/prompts/prompt-optimizer';
import { buildTemplatePrompt } from '@/lib/ai/prompts/template-prompt';
import { createFastModelBundle } from '@/lib/ai/provider';
import { extractJSON } from '@/lib/ai/streaming';
import { validateTemplateResponse } from '@/lib/ai/prompts/template-schema';
import { generateId } from '@/lib/id';
import { getProjectProfileText } from '@/lib/ai/memory-manager';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s is enough for fast model plan

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, projectId, pageId, styleguideId } = body as {
      prompt: string;
      projectId: string;
      pageId: string;
      styleguideId?: string;
    };

    if (!prompt || !projectId || !pageId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 422 }
      );
    }

    // 1. Load context
    let styleguideData: { colors?: string; typography?: string; spacing?: string; cssVariables?: string } | undefined;
    
    const [sgResult, profileResult] = await Promise.allSettled([
      styleguideId ? prisma.styleguide.findUnique({ where: { id: styleguideId } }) : Promise.resolve(null),
      getProjectProfileText(projectId, prompt),
    ]);

    if (sgResult.status === 'fulfilled' && sgResult.value) {
      styleguideData = {
        colors: sgResult.value.colors,
        typography: sgResult.value.typography,
        spacing: sgResult.value.spacing,
        cssVariables: sgResult.value.cssVariables,
      };
    }

    const projectProfile = profileResult.status === 'fulfilled' && profileResult.value ? profileResult.value : '';

    // 2. Optimize prompt to get businessType and designContext
    
    // Inject project profile into prompt if available
    const enrichedInput = projectProfile ? `[Project Profile Context]:\n${projectProfile}\n\n[User Request]:\n${prompt}` : prompt;
    const optimized = optimizePrompt(enrichedInput);

    // 3. Generate Plan
    const { model: planModel, jsonCallOptions: planOpts } = createFastModelBundle({ maxTokens: 4096 });
    const planPrompt = buildTemplatePrompt({
      businessType: optimized.businessType ?? 'general',
      styleguideData,
      designContext: optimized.designContext ?? '',
    });

    const planMessages = await planPrompt.formatMessages({ input: optimized.enrichedPrompt });
    const { response_format: _rf, ...invokeOpts } = planOpts;
    const planResponse = await planModel.invoke(planMessages, { ...invokeOpts });

    const planText = typeof planResponse.content === 'string'
      ? planResponse.content
      : Array.isArray(planResponse.content)
        ? planResponse.content
            .filter((c: unknown): c is { type: string; text: string } => typeof c === 'object' && c !== null && 'type' in (c as Record<string, unknown>) && (c as { type: string }).type === 'text')
            .map((c) => c.text)
            .join('')
        : '';

    const planParsed = extractJSON(planText);
    if (!planParsed) {
      throw new Error('Failed to parse unstructured plan JSON');
    }

    const { data: plan, error: planError } = validateTemplateResponse(planParsed);
    if (planError || !plan) {
      throw new Error(`Plan validation failed: ${planError}`);
    }

    // 4. Build skeleton treeData
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    const existingTitle = page?.title || 'Home';

    const skeletonComponents = plan.components.map(comp => ({
      type: comp.type,
      props: { id: `skel_${generateId()}`, ...comp.props }
    }));

    const treeData = {
      root: { props: { title: existingTitle } },
      content: skeletonComponents,
      zones: {},
    };

    // 5. Save to database with status="pending"
    // TODO: Add generationStatus once DB column exists (ALTER TABLE pages ADD COLUMN "generationStatus" TEXT;)
    await prisma.page.update({
      where: { id: pageId },
      data: {
        treeData: JSON.stringify(treeData),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        components: skeletonComponents,
        treeData,
      },
      message: `Planned ${skeletonComponents.length} sections for the page`,
    });

  } catch (err) {
    console.error('[ai-plan] Generation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: err instanceof Error ? err.message : 'Unknown generation error',
        },
      },
      { status: 500 }
    );
  }
}
