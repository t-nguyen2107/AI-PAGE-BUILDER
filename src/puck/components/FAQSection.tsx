"use client";

import { useState } from "react";
import type { FAQSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export function FAQSection(props: FAQSectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    items,
    accordion = true,
    columns = 1,
    searchable = false,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const [searchQuery, setSearchQuery] = useState("");
  const anim = useScrollAnimation(animation);

  // Filter items based on search query
  const filteredItems =
    searchable && searchQuery.trim()
      ? items.filter((item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

  const gridClass = columns === 2 ? "md:grid-cols-2 gap-6" : "grid-cols-1 gap-3";

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
      <div
        ref={anim.ref}
        className={`transition-all duration-700 ease-out ${anim.className} ${ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl" ? (columns === 2 ? "max-w-5xl" : "max-w-3xl") : ds.containerWidth} mx-auto relative`}
      >
        <div className="text-center mb-12">
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg max-w-2xl mx-auto ${ds.typography.body}`}>
              {subtext}
            </p>
          )}
        </div>

        {searchable && (
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        )}

        <div className={`grid ${gridClass}`}>
          {filteredItems.map((item, i) => {
            if (accordion) {
              return (
                <details
                  key={i}
                  className="group border border-border rounded-2xl overflow-hidden"
                >
                  <summary className="w-full flex justify-between items-center px-5 py-4 font-semibold cursor-pointer hover:bg-muted/50 transition list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      {item.icon && (
                        <span className="material-symbols-outlined text-primary shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <span>{item.question}</span>
                    </span>
                    <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
                      &#9660;
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              );
            } else {
              // Static mode (non-accordion)
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-border bg-card"
                >
                  <h3 className="font-semibold mb-2 flex items-center gap-3">
                    {item.icon && (
                      <span className="material-symbols-outlined text-primary shrink-0">
                        {item.icon}
                      </span>
                    )}
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              );
            }
          })}
        </div>

        {searchable && filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No questions match your search.
          </div>
        )}
      </div>
    </section>
  );
}
