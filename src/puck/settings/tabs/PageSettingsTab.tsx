"use client";

import { CardSection } from "@/components/ui/card-section";
import { Field } from "@/components/ui/field";

export function PageSettingsTab({
  value,
  onChange,
}: {
  value: { title: string; slug: string };
  onChange: (val: { title: string; slug: string }) => void;
}) {
  const update = (key: "title" | "slug", val: string) => {
    const updated = { ...value, [key]: val };
    if (key === "title" && value.slug === slugify(value.title)) {
      updated.slug = slugify(val);
    }
    onChange(updated);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <CardSection
        title="Page Info"
        description="Basic page information"
      >
        <div className="space-y-4">
          <Field
            label="Page Title"
            value={value.title}
            onChange={(v) => update("title", v)}
            placeholder="Page title"
          />
          <div>
            <Field
              label="Slug"
              value={value.slug}
              onChange={(v) => onChange({ ...value, slug: v })}
              placeholder="page-slug"
              monospace
            />
            <div className="text-[11px] mt-1 text-on-surface-outline">URL: /{value.slug || "page-slug"}</div>
          </div>
        </div>
      </CardSection>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
