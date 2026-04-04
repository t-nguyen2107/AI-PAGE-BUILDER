"use client";

import { useState } from "react";
import type { FAQSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function FAQSection(props: FAQSectionProps & ComponentMeta) {
  const { heading, subtext, items, className, ...metaRest } = props;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtext}
            </p>
          )}
        </div>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold hover:bg-muted/50 transition"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{item.question}</span>
                  <span
                    className={`ml-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    &#9660;
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
