"use client";

import { useState } from "react";
import type { GalleryProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function Gallery(props: GalleryProps & ComponentMeta) {
  const {
    heading,
    columns,
    images = [],
    variant = "grid",
    lightbox = false,
    hoverEffect = "none",
    className,
    ...metaRest
  } = props;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // ─── Hover wrapper classes ──────────────────────────────────────
  function getImageWrapperClass(): string {
    const base = "group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer";
    if (hoverEffect === "zoom") return `${base}`;
    if (hoverEffect === "overlay") return `${base}`;
    return "relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300";
  }

  function getImageClass(): string {
    const base = "w-full transition-transform duration-500";
    if (hoverEffect === "zoom") return `${base} group-hover:scale-105`;
    return base;
  }

  function getOverlayClass(img: { caption?: string }): string {
    if (hoverEffect !== "overlay") return "";
    if (img.caption) {
      return "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 rounded-2xl";
    }
    return "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl";
  }

  // ─── Single image card ──────────────────────────────────────────
  function ImageCard({ img, index }: { img: { src: string; alt: string; caption?: string }; index: number }) {
    return (
      <div
        className={getImageWrapperClass()}
        onClick={() => lightbox && setLightboxIndex(index)}
      >
        <img
          src={img.src}
          alt={img.alt}
          className={getImageClass()}
          loading="lazy"
        />
        {hoverEffect === "overlay" && (
          <div className={getOverlayClass(img)}>
            {img.caption && (
              <p className="text-white text-sm font-medium">{img.caption}</p>
            )}
          </div>
        )}
        {hoverEffect !== "overlay" && img.caption && variant === "grid" && (
          <figcaption className="mt-2 text-sm text-muted-foreground text-center">
            {img.caption}
          </figcaption>
        )}
      </div>
    );
  }

  // ─── Lightbox overlay ───────────────────────────────────────────
  const lightboxOverlay =
    lightboxIndex !== null ? (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={() => setLightboxIndex(null)}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-white/80"
          onClick={() => setLightboxIndex(null)}
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        {lightboxIndex > 0 && (
          <button
            className="absolute left-4 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(lightboxIndex - 1);
            }}
          >
            <span className="material-symbols-outlined text-3xl">
              chevron_left
            </span>
          </button>
        )}

        <img
          src={images[lightboxIndex].src}
          alt={images[lightboxIndex].alt}
          className="max-w-[90vw] max-h-[85vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {lightboxIndex < images.length - 1 && (
          <button
            className="absolute right-4 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(lightboxIndex + 1);
            }}
          >
            <span className="material-symbols-outlined text-3xl">
              chevron_right
            </span>
          </button>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {lightboxIndex + 1} / {images.length}
        </div>
      </div>
    ) : null;

  // ─── Variant rendering ──────────────────────────────────────────
  const imageContent =
    variant === "masonry" ? (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <div key={i} className="break-inside-avoid">
            <ImageCard img={img} index={i} />
          </div>
        ))}
      </div>
    ) : variant === "carousel" ? (
      <div
        className="carousel-scroll flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
        {images.map((img, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[85%] md:w-[45%] lg:w-[30%]"
          >
            <ImageCard img={img} index={i} />
          </div>
        ))}
      </div>
    ) : (
      // Grid (default)
      <div
        className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${
          columns >= 3 ? "lg:grid-cols-3" : ""
        } ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
      >
        {images.map((img, i) => (
          <figure key={i}>
            <ImageCard img={img} index={i} />
          </figure>
        ))}
      </div>
    );

  return (
    <section
      className={`w-full py-24 px-6 bg-background text-foreground relative ${
        className ?? ""
      }`}
      style={extractStyleProps(metaRest)}
    >
      {/* Subtle decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
            {heading}
          </h2>
        )}
        {imageContent}
      </div>
      {lightboxOverlay}
    </section>
  );
}
