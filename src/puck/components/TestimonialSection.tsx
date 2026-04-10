"use client";

import { useCallback, useRef, useEffect } from "react";
import type { TestimonialSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Star rating sub-component ────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-tertiary fill-tertiary" : "text-muted-foreground/30"}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Testimonial card (shared between grid and carousel) ──────────────

function TestimonialCard({ item, cardStyle, ds }: { item: TestimonialSectionProps["testimonials"][number]; cardStyle: string; ds: ReturnType<typeof getDesignTokens> }) {
  // Content-specific extra classes per cardStyle variant (gradient bg, etc.)
  const cardStyleExtras: Record<string, string> = {
    elevated: "",
    glass: "bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/40 dark:border-white/10",
    default: "",
  };

  const baseClasses = `p-8 ${ds.card.base} ${ds.card.hover} h-full flex flex-col items-center text-center relative overflow-hidden ${cardStyleExtras[cardStyle] ?? ""}`.trim();

  return (
    <div className={baseClasses}>
      {/* Top border accent */}
      {ds.accent.cardAccent && (
        <div className={ds.accent.cardAccent} />
      )}

      {/* Avatar — centered with accent ring */}
      {item.avatarUrl ? (
        <img
          src={item.avatarUrl}
          alt={item.author}
          className={`w-16 h-16 object-cover ${ds.accent.avatar} ring-2 ring-primary/30 ring-offset-2 ring-offset-background mb-4`}
        />
      ) : (
        <div className={`w-16 h-16 bg-muted flex items-center justify-center text-base font-semibold ${ds.accent.avatar} ring-2 ring-primary/30 ring-offset-2 ring-offset-background mb-4`}>
          {(item.author || "")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>
      )}

      {/* Star rating */}
      <div className="flex justify-center">
        {item.rating && item.rating >= 1 && item.rating <= 5 && (
          <StarRating rating={item.rating} />
        )}
      </div>

      {/* Quote */}
      <p className={`italic text-lg leading-relaxed text-foreground/80 mt-4 mb-6 flex-1`}>{item.quote}</p>

      {/* Author info */}
      <div className="mt-auto">
        <p className="font-semibold text-sm">{item.author}</p>
        {item.role && (
          <p className={`${ds.typography.body} text-sm mt-0.5`}>{item.role}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export function TestimonialSection(props: TestimonialSectionProps & ComponentMeta) {
  const {
    heading,
    testimonials = [],
    variant = "grid",
    autoplay = false,
    interval = 5000,
    animation = "stagger-fade",
    cardStyle = "default",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const anim = useScrollAnimation(animation);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Carousel auto-rotate ─────────────────────────────────────────
  const advanceSlide = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollLeft + el.clientWidth * 0.85;
    if (next >= el.scrollWidth - el.clientWidth) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollTo({ left: next, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (variant !== "carousel" || !autoplay) return;
    const ms = typeof interval === "number" && interval > 0 ? interval : 5000;
    const id = setInterval(advanceSlide, ms);
    return () => clearInterval(id);
  }, [variant, autoplay, interval, advanceSlide]);

  const isStagger = animation === "stagger-fade";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Decorative background */}
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div className={`${ds.containerWidth} mx-auto relative`}>
        {heading && (
          <h2 className={`${ds.typography.h2} text-center mb-16`}>
            {heading}
          </h2>
        )}

        <div
          ref={anim.ref}
          className={`transition-all duration-700 ease-out ${anim.className}`}
        >
          {variant === "carousel" ? (
            /* ─── CSS scroll-snap carousel ────────────────────────── */
            <div
              ref={scrollRef}
              className="carousel-scroll flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 px-6 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[90%] md:w-[80%] lg:w-[60%] mx-auto"
                  style={isStagger ? { transitionDelay: `${i * 100}ms` } : undefined}
                >
                  <TestimonialCard item={t} cardStyle={cardStyle} ds={ds} />
                </div>
              ))}
            </div>
          ) : (
            /* ─── Standard grid ──────────────────────────────────── */
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  style={isStagger ? { transitionDelay: `${i * 100}ms` } : undefined}
                >
                  <TestimonialCard item={t} cardStyle={cardStyle} ds={ds} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
