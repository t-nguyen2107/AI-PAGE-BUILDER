"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { TestimonialSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
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

function TestimonialCard({ item, cardStyle }: { item: TestimonialSectionProps["testimonials"][number]; cardStyle: string }) {
  const cardClasses: Record<string, string> = {
    elevated: "p-6 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow h-full flex flex-col",
    glass: "p-6 rounded-xl bg-surface-lowest/80 dark:bg-surface/80 backdrop-blur-sm border border-border/20 shadow-sm h-full flex flex-col",
    default: "p-6 rounded-xl bg-card border border-border h-full flex flex-col",
  };

  return (
    <div className={cardClasses[cardStyle] ?? cardClasses.default}>
      {item.rating && item.rating >= 1 && item.rating <= 5 && (
        <StarRating rating={item.rating} />
      )}
      <span className="block text-4xl text-primary/30 font-serif leading-none mb-2">
        &ldquo;
      </span>
      <p className="italic text-lg leading-relaxed mb-6 flex-1">{item.quote}</p>
      <div className="flex items-center gap-3 mt-auto">
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt={item.author}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {(item.author || "")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm">{item.author}</p>
          <p className="text-muted-foreground text-sm">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export function TestimonialSection(props: TestimonialSectionProps & ComponentMeta) {
  const {
    heading,
    testimonials,
    variant = "grid",
    autoplay = false,
    interval = 5000,
    animation = "none",
    cardStyle = "default",
    className,
    ...metaRest
  } = props;

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
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
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
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 px-6 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[85%] md:w-[45%] lg:w-[30%]"
                  style={isStagger ? { transitionDelay: `${i * 100}ms` } : undefined}
                >
                  <TestimonialCard item={t} cardStyle={cardStyle} />
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
                  <TestimonialCard item={t} cardStyle={cardStyle} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
