"use client";

import { cn } from "@/lib/utils";

type WinnieSize = "sm" | "md" | "lg";

interface WinnieAvatarProps {
  size?: WinnieSize;
  animated?: boolean;
  className?: string;
}

const SIZE_MAP: Record<WinnieSize, { container: string; svg: number }> = {
  sm: { container: "w-8 h-8", svg: 32 },
  md: { container: "w-12 h-12", svg: 48 },
  lg: { container: "w-20 h-20", svg: 80 },
};

/* ── Bee palette — warm, energetic, creative ── */
const BEE = {
  body: "#FFBE0B",      // bright golden yellow
  bodyDark: "#F5A300",  // slightly darker gold
  stripe: "#A06800",    // warm brown stripes
  wing: "#B8E4FF",      // soft sky blue
  wingInner: "#D6F0FF", // lighter inner wing
  eye: "#2D1B06",       // dark brown
  cheek: "#FF8FAB",     // coral pink
  antenna: "#C88A00",   // warm amber
  antennaTip: "#FF6B6B", // warm coral
  stinger: "#A06800",   // dark amber
  shine: "#FFF3C4",     // bright highlight
};

export function WinnieAvatar({ size = "md", animated = false, className }: WinnieAvatarProps) {
  const { container, svg } = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        container,
        animated && "animate-winnie-float",
        className,
      )}
      role="img"
      aria-label="Winnie AI Assistant"
    >
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Wings ── */}
        <ellipse
          cx="22" cy="30" rx="14" ry="18"
          fill={BEE.wing}
          opacity="0.55"
          className={animated ? "animate-winnie-wing" : undefined}
          style={animated ? { transformOrigin: "36px 38px" } : undefined}
        />
        <ellipse
          cx="58" cy="30" rx="14" ry="18"
          fill={BEE.wing}
          opacity="0.55"
          className={animated ? "animate-winnie-wing" : undefined}
          style={animated ? { transformOrigin: "44px 38px", animationDelay: "0.15s" } : undefined}
        />
        {/* Inner wings */}
        <ellipse cx="24" cy="30" rx="9" ry="12" fill={BEE.wingInner} opacity="0.5" />
        <ellipse cx="56" cy="30" rx="9" ry="12" fill={BEE.wingInner} opacity="0.5" />

        {/* ── Body ── */}
        <ellipse cx="40" cy="44" rx="18" ry="20" fill={BEE.body} />

        {/* Body highlight */}
        <ellipse cx="36" cy="38" rx="8" ry="10" fill={BEE.shine} opacity="0.35" />

        {/* ── Stripes ── */}
        <rect x="22" y="38" width="36" height="4" rx="2" fill={BEE.stripe} opacity="0.45" />
        <rect x="22" y="46" width="36" height="4" rx="2" fill={BEE.stripe} opacity="0.45" />
        <rect x="24" y="54" width="32" height="3.5" rx="1.75" fill={BEE.stripe} opacity="0.45" />

        {/* ── Head ── */}
        <circle cx="40" cy="26" r="14" fill={BEE.body} />

        {/* Head highlight */}
        <circle cx="38" cy="22" r="8" fill={BEE.shine} opacity="0.3" />

        {/* ── Eyes ── */}
        <circle cx="35" cy="25" r="3.2" fill="white" />
        <circle cx="45" cy="25" r="3.2" fill="white" />
        <circle cx="36" cy="25" r="1.6" fill={BEE.eye} />
        <circle cx="46" cy="25" r="1.6" fill={BEE.eye} />
        {/* Eye shine */}
        <circle cx="37" cy="24" r="0.7" fill="white" />
        <circle cx="47" cy="24" r="0.7" fill="white" />

        {/* ── Smile ── */}
        <path
          d="M36 30 Q40 34.5 44 30"
          stroke={BEE.eye}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Cheeks ── */}
        <circle cx="30" cy="29" r="2.5" fill={BEE.cheek} opacity="0.5" />
        <circle cx="50" cy="29" r="2.5" fill={BEE.cheek} opacity="0.5" />

        {/* ── Antennae ── */}
        <path
          d="M34 14 Q31 6 27 3"
          stroke={BEE.antenna}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="27" cy="3" r="2.8" fill={BEE.antennaTip} />
        <path
          d="M46 14 Q49 6 53 3"
          stroke={BEE.antenna}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="53" cy="3" r="2.8" fill={BEE.antennaTip} />

        {/* ── Stinger ── */}
        <path
          d="M38 63 L40 68.5 L42 63"
          fill={BEE.stinger}
          opacity="0.7"
        />
      </svg>

      {/* Glow ring behind avatar */}
      <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-md -z-10 scale-125" />
    </div>
  );
}
