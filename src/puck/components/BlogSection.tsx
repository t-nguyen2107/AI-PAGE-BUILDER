"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { BlogSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export function BlogSection(props: BlogSectionProps & ComponentMeta) {
  const {
    heading,
    posts = [],
    columns,
    variant = "grid",
    masonry = false,
    categoryFilter = false,
    animation = "stagger-fade",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const [activeCategory, setActiveCategory] = useState<string>("All");
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
