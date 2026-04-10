"use client";

import { useRef, useState, useEffect } from "react";

// ─── Shared scroll-triggered animation hook ────────────────────────────
// Extracted from HeroSection, StatsSection, CTASection, TestimonialSection
// to eliminate duplication (DRY).

export interface ScrollAnimationResult {
  ref: React.RefObject<HTMLDivElement | null>;
  className: string;
  visible: boolean;
}

/**
 * Scroll-triggered animation using IntersectionObserver.
 * Respects `prefers-reduced-motion` — immediately shows content for users who prefer reduced motion.
 *
 * Supported animation types:
 * - "fade-up" — fade in + slide up
 * - "fade-in" — simple opacity transition
 * - "slide-left" — slide in from left
 * - "slide-right" — slide in from right
 * - "zoom" — scale up from 95% to 100%
 * - "stagger-fade" — same as fade-up (for staggered children)
 * - "fade-down" — fade in + slide down from top
 * - "stagger-slide" — slide in from left (for staggered children)
 *
 * @param animation - Animation type string. "none" disables animation.
 * @returns ref to attach to the container, className to spread, visible state
 */
export function useScrollAnimation(animation: string): ScrollAnimationResult {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animation === "none" || !ref.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animation]);

  const animClasses: Record<string, string> = {
    "fade-up": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    "fade-in": visible ? "opacity-100" : "opacity-0",
    "slide-left": visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
    "slide-right": visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
    zoom: visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
    "stagger-fade": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    stagger: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    "fade-down": visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6",
    "stagger-slide": visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
  };

  return {
    ref,
    className: animClasses[animation] ?? "",
    visible,
  };
}
