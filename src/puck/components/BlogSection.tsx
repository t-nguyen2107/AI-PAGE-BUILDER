"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { BlogSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

function useScrollAnimation(animation: string) {
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
      { threshold: 0.15 }
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

export function BlogSection(props: BlogSectionProps & ComponentMeta) {
  const {
    heading,
    posts = [],
    columns,
    variant = "grid",
    masonry = false,
    categoryFilter = false,
    animation = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { ref: animRef, className: animClass, visible } = useScrollAnimation(animation);

  // Derive unique categories from posts
  const categories = useCallback(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["All", ...Array.from(cats)];
  }, [posts])();

  const filtered = categoryFilter
    ? activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory)
    : posts;

  // Stagger delay for children
  const staggerDelay = (i: number) =>
    animation === "stagger-fade" ? { transitionDelay: `${i * 80}ms` } : {};

  const cardClasses =
    `group ${ds.card.base} overflow-hidden ${ds.card.hover}`;

  const renderCard = (post: (typeof posts)[0], i: number) => (
    <a
      key={i}
      href={post.href}
      className={cardClasses}
      style={staggerDelay(i)}
    >
      {post.imageUrl && (
        <div className="overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {post.date && (
            <span className="text-sm text-muted-foreground">{post.date}</span>
          )}
          {post.category && categoryFilter && (
            <span className={`text-xs ${ds.accent.badge}`}>
              {post.category}
            </span>
          )}
        </div>
        <h3 className={`${ds.typography.h3} tracking-tight mb-2 group-hover:text-primary transition`}>
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </a>
  );

  // Determine layout mode
  const isCarousel = variant === "carousel";
  const isMasonry = masonry && !isCarousel;

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative overflow-hidden ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div className={`${ds.containerWidth} mx-auto`}>
        <h2 className={`${ds.typography.h2} text-center mb-6`}>
          {heading}
        </h2>

        {/* Category filter tabs */}
        {categoryFilter && categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div
          ref={animRef}
          className={`transition-all duration-500 ease-out ${animClass}`}
        >
          {/* Carousel layout */}
          {isCarousel && (
            <div
              className="carousel-scroll flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 px-6 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
              {filtered.map((post, i) => (
                <div
                  key={i}
                  className="snap-center shrink-0 w-[85%] md:w-[45%] lg:w-[30%]"
                >
                  {renderCard(post, i)}
                </div>
              ))}
            </div>
          )}

          {/* Masonry layout */}
          {isMasonry && (
            <div
              className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
            >
              {filtered.map((post, i) => (
                <div
                  key={i}
                  className="break-inside-avoid"
                  style={{
                    ...(visible ? {} : { opacity: 0, transform: "translateY(16px)" }),
                    transition: `opacity 500ms ease-out ${i * 80}ms, transform 500ms ease-out ${i * 80}ms`,
                    ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}),
                  }}
                >
                  {renderCard(post, i)}
                </div>
              ))}
            </div>
          )}

          {/* Default grid layout */}
          {!isCarousel && !isMasonry && (
            <div
              className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${
                columns >= 3 ? "lg:grid-cols-3" : ""
              } ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
            >
              {filtered.map((post, i) => renderCard(post, i))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
