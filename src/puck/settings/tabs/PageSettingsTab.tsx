"use client";

export function PageSettingsTab({
  value,
  onChange,
}: {
  value: { title: string; slug: string };
  onChange: (val: { title: string; slug: string }) => void;
}) {
  const update = (key: "title" | "slug", val: string) => {
    const updated = { ...value, [key]: val };
    // Auto-generate slug from title if slug hasn't been manually edited
    if (key === "title" && value.slug === slugify(value.title)) {
      updated.slug = slugify(val);
    }
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Page Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="Page title"
        />
      </div>
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Slug</label>
        <input
          type="text"
          value={value.slug}
          onChange={(e) => onChange({ ...value, slug: e.target.value })}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="page-slug"
        />
      </div>
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
