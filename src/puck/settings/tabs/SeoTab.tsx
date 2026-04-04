"use client";

interface SeoData {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export function SeoTab({
  value,
  onChange,
}: {
  value: SeoData;
  onChange: (val: SeoData) => void;
}) {
  const update = (key: keyof SeoData, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  const titleLen = (value.seoTitle || "").length;
  const descLen = (value.seoDescription || "").length;

  return (
    <div className="space-y-4">
      {/* Meta Title */}
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Meta Title</label>
        <input
          type="text"
          value={value.seoTitle || ""}
          onChange={(e) => update("seoTitle", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="Page title for search engines"
          maxLength={100}
        />
        <div className={`text-[10px] mt-0.5 ${titleLen > 60 ? "text-amber-500" : "text-gray-400"}`}>
          {titleLen}/60 characters {titleLen > 60 ? "(recommended max)" : ""}
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Meta Description</label>
        <textarea
          value={value.seoDescription || ""}
          onChange={(e) => update("seoDescription", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-h-[80px] resize-y"
          placeholder="Brief description for search results"
          maxLength={300}
        />
        <div className={`text-[10px] mt-0.5 ${descLen > 160 ? "text-amber-500" : "text-gray-400"}`}>
          {descLen}/160 characters {descLen > 160 ? "(recommended max)" : ""}
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Keywords</label>
        <input
          type="text"
          value={value.seoKeywords || ""}
          onChange={(e) => update("seoKeywords", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="keyword1, keyword2, keyword3"
        />
        <div className="text-[10px] mt-0.5 text-gray-400">Comma-separated keywords</div>
      </div>

      {/* Search Preview */}
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div className="text-[10px] text-gray-500 font-medium mb-1.5">Search Preview</div>
        <div className="text-[13px] text-blue-700 font-medium leading-tight truncate">
          {value.seoTitle || "Page Title"}
        </div>
        <div className="text-[11px] text-green-700 truncate mt-0.5">example.com/</div>
        <div className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
          {value.seoDescription || "A brief description of the page content will appear here."}
        </div>
      </div>
    </div>
  );
}
