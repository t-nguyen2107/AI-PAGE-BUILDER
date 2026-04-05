"use client";

import DOMPurify from "isomorphic-dompurify";
import type { CustomSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

// ─── DOMPurify config ──────────────────────────────────────────────────────

const PURIFY_OPTIONS = {
  ALLOWED_TAGS: [
    // Structure
    "div", "section", "article", "main", "header", "footer", "nav", "aside",
    "span", "p", "a", "br", "hr", "pre", "code", "blockquote",
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Lists
    "ul", "ol", "li", "dl", "dt", "dd",
    // Media
    "img", "picture", "source", "svg", "video", "audio", "canvas",
    // Table
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    // Forms (visual only — form tag blocked in FORBID_TAGS)
    "input", "textarea", "select", "option", "button", "label",
    "fieldset", "legend",
    // Inline
    "strong", "em", "b", "i", "u", "s", "small", "sub", "sup", "mark",
    "abbr", "cite", "q", "time", "figure", "figcaption", "details",
    "summary",
    // Style
    "style",
  ],
  ALLOWED_ATTR: [
    "class", "id", "style", "src", "srcset", "alt", "href", "target",
    "rel", "title", "aria-*", "role", "data-*", "width", "height",
    "loading", "decoding", "type", "placeholder", "name", "value",
    "disabled", "readonly", "required", "for", "colspan", "rowspan",
    "scope", "controls", "autoplay", "muted", "loop", "playsinline",
    "poster", "preload", "fill", "viewBox", "xmlns", "d", "cx", "cy",
    "r", "x", "y", "rx", "ry", "stroke", "stroke-width", "stroke-linecap",
    "stroke-linejoin", "fill-rule", "clip-rule", "transform",
    "media", "sizes", "open",
  ],
  FORBID_ATTR: [
    "onclick", "onerror", "onload", "onmouseover", "onmouseout",
    "onfocus", "onblur", "onsubmit", "onchange", "oninput", "onkeydown",
    "onkeyup", "onkeypress",
  ],
  FORBID_TAGS: ["script", "iframe", "object", "embed", "applet", "form"],
};

// ─── CustomSection Component ────────────────────────────────────────────────

export function CustomSection(props: CustomSectionProps & ComponentMeta) {
  const {
    html,
    css,
    preview,
    minHeight = "200px",
    className,
    ...metaRest
  } = props;

  const sectionStyle: React.CSSProperties = {
    minHeight,
    ...extractStyleProps(metaRest),
  };

  // Empty state — show placeholder
  if (!html || html.trim().length === 0) {
    return (
      <section
        className={`w-full flex items-center justify-center border-2 border-dashed border-border/40 rounded-lg bg-muted/20 ${className ?? ""}`}
        style={sectionStyle}
      >
        <div className="text-center py-12 px-6">
          <span
            className="material-symbols-outlined text-3xl text-muted-foreground/40 mb-2"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            code
          </span>
          <p className="text-sm text-muted-foreground/60 font-medium">
            Custom Section
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Add HTML + Tailwind code in the sidebar editor
          </p>
        </div>
      </section>
    );
  }

  // Sanitize HTML
  const cleanHtml = DOMPurify.sanitize(html, PURIFY_OPTIONS);

  return (
    <section
      className={`w-full custom-section ${className ?? ""}`}
      style={sectionStyle}
    >
      {/* Scoped custom CSS */}
      {css && css.trim().length > 0 && (
        <style
          dangerouslySetInnerHTML={{
            __html: scopeCss(css, "custom-section"),
          }}
        />
      )}
      {/* Rendered HTML content */}
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </section>
  );
}

// ─── CSS Scoping ────────────────────────────────────────────────────────────

/**
 * Scope custom CSS rules to a parent class.
 * Prepends `.custom-section ` to every selector.
 * Handles multi-selector rules, @-rules, pseudo-elements, and nested selectors.
 * Blocks dangerous @import rules.
 */
function scopeCss(css: string, scopeClass: string): string {
  // Remove comments
  let cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Block @import (external stylesheet injection)
  cleaned = cleaned.replace(/@import\s+[^;]+;/gi, "/* @import blocked */");

  // Scope selectors inside @media / @supports / @keyframes blocks
  cleaned = cleaned.replace(
    /(@(?:media|supports|keyframes|font-face|container)[^{]*)\{([\s\S]*?)\}\s*\}/g,
    (_match, atRule: string, body: string) => {
      const scopedBody = body.replace(
        /([^{},@][^{},]*)\{/g,
        (_m: string, selectors: string) => {
          return selectors
            .split(",")
            .map((s) => {
              const trimmed = s.trim();
              if (!trimmed) return trimmed;
              if (trimmed.startsWith(`.${scopeClass}`)) return trimmed;
              return `.${scopeClass} ${trimmed}`;
            })
            .join(", ") + " {";
        },
      );
      return `${atRule}{${scopedBody}}`;
    },
  );

  // Scope top-level selectors (not inside @-blocks)
  cleaned = cleaned.replace(
    /([^{}@][^{}]*)\{/g,
    (_match, selectors: string) => {
      const scoped = selectors
        .split(",")
        .map((s) => {
          const trimmed = s.trim();
          if (!trimmed) return trimmed;
          if (trimmed.startsWith(`.${scopeClass}`)) return trimmed;
          return `.${scopeClass} ${trimmed}`;
        })
        .join(", ");
      return `${scoped} {`;
    },
  );

  return cleaned;
}
