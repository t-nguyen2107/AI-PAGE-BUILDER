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
    if (key === "title" && value.slug === slugify(value.title)) {
      updated.slug = slugify(val);
    }
    onChange(updated);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-900">Page Info</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Basic page information</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">Page Title</label>
            <input
              type="text"
              value={value.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              placeholder="Page title"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">Slug</label>
            <input
              type="text"
              value={value.slug}
              onChange={(e) => onChange({ ...value, slug: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              placeholder="page-slug"
            />
            <div className="text-[11px] mt-1 text-gray-400">URL: /{value.slug || "page-slug"}</div>
          </div>
        </div>
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
