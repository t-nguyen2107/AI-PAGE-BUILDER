/**
 * Reverse migration: Puck Data → old DOMNode tree format
 * Used for backward compatibility with existing revisions.
 * This is a temporary file — will be deleted when old types are removed.
 */

import type { Data } from "@puckeditor/core";
import { generateId } from "@/lib/id";

/**
 * Convert Puck Data back to old PageNode format.
 * Uses `unknown` casts because old DOM types have many required fields
 * that are irrelevant for this lossy conversion.
 */
export function puckToDom(data: Data): unknown {
  const children = (data.content ?? []).map((component) => {
    const props = component.props as Record<string, unknown>;

    // Build minimal children array from props
    const containerChildren: unknown[] = [];
    if (props.heading) {
      containerChildren.push({
        id: generateId(),
        type: "component",
        tag: "h2",
        children: [
          {
            id: generateId(),
            type: "element",
            tag: "span",
            children: [
              { type: "item", text: String(props.heading), tag: "span", id: generateId(), styles: {}, attributes: {} },
            ],
            styles: {},
            attributes: {},
          },
        ],
        styles: {},
        attributes: {},
      });
    }

    return {
      id: (props.id as string) || generateId(),
      type: "section",
      tag: "section",
      children: [
        {
          id: generateId(),
          type: "container",
          tag: "div",
          children: containerChildren,
          layout: { display: "flex", flexDirection: "column" },
          styles: {},
          attributes: {},
        },
      ],
      layout: { display: "flex", flexDirection: "column" },
      meta: { sectionName: component.type },
      styles: {},
      attributes: {},
    };
  });

  return {
    id: generateId(),
    type: "page",
    tag: "main",
    name:
      (data.root?.props as Record<string, unknown>)?.title as string ??
      "Untitled Page",
    children,
    meta: {
      title:
        (data.root?.props as Record<string, unknown>)?.title as string ??
        "Untitled Page",
      slug: "",
    },
    styleguideId: "",
    globalSectionIds: [],
    styles: {},
    attributes: {},
  };
}

/**
 * Check if data is in Puck format (has root + content)
 */
export function isPuckData(data: unknown): data is Data {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return "root" in d && "content" in d && Array.isArray(d.content);
}
