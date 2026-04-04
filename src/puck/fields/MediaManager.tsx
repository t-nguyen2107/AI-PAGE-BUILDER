"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type StockImages = Record<string, string[]>;

export function MediaManager({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [tab, setTab] = useState<"stock" | "upload">("stock");
  const [stockImages, setStockImages] = useState<StockImages>({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch stock images
  useEffect(() => {
    if (!open || tab !== "stock") return;
    setLoading(true);
    fetch("/api/media/stock")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setStockImages(res.data);
          const cats = Object.keys(res.data);
          if (cats.length && !selectedCategory) setSelectedCategory(cats[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [open, tab, selectedCategory]);

  // Load uploaded images from localStorage
  useEffect(() => {
    if (!open || tab !== "upload") return;
    try {
      const saved = localStorage.getItem("puck-uploaded-images");
      if (saved) setUploadedImages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [open, tab]);

  const saveUploaded = useCallback((images: string[]) => {
    setUploadedImages(images);
    try { localStorage.setItem("puck-uploaded-images", JSON.stringify(images)); } catch { /* ignore */ }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        saveUploaded([json.data.url, ...uploadedImages]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!open) return null;

  const categories = Object.keys(stockImages);
  const currentImages = selectedCategory ? stockImages[selectedCategory] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Media Manager</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab("stock")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              tab === "stock"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stock Library
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              tab === "upload"
                ? "text-indigo-600 border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {tab === "stock" && (
            <div className="flex h-full">
              {/* Category sidebar */}
              <div className="w-28 border-r border-gray-100 overflow-y-auto py-1 flex-shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] capitalize transition-colors ${
                      selectedCategory === cat
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Image grid */}
              <div className="flex-1 p-3">
                {loading ? (
                  <div className="flex items-center justify-center h-40 text-xs text-gray-400">Loading...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {currentImages.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => { onSelect(url); onClose(); }}
                        className="group aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-indigo-400 hover:ring-2 hover:ring-indigo-200 transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "upload" && (
            <div className="p-4 space-y-3">
              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Click to upload or drag & drop"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

              {/* Uploaded images */}
              {uploadedImages.length > 0 && (
                <div>
                  <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Your Uploads</div>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => { onSelect(url); onClose(); }}
                        className="group aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-indigo-400 hover:ring-2 hover:ring-indigo-200 transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
