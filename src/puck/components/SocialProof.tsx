"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SocialProofProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

// ─── useCountUp hook ────────────────────────────────────────────────────
function useCountUp(target: string, visible: boolean, duration = 2000) {
  const [count, setCount] = useState("0");

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""));
    if (isNaN(num)) {
      setCount(target);
      return;
    }
    const prefix = target.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = target.match(/[^0-9]*$/)?.[0] ?? "";
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(`${prefix}${Math.floor(eased * num).toLocaleString()}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return count;
}

// ─── Stat display (uses hook at top level) ──────────────────────────────
function StatItem({
  stat,
  animated,
  visible,
}: {
  stat: { value: string; label: string };
  animated: boolean;
  visible: boolean;
}) {
  const displayValue = useCountUp(stat.value, visible && animated);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-primary">
        {animated ? displayValue : stat.value}
      </p>
      <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────
export function SocialProof(props: SocialProofProps & ComponentMeta) {
  const {
    heading,
    stats = [],
    logos = [],
    showAvatars,
    avatarCount = 5,
    testimonialText,
    animated = false,
    avatarUrls,
    variant = "default",
    animation = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      }
    },
    [hasAnimated],
  );

  useEffect(() => {
    if (animation === "none" && !animated) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, animated, handleIntersection]);

  // Build animation classes
  const sectionAnimClass =
    animation === "fade-up"
      ? `transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`
      : animation === "stagger-fade"
        ? `transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`
        : "";

  const staggerDelay = (i: number) =>
    animation === "stagger-fade" ? { transitionDelay: `${i * 150}ms` } : {};

  // ─── Notification variant ────────────────────────────────────────────
  if (variant === "notification") {
    return (
      <section
        ref={sectionRef}
        className={`w-full py-4 px-6 ${sectionAnimClass} ${className ?? ""}`}
        style={extractStyleProps(metaRest)}
      >
        <div className={`${ds.containerWidth} mx-auto flex justify-center`}>
          <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm animate-[slideIn_0.3s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
              <p className="text-sm text-foreground">
                {testimonialText ?? "Someone just purchased this product!"}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── Default variant ─────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className={`w-full ${ds.section.base} text-foreground ${sectionAnimClass} ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div className={`${ds.containerWidth} mx-auto relative`}>
        {heading && (
          <h2
            className={`${ds.typography.h2} text-center mb-10 transition-all duration-700 ${isVisible || animation === "none" ? "opacity-100" : "opacity-0"}`}
            style={staggerDelay(0)}
          >
            {heading}
          </h2>
        )}

        {showAvatars && (
          <div
            className={`flex items-center justify-center gap-3 mb-10 transition-all duration-700 ${isVisible || animation === "none" ? "opacity-100" : "opacity-0"}`}
            style={staggerDelay(1)}
          >
            {/* Avatar stack from URLs */}
            {avatarUrls && avatarUrls.length > 0 ? (
              <div className="flex -space-x-2">
                {avatarUrls.slice(0, 5).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className={`w-10 h-10 object-cover ${ds.accent.avatar}`}
                  />
                ))}
                {avatarUrls.length > 5 && (
                  <span className={`w-10 h-10 bg-muted flex items-center justify-center text-xs text-muted-foreground ${ds.accent.avatar}`}>
                    +{avatarUrls.length - 5}
                  </span>
                )}
              </div>
            ) : (
              /* Fallback: letter-based avatars */
              <div className="flex -space-x-3">
                {Array.from({ length: avatarCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground ${ds.accent.avatar}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
            )}
            <span className="text-sm text-muted-foreground ml-2">
              +{avatarUrls?.length ?? avatarCount} users
            </span>
          </div>
        )}

        {stats && stats.length > 0 && (
          <div
            className={`flex flex-wrap items-center justify-center gap-10 mb-10 transition-all duration-700 ${isVisible || animation === "none" ? "opacity-100" : "opacity-0"}`}
            style={staggerDelay(2)}
          >
            {stats.map((stat, i) => (
              <StatItem
                key={i}
                stat={stat}
                animated={animated}
                visible={isVisible}
              />
            ))}
          </div>
        )}

        {logos && logos.length > 0 && (
          <div
            className={`flex flex-wrap items-center justify-center gap-10 mb-10 transition-all duration-700 ${isVisible || animation === "none" ? "opacity-100" : "opacity-0"}`}
            style={staggerDelay(3)}
          >
            {logos.map((logo, i) => (
              <img
                key={i}
                src={logo.imageUrl}
                alt={logo.name}
                className="h-10 grayscale opacity-60 hover:opacity-100 transition"
              />
            ))}
          </div>
        )}

        {testimonialText && (
          <div
            className={`max-w-3xl mx-auto text-center ${ds.card.base} p-8 ${ds.card.hover} ${isVisible || animation === "none" ? "opacity-100" : "opacity-0"}`}
            style={staggerDelay(4)}
          >
            <span className="block text-5xl text-amber-400 font-serif leading-none mb-2">
              &ldquo;
            </span>
            <p className={`italic text-lg ${ds.typography.body}`}>
              {testimonialText}
            </p>
            <span className="block text-5xl text-amber-400 font-serif leading-none mt-2">
              &rdquo;
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
