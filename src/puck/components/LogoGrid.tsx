"use client";

import { useRef, useState, useEffect } from "react";
import type { LogoGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

function useScrollAnimation(animation: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (animation === "none" || !ref.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animation]);
  const animClasses: Record<string, string> = {
    "fade-up": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    "stagger-fade": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
  };
  return { ref, className: animClasses[animation] ?? "", visible };
}

export function LogoGrid(props: LogoGridProps & ComponentMeta) {
  const {
    heading,
    logos = [],
    variant = "grid",
    grayscale = true,
    tooltip = false,
    animation = "none",
    className,
    ...metaRest
  } = props;

  const { ref: animRef, className: animClass, visible } = useScrollAnimation(animation);

  const staggerDelay = (i: number) =>
    animation === "stagger-fade" && visible ? { transitionDelay: `${i * 80}ms` } : {};

  const isCarousel = variant === "carousel";

  return (
    <section
      className={`w-full py-16 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-xl md:text-2xl font-semibold text-center text-muted-foreground mb-10">
            {heading}
          </h2>
        )}

        <div
          ref={animRef}
          className={`transition-all duration-700 ease-out ${animClass}`}
        >
          {isCarousel ? (
            /* Carousel: CSS scroll-snap */
            <div
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
                  <div className="relative group">
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className={`h-10 max-h-12 object-contain transition-all duration-300 ${
                        grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    />
                    {tooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {logo.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                  <img
                    src={logo.imageUrl}
                    alt={logo.name}
                    className={`h-10 max-h-12 object-contain transition-all duration-300 ${
                      grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  />
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
