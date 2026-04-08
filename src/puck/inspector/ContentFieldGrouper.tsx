"use client";

import { Children, useMemo, type ReactNode } from "react";
import { Section } from "./components";
import { getFieldGroups } from "./field-groups";

// ─── Component field name lookup ──────────────────────────────────────
// Import config to derive field names per component type.
// This is lightweight — config is already loaded by PuckEditor.

import { config } from "../puck.config";

function getFieldNames(componentType: string): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comp = (config.components as Record<string, any>)[componentType];
  if (comp?.fields && typeof comp.fields === "object") {
    return Object.keys(comp.fields);
  }
  return [];
}

// ─── ContentFieldGrouper ──────────────────────────────────────────────

interface ContentFieldGrouperProps {
  children: ReactNode;
  componentType: string;
}

export function ContentFieldGrouper({
  children,
  componentType,
}: ContentFieldGrouperProps) {
  const childArray = Children.toArray(children);
  const fieldNames = getFieldNames(componentType);

  // Build grouping plan
  const plan = useMemo(() => {
    if (fieldNames.length === 0 || childArray.length === 0) return null;

    // If Puck gives us exactly as many children as fields, group them 1:1
    if (childArray.length === fieldNames.length) {
      const groups = getFieldGroups(componentType, fieldNames);

      // Build index map: fieldName → childArray index
      const indexMap = new Map<string, number>();
      fieldNames.forEach((name, i) => indexMap.set(name, i));

      return groups.map((g) => ({
        ...g,
        childIndices: g.fields
          .map((f) => indexMap.get(f))
          .filter((i): i is number => i !== undefined),
      }));
    }

    // Mismatch — can't reliably group, fall back to flat
    return null;
  }, [componentType, fieldNames, childArray.length]);

  // No grouping possible — render flat
  if (!plan || plan.length === 0) {
    return <>{children}</>;
  }

  // Render grouped
  return (
    <div className="divide-y divide-gray-100">
      {plan.map((group) => {
        const groupChildren = group.childIndices.map((i) => childArray[i]);
        if (groupChildren.length === 0) return null;

        // Single-group: render flat (no section header wrapper)
        if (plan.length === 1) {
          return <div key={group.title}>{groupChildren}</div>;
        }

        return (
          <Section
            key={group.title}
            title={group.title}
            icon={group.icon}
            defaultOpen
          >
            {groupChildren}
          </Section>
        );
      })}
    </div>
  );
}
