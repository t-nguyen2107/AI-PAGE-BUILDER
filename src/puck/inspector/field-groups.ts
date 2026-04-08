/**
 * Convention-based field grouping for the Content tab.
 * Fields are matched by name pattern → semantic group.
 * Per-component overrides allow explicit ordering when needed.
 */

export interface FieldGroup {
  title: string;
  icon: string;
  fields: string[];
}

// ─── Convention patterns ──────────────────────────────────────────────

const CONVENTIONS: Array<{ title: string; icon: string; patterns: RegExp[] }> = [
  {
    title: "Content",
    icon: "T",
    patterns: [
      /^(heading|subtext|text|title|subtitle|description|body|content|message|quote|question|answer|label|tagline|pretitle|caption|alt|placeholder|copyright|address|subject|body)$/i,
    ],
  },
  {
    title: "Actions",
    icon: "→",
    patterns: [
      /^(cta|button|link|submit|action)/i,
    ],
  },
  {
    title: "Media",
    icon: "▣",
    patterns: [
      /^(image|video|background|logo|avatar|icon|src|thumbnail|media|favicon|ogImage|heroImage|photo)/i,
    ],
  },
  {
    title: "Layout",
    icon: "⊞",
    patterns: [
      /^(align|layout|columns|padding|gap|direction|justify|wrap|size|fullWidth|spanCol|spanRow|direction|orientation|sticky|fixed|collapse|showBadge|showDivider|showRating|showAvatar|showRole|showCta|showTitle|showDate|showAuthor|showIcon|showArrow|showButton|showLabel|showCount|showTime|showProgress)$/i,
    ],
  },
  {
    title: "Appearance",
    icon: "◈",
    patterns: [
      /^(animation|gradient|overlay|theme|colorScheme|style|variant|backgroundOverlay|cardStyle|hoverEffect|bordered|rounded|shadow|flat|tone|mode|skin)/i,
    ],
  },
  {
    title: "Items",
    icon: "☰",
    patterns: [
      /^(items|plans|features|testimonials|faqItems|stats|teamMembers|posts|logos|links|navItems|socialLinks|badges|cards|products|menuItems|services|categories|tags|options|steps|pricingPlans|slides|tabs|rows|data|highlights|benefits|questions|offers|reviews|events|contacts|awards|timelineItems|checklistItems|numberItems|gridItems|iconItems|progressSteps)$/i,
    ],
  },
];

// ─── Per-component overrides ─────────────────────────────────────────
// When field order differs from convention-based grouping, specify explicitly.

const COMPONENT_OVERRIDES: Record<string, FieldGroup[]> = {
  HeroSection: [
    { title: "Content", icon: "T", fields: ["heading", "subtext", "badge"] },
    { title: "Actions", icon: "→", fields: ["ctaText", "ctaHref", "ctaSecondaryText", "ctaSecondaryHref"] },
    { title: "Layout", icon: "⊞", fields: ["align", "layout", "padding"] },
    { title: "Media", icon: "▣", fields: ["backgroundUrl", "backgroundOverlay", "videoUrl", "imageUrl"] },
    { title: "Appearance", icon: "◈", fields: ["animation", "gradientFrom", "gradientTo", "gradientPreset"] },
    { title: "Items", icon: "☰", fields: ["trustBadges"] },
  ],
  CTASection: [
    { title: "Content", icon: "T", fields: ["heading", "subtext"] },
    { title: "Actions", icon: "→", fields: ["ctaText", "ctaHref", "ctaSecondaryText", "ctaSecondaryHref"] },
    { title: "Layout", icon: "⊞", fields: ["align", "padding"] },
    { title: "Media", icon: "▣", fields: ["backgroundUrl"] },
    { title: "Appearance", icon: "◈", fields: ["animation", "gradientPreset", "gradientFrom", "gradientTo"] },
  ],
  HeaderNav: [
    { title: "Content", icon: "T", fields: ["logoText", "logoImageUrl"] },
    { title: "Items", icon: "☰", fields: ["navItems"] },
    { title: "Actions", icon: "→", fields: ["ctaText", "ctaHref"] },
    { title: "Layout", icon: "⊞", fields: ["sticky", "align"] },
  ],
  FooterSection: [
    { title: "Content", icon: "T", fields: ["copyright", "logoImageUrl"] },
    { title: "Items", icon: "☰", fields: ["columns"] },
    { title: "Actions", icon: "→", fields: ["socialLinks"] },
    { title: "Appearance", icon: "◈", fields: ["style"] },
  ],
  PricingTable: [
    { title: "Content", icon: "T", fields: ["heading", "subtext"] },
    { title: "Items", icon: "☰", fields: ["plans"] },
    { title: "Appearance", icon: "◈", fields: ["animation", "highlightedBadge"] },
  ],
  FeaturesGrid: [
    { title: "Content", icon: "T", fields: ["heading", "subtext"] },
    { title: "Items", icon: "☰", fields: ["features"] },
    { title: "Layout", icon: "⊞", fields: ["columns", "align", "padding"] },
    { title: "Appearance", icon: "◈", fields: ["animation", "backgroundUrl"] },
  ],
  TestimonialSection: [
    { title: "Content", icon: "T", fields: ["heading"] },
    { title: "Items", icon: "☰", fields: ["testimonials"] },
    { title: "Layout", icon: "⊞", fields: ["columns", "padding"] },
    { title: "Appearance", icon: "◈", fields: ["animation", "backgroundUrl"] },
  ],
  FAQSection: [
    { title: "Content", icon: "T", fields: ["heading", "subtext"] },
    { title: "Items", icon: "☰", fields: ["faqItems"] },
    { title: "Layout", icon: "⊞", fields: ["padding"] },
    { title: "Appearance", icon: "◈", fields: ["animation"] },
  ],
};

// ─── Main function ───────────────────────────────────────────────────

/**
 * Get field groups for a component type.
 * 1. Check per-component overrides first
 * 2. Fall back to convention-based auto-grouping
 */
export function getFieldGroups(
  componentType: string,
  fieldNames: string[],
): FieldGroup[] {
  // Check explicit override
  const override = COMPONENT_OVERRIDES[componentType];
  if (override) {
    // Filter to only include groups with fields that actually exist
    return override
      .map((g) => ({
        ...g,
        fields: g.fields.filter((f) => fieldNames.includes(f)),
      }))
      .filter((g) => g.fields.length > 0);
  }

  // Auto-group by convention
  return autoGroup(fieldNames);
}

function autoGroup(fieldNames: string[]): FieldGroup[] {
  const assigned = new Set<string>();
  const groups: FieldGroup[] = [];

  for (const conv of CONVENTIONS) {
    const fields = fieldNames.filter(
      (f) => !assigned.has(f) && conv.patterns.some((p) => p.test(f)),
    );
    if (fields.length > 0) {
      fields.forEach((f) => assigned.add(f));
      groups.push({ title: conv.title, icon: conv.icon, fields });
    }
  }

  // Catch-all for unassigned fields
  const remaining = fieldNames.filter((f) => !assigned.has(f));
  if (remaining.length > 0) {
    groups.push({ title: "Properties", icon: "⚙", fields: remaining });
  }

  return groups;
}
