"use client";

import { useState } from "react";
import type { FAQSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function FAQSection(props: FAQSectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    items,
    accordion = true,
    columns = 1,
    searchable = false,
    className,
    ...metaRest
  } = props;

  const [searchQuery, setSearchQuery] = useState("");

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
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className={columns === 2 ? "max-w-5xl mx-auto" : "max-w-3xl mx-auto"}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        )}

        <div className={`grid ${gridClass}`}>
          {filteredItems.map((item, i) => {
            if (accordion) {
              return (
                <details
                  key={i}
                  className="group border border-border rounded-lg overflow-hidden"
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
                  className="p-5 rounded-lg border border-border bg-card"
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
