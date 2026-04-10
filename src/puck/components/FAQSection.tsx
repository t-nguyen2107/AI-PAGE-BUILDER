"use client";

import { useState, useCallback, useMemo } from "react";
import type { FAQSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Chevron icon ────────────────────────────────────────────────────
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-out ${
        open ? "rotate-180" : "rotate-0"
      }`}
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Search icon ─────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className="text-muted-foreground shrink-0"
      aria-hidden="true"
    >
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Empty state icon ────────────────────────────────────────────────
function EmptySearchIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className="text-muted-foreground/40 mx-auto mb-3"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" />
      <path d="M29 29L40 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 20H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Highlight matched text ──────────────────────────────────────────
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary/20 text-foreground rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Question number badge ───────────────────────────────────────────
function QuestionBadge({ number }: { number: number }) {
  return (
    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center tabular-nums">
      {number}
    </span>
  );
}

// ─── Accordion item ──────────────────────────────────────────────────
function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  searchQuery,
  designStyle,
}: {
  item: { question: string; answer: string; icon?: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  designStyle?: string;
}) {
  const ds = getDesignTokens(designStyle);

  return (
    <div
      className={[
        "rounded-2xl border overflow-hidden transition-all duration-300 ease-out",
        isOpen
          ? "border-l-[3px] border-l-primary border-border shadow-md bg-muted/30"
          : "border-border bg-transparent hover:bg-muted/20",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl transition-colors duration-200"
        aria-expanded={isOpen}
      >
        {item.icon ? (
          <span className="material-symbols-outlined text-primary shrink-0 text-xl">
            {item.icon}
          </span>
        ) : (
          <QuestionBadge number={index + 1} />
        )}
        <span className={`flex-1 font-semibold ${ds.typography.h3}`}>
          <HighlightedText text={item.question} query={searchQuery} />
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      <div
        className={`transition-all duration-300 ease-out ${
          isOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
        role="region"
      >
        <div className="px-5 pb-4 pl-15 text-muted-foreground leading-relaxed">
          {/* pl-15 = icon/badge width + gap to align text past the badge */}
          <div className="ml-10">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Static item (non-accordion) ─────────────────────────────────────
function StaticItem({
  item,
  index,
  searchQuery,
  designStyle,
}: {
  item: { question: string; answer: string; icon?: string };
  index: number;
  searchQuery: string;
  designStyle?: string;
}) {
  const ds = getDesignTokens(designStyle);

  return (
    <div
      className={`p-5 rounded-2xl border border-border bg-card hover:bg-muted/20 transition-colors duration-200`}
    >
      <h3 className={`font-semibold mb-2 flex items-center gap-3 ${ds.typography.h3}`}>
        {item.icon ? (
          <span className="material-symbols-outlined text-primary shrink-0 text-xl">
            {item.icon}
          </span>
        ) : (
          <QuestionBadge number={index + 1} />
        )}
        <HighlightedText text={item.question} query={searchQuery} />
      </h3>
      <p className="text-muted-foreground leading-relaxed ml-10">
        {item.answer}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const anim = useScrollAnimation(animation);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [items, searchable, searchQuery]);

  const toggleItem = useCallback(
    (index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  const gridClass = columns === 2 ? "md:grid-cols-2 gap-5" : "grid-cols-1 gap-3";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative overflow-hidden ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className={ds.section.decorative} />
        </div>
      )}
      <div
        ref={anim.ref}
        className={`transition-all duration-700 ease-out ${anim.className} ${
          ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl"
            ? columns === 2
              ? "max-w-5xl"
              : "max-w-3xl"
            : ds.containerWidth
        } mx-auto relative`}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg max-w-2xl mx-auto ${ds.typography.body}`}>
              {subtext}
            </p>
          )}
        </div>

        {/* Search */}
        {searchable && (
          <div className="mb-8 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
            />
          </div>
        )}

        {/* Items grid */}
        <div className={`grid ${gridClass}`}>
          {filteredItems.map((item, i) => {
            if (accordion) {
              return (
                <AccordionItem
                  key={i}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => toggleItem(i)}
                  searchQuery={searchQuery}
                  designStyle={designStyle}
                />
              );
            }
            return (
              <StaticItem
                key={i}
                item={item}
                index={i}
                searchQuery={searchQuery}
                designStyle={designStyle}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {searchable && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <EmptySearchIcon />
            <p className="text-muted-foreground font-medium mb-1">
              No matching questions found
            </p>
            <p className="text-muted-foreground/60 text-sm">
              Try a different search term or browse all questions.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors duration-200"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
