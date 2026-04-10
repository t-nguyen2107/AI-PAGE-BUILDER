// ─── Design Style System ─────────────────────────────────────────────
//
// Each design style defines coordinated visual overrides across ALL dimensions:
// section backgrounds, cards, typography, buttons, hover effects, decorative elements.
// Components use getStyle() to resolve the active style and render accordingly.
//
// This is what makes the difference between "every site looks the same" and
// "each project has a distinct visual identity" without custom CSS.

export type DesignStyle =
  | "elevated"      // Default — soft shadows, rounded corners, subtle depth
  | "minimal"       // Clean, no shadows, subtle borders, airy whitespace
  | "glassmorphism" // Blur, translucent layers, gradient mesh backgrounds
  | "brutalism"     // Thick borders, sharp corners, bold type, offset shadows
  | "neobrutalism"  // Playful brutalism with color, thick borders, offset shadows
  | "soft-ui"       // Gentle depth, neumorphism-inspired, warm and approachable
  | "aurora"        // Gradient mesh, flowing color, organic shapes
  | "bento";        // Apple-style grid, tight spacing, clean, modern

export const DESIGN_STYLES: DesignStyle[] = [
  "elevated", "minimal", "glassmorphism", "brutalism",
  "neobrutalism", "soft-ui", "aurora", "bento",
];

export const DESIGN_STYLE_LABELS: Record<DesignStyle, string> = {
  elevated: "Elevated (Default)",
  minimal: "Minimal",
  glassmorphism: "Glassmorphism",
  brutalism: "Brutalism",
  neobrutalism: "Neo-Brutalism",
  "soft-ui": "Soft UI",
  aurora: "Aurora",
  bento: "Bento Grid",
};

// ─── Style token interfaces ──────────────────────────────────────────

export interface SectionTokens {
  /** Base classes for <section> */
  base: string;
  /** Decorative background element (empty string = none) */
  decorative: string;
}

export interface CardTokens {
  /** Base card wrapper classes */
  base: string;
  /** Hover effect classes */
  hover: string;
}

export interface TypographyTokens {
  /** h1 / hero heading classes */
  h1: string;
  /** h2 / section heading classes */
  h2: string;
  /** h3 / card heading classes */
  h3: string;
  /** Body text classes */
  body: string;
}

export interface ButtonTokens {
  /** Primary CTA classes */
  primary: string;
  /** Secondary/outline CTA classes */
  secondary: string;
}

export interface AccentTokens {
  /** Icon wrapper classes */
  icon: string;
  /** Badge/pill classes */
  badge: string;
  /** Avatar ring classes */
  avatar: string;
  /** Top border accent on cards */
  cardAccent: string;
}

export interface DesignStyleTokens {
  section: SectionTokens;
  card: CardTokens;
  typography: TypographyTokens;
  button: ButtonTokens;
  accent: AccentTokens;
  /** Transition duration for hover/focus effects */
  transitionDuration: string;
  /** Container max-width class */
  containerWidth: string;
}

// ─── Style definitions ───────────────────────────────────────────────

