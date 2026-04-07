/**
 * Section Generator - 2-pass orchestrator for parallel per-section generation.
 *
 * Pass 1: Resolve deterministic section order from LANDING_PATTERNS (0ms)
 * Pass 2: Generate each section in parallel via focused prompts + fast model
 */

import { COMPONENT_CATALOG } from './prompts/component-catalog';
import { LANDING_PATTERNS, type DesignGuidance } from './knowledge/design-knowledge';
import { buildSectionPrompt } from './prompts/section-prompt';
import { createFastModelBundle } from './provider';
import { extractJSON } from './streaming';
import { generatePuckComponent } from '@/features/ai/component-generator';
import { ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { ComponentData } from '@puckeditor/core';

// --- Types ---

export interface SectionGeneratorContext {
  userPrompt: string;
  businessType?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: { colors?: string; typography?: string; spacing?: string; cssVariables?: string };
  signal?: AbortSignal;
}

 export interface SectionDoneEvent {
  sectionIndex: number;
  sectionTotal: number;
  sectionComponent: ComponentData;
  progress: number;
 }

// --- Mapping: Puck component type -> ComponentCategory ---

const SECTION_CATEGORY_MAP: Record<string, ComponentCategory> = {
  HeroSection: ComponentCategory.HERO,
  HeaderNav: ComponentCategory.HEADER_NAV,
  FooterSection: ComponentCategory.FOOTER,
  FeaturesGrid: ComponentCategory.FEATURES,
  FeatureShowcase: ComponentCategory.FEATURES,
  PricingTable: ComponentCategory.PRICING,
  TestimonialSection: ComponentCategory.TESTIMONIAL,
  CTASection: ComponentCategory.CTA,
  FAQSection: ComponentCategory.FAQ,
  StatsSection: ComponentCategory.STATS,
  TeamSection: ComponentCategory.TEAM,
  BlogSection: ComponentCategory.BLOG,
  LogoGrid: ComponentCategory.LOGO_GRID,
  Gallery: ComponentCategory.GALLERY,
  ContactForm: ComponentCategory.CONTACT,
  SocialProof: ComponentCategory.STATS,
  ComparisonTable: ComponentCategory.PRICING,
  ProductCards: ComponentCategory.HERO,
  CountdownTimer: ComponentCategory.CTA,
  AnnouncementBar: ComponentCategory.CTA,
  Banner: ComponentCategory.CTA,
  NewsletterSignup: ComponentCategory.CTA,
};

function getComponentCategory(sectionType: string): ComponentCategory {
  return SECTION_CATEGORY_MAP[sectionType] ?? ComponentCategory.CUSTOM;
}

// --- Pass 1: Resolve section plan ---

export function resolveSectionPlan(
  designGuidance: DesignGuidance | null | undefined,
  _businessType?: string,
): string[] {
  if (designGuidance?.pattern?.sectionOrder) {
    return designGuidance.pattern.sectionOrder;
  }
  return LANDING_PATTERNS['hero_features_cta'].sectionOrder;
}

// --- Template fallback (zero LLM) ---

function templateFallback(sectionType: string): ComponentData {
  const category = getComponentCategory(sectionType);
  const component = generatePuckComponent(category, {});
  if (component) {
    return component;
  }
  return {
    type: sectionType,
    props: { id: generateId() },
  };
}

// --- Pass 2: Generate single section ---

export async function generateSection(
  sectionType: string,
  context: SectionGeneratorContext,
  signal?: AbortSignal,
): Promise<ComponentData> {
  const catalogEntry = COMPONENT_CATALOG[sectionType];
  if (!catalogEntry) {
    return templateFallback(sectionType);
  }

  try {
    const prompt = buildSectionPrompt(sectionType, catalogEntry, {
      userPrompt: context.userPrompt,
      businessType: context.businessType ?? 'general',
      designGuidance: context.designGuidance,
      styleguideData: context.styleguideData,
      position: { index: 0, total: 1 },
    });

    const { model, jsonCallOptions } = createFastModelBundle({ maxTokens: 4096 });
    const messages = await prompt.formatMessages({ input: context.userPrompt });

    const { response_format: _rf, ...callOpts } = jsonCallOptions;
    const response = await model.invoke(messages, {
      ...callOpts,
      ...(signal ? { signal } : {}),
    });

    const text = typeof response.content === 'string'
      ? response.content
      : '';

    const parsed = extractJSON(text);
    if (parsed && typeof parsed === 'object') {
      const raw = parsed as Record<string, unknown>;
      const propsVal = (raw.props ?? raw) as Record<string, unknown>;
      return {
        type: sectionType,
        props: { id: generateId(), ...propsVal },
      };
    }

    console.warn(`[section-generator] Could not parse section "${sectionType}", using template fallback.`);
    return templateFallback(sectionType);
  } catch (err) {
    console.warn(`[section-generator] Failed to generate "${sectionType}":`, err);
    return templateFallback(sectionType);
  }
}

// --- Parallel orchestrator ---

export async function generateAllSections(
  plan: string[],
  context: SectionGeneratorContext,
  onSectionDone?: (event: SectionDoneEvent) => void,
): Promise<ComponentData[]> {
  const total = plan.length;
  const components: ComponentData[] = new Array(total);

  const results = await Promise.allSettled(
    plan.map((sectionType, index) =>
      generateSection(sectionType, context, context.signal).then((component) => {
        components[index] = component;
        onSectionDone?.({
          sectionIndex: index,
          sectionTotal: total,
          sectionComponent: component,
          progress: Math.round(((index + 1) / total) * 100),
        });
        return component;
      }),
    ),
  );

  // Fill gaps with template fallbacks for any failed sections
  for (let i = 0; i < total; i++) {
    if (!components[i]) {
      components[i] = templateFallback(plan[i]);
    }
  }

  return components;
}
