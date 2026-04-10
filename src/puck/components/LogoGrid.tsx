"use client";

import { useState, useRef, useEffect } from "react";
import type { LogoGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export function LogoGrid(props: LogoGridProps & ComponentMeta) {
  const {
    heading,
    logos = [],
    variant = "grid",
    grayscale = true,
    tooltip = false,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const { ref: animRef, className: animClass, visible } = useScrollAnimation(animation);

  // Carousel scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const staggerDelay = (i: number) =>
    animation === "stagger-fade" && visible ? { transitionDelay: `${i * 80}ms` } : {};

  const isCarousel = variant === "carousel";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div className={`${ds.containerWidth} mx-auto relative`}>
        {heading && (
          <h2 className={`${ds.typography.h2} text-center text-muted-foreground mb-10`}>
            {heading}
          </h2>
        )}

        <div
          ref={animRef}
          className={`transition-all duration-700 ease-out ${animClass}`}
        >
          {isCarousel ? (
            /* Carousel: CSS scroll-snap with nav arrows */
            <div className="relative group">
              {canScrollLeft && (
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth * 0.8, behavior: "smooth" })}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: scrollRef.current!.clientWidth * 0.8, behavior: "smooth" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <div
                ref={scrollRef}
                className="carousel-scroll flex overflow-x-auto snap-x snap-mandatory gap-8 pb-4 -mx-6 px-6 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
                {logos.map((logo, i) => (
                  <div
                    key={i}
                    className="snap-center shrink-0 w-[60%] md:w-[30%] lg:w-[18%] flex items-center justify-center"
                    style={staggerDelay(i)}
                  >
                    <div className="relative group/logo">
                      {logo.imageUrl ? (
                        <img
                          src={logo.imageUrl}
                          alt={logo.name}
                          className={`h-10 max-h-12 object-contain transition-all duration-300 ${
                            grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : "opacity-80 hover:opacity-100"
                          }`}
                        />
                      ) : (
                        <span className={`text-lg font-bold tracking-tight ${
                          grayscale ? "opacity-40 hover:opacity-70" : "opacity-60 hover:opacity-90"
                        } transition-all duration-300`}>{logo.name}</span>
                      )}
                      {tooltip && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none">
                          {logo.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Grid: flex-wrap layout */
            <div className="flex flex-wrap items-center justify-center gap-10">
              {logos.map((logo, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={staggerDelay(i)}
                >
                  {logo.imageUrl ? (
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className={`h-10 max-h-12 object-contain transition-all duration-300 ${
                        grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ) : (
                    <span className={`text-lg font-bold tracking-tight ${
                      grayscale ? "opacity-40 hover:opacity-70" : "opacity-60 hover:opacity-90"
                    } transition-all duration-300`}>{logo.name}</span>
                  )}
                  {tooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {logo.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
