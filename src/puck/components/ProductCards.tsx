"use client";

import { useState } from "react";
import type { ProductCardsProps, ProductCard, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-tertiary" : "text-muted-foreground/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function QuickViewModal({
  product,
  onClose,
}: {
  product: ProductCard;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-video object-cover rounded-lg mb-4"
          />
        )}

        {product.description && (
          <p className="text-muted-foreground mb-3">{product.description}</p>
        )}

        {product.rating != null && (
          <div className="mb-3">
            <StarRating rating={product.rating} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {product.inStock === false && (
          <p className="text-sm text-error mb-4">Out of Stock</p>
        )}

        <div className="flex gap-3">
          {product.inStock !== false && (
            <a
              href={product.href}
              className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              View Product
            </a>
          )}
          <button
            onClick={onClose}
            className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold border border-border text-foreground hover:bg-muted transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCards(props: ProductCardsProps & ComponentMeta) {
  const {
    heading,
    columns,
    products = [],
    quickView = false,
    saleBadge = false,
    hoverEffect = "none",
    animation = "stagger-fade",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation);

  // Stagger delay for product cards
  const staggerDelay = (i: number) =>
    animation === "stagger-fade" ? { transitionDelay: `${i * 80}ms` } : {};

  const [quickViewIndex, setQuickViewIndex] = useState<number | null>(null);

  const hoverClasses: Record<string, string> = {
    none: "",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    zoom: "hover:scale-[1.02]",
  };
  const hoverClass = hoverClasses[hoverEffect] ?? "";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Subtle decorative background */}
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div
        ref={anim.ref}
        className={`${ds.containerWidth} mx-auto relative transition-all duration-700 ease-out ${anim.className}`}
      >
        {heading && (
          <h2 className={`${ds.typography.h2} text-center mb-12`}>
            {heading}
          </h2>
        )}
        <div
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
        >
          {products.map((product, i) => (
            <div
              key={i}
              className={`group ${ds.card.base} overflow-hidden ${ds.card.hover} transition-all duration-500 ${hoverClass} ${
                product.inStock === false ? "opacity-60" : ""
              }`}
              style={staggerDelay(i)}
            >
              {product.imageUrl && (
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 text-xs font-semibold ${ds.accent.badge}`}>
                      {product.badge}
                    </span>
                  )}
                  {saleBadge && product.originalPrice && !product.badge && (
                    <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-semibold px-2.5 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                  {quickView && (
                    <button
                      onClick={() => setQuickViewIndex(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
                      aria-label={`Quick view ${product.name}`}
                    >
                      <span className="bg-background text-foreground text-sm font-medium px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        Quick View
                      </span>
                    </button>
                  )}
                </div>
              )}
              {!product.imageUrl && (product.badge || (saleBadge && product.originalPrice)) && (
                <div className="relative">
                  <div className="w-full aspect-video bg-muted" />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 text-xs font-semibold ${ds.accent.badge}`}>
                      {product.badge}
                    </span>
                  )}
                  {saleBadge && product.originalPrice && !product.badge && (
                    <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-semibold px-2.5 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                </div>
              )}
              <div className="p-5">
                <h3 className={`${ds.typography.h3} mb-1 group-hover:text-primary transition`}>
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}
                {product.rating != null && (
                  <div className="mb-3">
                    <StarRating rating={product.rating} />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-primary">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
                {product.inStock === false ? (
                  <span className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold border border-border text-muted-foreground cursor-not-allowed">
                    Out of Stock
                  </span>
                ) : (
                  <a
                    href={product.href}
                    className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold border border-border text-foreground hover:bg-muted transition"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {quickViewIndex !== null && products[quickViewIndex] && (
        <QuickViewModal
          product={products[quickViewIndex]}
          onClose={() => setQuickViewIndex(null)}
        />
      )}
    </section>
  );
}