const STYLES: Record<DesignStyle, DesignStyleTokens> = {
  // ─── Elevated (default) ────────────────────────────────────────────
  elevated: {
    section: {
      base: "py-24 px-6 bg-background",
      decorative: "absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/3 blur-3xl",
    },
    card: {
      base: "rounded-2xl bg-card border border-border/70 shadow-sm",
      hover: "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-bold tracking-tight",
      h3: "text-lg font-semibold",
      body: "text-muted-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-full px-8 py-4 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
      secondary: "rounded-full px-8 py-4 font-semibold border-2 border-border hover:bg-muted hover:border-primary/30 transition-all duration-300",
    },
    accent: {
      icon: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center",
      badge: "px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20",
      avatar: "rounded-full ring-2 ring-primary/30",
      cardAccent: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 to-primary/30",
    },
    transitionDuration: "duration-300",
    containerWidth: "max-w-6xl",
  },

  // ─── Minimal ───────────────────────────────────────────────────────
  minimal: {
    section: {
      base: "py-20 px-6 bg-background",
      decorative: "", // no decorative elements
    },
    card: {
      base: "bg-transparent border border-border/60",
      hover: "hover:border-primary/50 transition-all duration-200",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-light tracking-wide leading-[1.15]",
      h2: "text-3xl md:text-4xl font-light tracking-tight",
      h3: "text-lg font-medium",
      body: "text-muted-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-sm px-8 py-4 font-medium border-2 border-foreground/40 hover:bg-foreground hover:text-background transition-all duration-200",
      secondary: "rounded-sm px-8 py-4 font-medium border-2 border-border hover:border-foreground/50 transition-all duration-200",
    },
    accent: {
      icon: "w-12 h-12 rounded-none flex items-center justify-center border border-border/70",
      badge: "px-4 py-1.5 rounded-none text-sm font-medium border-2 border-foreground/40",
      avatar: "rounded-full ring-2 ring-border/70",
      cardAccent: "absolute top-0 left-0 right-0 h-px bg-border",
    },
    transitionDuration: "duration-200",
    containerWidth: "max-w-5xl",
  },

  // ─── Glassmorphism ─────────────────────────────────────────────────
  glassmorphism: {
    section: {
      base: "py-24 px-6",
      decorative: "absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5",
    },
    card: {
      base: "rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg",
      hover: "hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-bold tracking-tight",
      h3: "text-lg font-semibold",
      body: "text-foreground/70 leading-relaxed",
    },
    button: {
      primary: "rounded-full px-8 py-4 font-semibold bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:shadow-lg transition-all duration-300",
      secondary: "rounded-full px-8 py-4 font-semibold bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300",
    },
    accent: {
      icon: "w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30",
      badge: "px-4 py-1.5 rounded-full text-sm font-semibold bg-white/15 backdrop-blur-sm border border-white/25",
      avatar: "rounded-full ring-2 ring-white/30",
      cardAccent: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 to-white/10",
    },
    transitionDuration: "duration-300",
    containerWidth: "max-w-6xl",
  },

  // ─── Brutalism ─────────────────────────────────────────────────────
  brutalism: {
    section: {
      base: "py-20 px-6 bg-background border-t-2 border-foreground",
      decorative: "", // no soft decorative elements
    },
    card: {
      base: "bg-card border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)]",
      hover: "hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-1 transition-all duration-150",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05]",
      h2: "text-3xl md:text-4xl font-black uppercase tracking-tight",
      h3: "text-lg font-bold uppercase",
      body: "text-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-none px-8 py-4 font-black uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-0.5 transition-all duration-150",
      secondary: "rounded-none px-8 py-4 font-bold uppercase tracking-wide border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-150",
    },
    accent: {
      icon: "w-12 h-12 rounded-none bg-foreground text-background flex items-center justify-center",
      badge: "px-4 py-1.5 rounded-none text-sm font-black uppercase bg-foreground text-background",
      avatar: "rounded-none border-2 border-foreground",
      cardAccent: "absolute top-0 left-0 w-1 h-full bg-foreground",
    },
    transitionDuration: "duration-150",
    containerWidth: "max-w-6xl",
  },

  // ─── Neo-Brutalism ─────────────────────────────────────────────────
  neobrutalism: {
    section: {
      base: "py-20 px-6 bg-background",
      decorative: "absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -z-0",
    },
    card: {
      base: "rounded-xl bg-card border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)]",
      hover: "hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-1 hover:bg-primary/5 transition-all duration-200",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-extrabold tracking-tight",
      h3: "text-lg font-bold",
      body: "text-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-xl px-8 py-4 font-bold border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-1 transition-all duration-200",
      secondary: "rounded-xl px-8 py-4 font-bold border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-200",
    },
    accent: {
      icon: "w-12 h-12 rounded-lg bg-primary border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)] flex items-center justify-center text-primary-foreground",
      badge: "px-4 py-1.5 rounded-lg text-sm font-bold bg-primary border-2 border-foreground text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)]",
      avatar: "rounded-xl border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]",
      cardAccent: "absolute top-0 left-0 right-0 h-1.5 bg-primary",
    },
    transitionDuration: "duration-200",
    containerWidth: "max-w-6xl",
  },

  // ─── Soft UI ───────────────────────────────────────────────────────
  "soft-ui": {
    section: {
      base: "py-24 px-6 bg-muted/30",
      decorative: "absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent",
    },
    card: {
      base: "rounded-2xl bg-card border-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.06)]",
      hover: "hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-semibold tracking-tight",
      h3: "text-lg font-medium",
      body: "text-muted-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-full px-8 py-4 font-semibold shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.15)] transition-all duration-300",
      secondary: "rounded-full px-8 py-4 font-semibold shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300",
    },
    accent: {
      icon: "w-12 h-12 rounded-xl bg-primary/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center",
      badge: "px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.03)]",
      avatar: "rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.06)]",
      cardAccent: "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent",
    },
    transitionDuration: "duration-300",
    containerWidth: "max-w-6xl",
  },

  // ─── Aurora ────────────────────────────────────────────────────────
  aurora: {
    section: {
      base: "py-24 px-6 bg-background relative overflow-hidden",
      decorative: "absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10",
    },
    card: {
      base: "rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10",
      hover: "hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-400",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-bold tracking-tight",
      h3: "text-lg font-semibold",
      body: "text-foreground/70 leading-relaxed",
    },
    button: {
      primary: "rounded-full px-8 py-4 font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300",
      secondary: "rounded-full px-8 py-4 font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all duration-300",
    },
    accent: {
      icon: "w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center",
      badge: "px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/20",
      avatar: "rounded-full ring-2 ring-primary/30",
      cardAccent: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary",
    },
    transitionDuration: "duration-400",
    containerWidth: "max-w-6xl",
  },

  // ─── Bento ─────────────────────────────────────────────────────────
  bento: {
    section: {
      base: "py-20 px-6 bg-background",
      decorative: "", // clean, no decorative elements
    },
    card: {
      base: "rounded-3xl bg-card border border-border/60 overflow-hidden",
      hover: "hover:scale-[1.02] hover:shadow-md transition-all duration-200",
    },
    typography: {
      h1: "text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]",
      h2: "text-3xl md:text-4xl font-bold tracking-tight",
      h3: "text-lg font-semibold",
      body: "text-muted-foreground leading-relaxed",
    },
    button: {
      primary: "rounded-2xl px-8 py-4 font-semibold hover:brightness-110 transition-all duration-200",
      secondary: "rounded-2xl px-8 py-4 font-semibold border border-border hover:bg-muted transition-all duration-200",
    },
    accent: {
      icon: "w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center",
      badge: "px-4 py-1.5 rounded-2xl text-sm font-semibold bg-primary/10 text-primary",
      avatar: "rounded-2xl ring-2 ring-border",
      cardAccent: "", // no accent bar — clean
    },
    transitionDuration: "duration-200",
    containerWidth: "max-w-7xl",
  },
};

// ─── Public API ──────────────────────────────────────────────────────

/** Get the full token set for a design style (falls back to "elevated") */
export function getDesignTokens(style?: string): DesignStyleTokens {
  const key = (style as DesignStyle) ?? "elevated";
  return STYLES[key] ?? STYLES.elevated;
}

/** Merge card base + hover classes with any extra classes */
export function cardClasses(style: DesignStyle | undefined, extra?: string): string {
  const tokens = getDesignTokens(style);
  return `${tokens.card.base} ${tokens.card.hover} ${extra ?? ""}`.trim();
}

/** Merge section base + optional decorative wrapper */
export function sectionClasses(style: DesignStyle | undefined, extra?: string): string {
  const tokens = getDesignTokens(style);
  return `w-full ${tokens.section.base} text-foreground relative ${extra ?? ""}`.trim();
}
