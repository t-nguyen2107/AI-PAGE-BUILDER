"use client";

import { useState, useEffect, useRef, useCallback, DragEvent } from "react";

type StockImages = Record<string, string[]>;

interface UploadEntry {
  url: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: string;
}

interface MediaManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  projectId?: string;
  acceptTypes?: string;
  title?: string;
}

export function MediaManager({
  open,
  onClose,
  onSelect,
  projectId,
  acceptTypes = "*",
  title = "Media Manager",
}: MediaManagerProps) {
  const [tab, setTab] = useState<"stock" | "uploads" | "upload">("stock");
  const [stockImages, setStockImages] = useState<StockImages>({});
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch stock images
  useEffect(() => {
    if (!open || tab !== "stock") return;
    setStockLoading(true);
    fetch("/api/media/stock")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setStockImages(res.data);
          const cats = Object.keys(res.data);
          if (cats.length && !selectedCategory) setSelectedCategory(cats[0]);
        }
      })
      .finally(() => setStockLoading(false));
  }, [open, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch user uploads
  useEffect(() => {
    if (!open || tab !== "uploads") return;
    setUploadsLoading(true);
    const params = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    fetch(`/api/media/uploads${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUploads(res.data || []);
      })
      .finally(() => setUploadsLoading(false));
  }, [open, tab, projectId]);

  const doUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        onSelect(json.data.url);
        onClose();
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [projectId, onSelect, onClose]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  if (!open) return null;

  const categories = Object.keys(stockImages);
  const currentImages = selectedCategory ? stockImages[selectedCategory] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
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
          {(["stock", "uploads", "upload"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                tab === t
                  ? "text-indigo-600 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "stock" ? "Stock Library" : t === "uploads" ? "My Uploads" : "Upload New"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[340px]">
          {/* Stock Library */}
          {tab === "stock" && (
            <div className="flex h-full">
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
              <div className="flex-1 p-3">
                {stockLoading ? (
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

          {/* My Uploads */}
          {tab === "uploads" && (
            <div className="p-3">
              {uploadsLoading ? (
                <div className="flex items-center justify-center h-40 text-xs text-gray-400">Loading...</div>
              ) : uploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-xs text-gray-400">
                  <svg className="w-8 h-8 mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  No uploads yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => { onSelect(item.url); onClose(); }}
                      className="group aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-indigo-400 hover:ring-2 hover:ring-indigo-200 transition-all relative"
                    >
                      {item.type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                          <FileIcon type={item.type} />
                          <span className="text-[9px] mt-1 truncate w-full px-1 text-center">{item.name}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload New */}
          {tab === "upload" && (
            <div className="p-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                className={`py-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50/50 text-indigo-600"
                    : "border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-sm">Uploading & converting...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                    </svg>
                    <div className="text-sm font-medium">Drop file here or click to browse</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Images auto-convert to WebP. Max 25MB.
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={acceptTypes}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type === "video") {
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l5 3-5 3V9z" />
      </svg>
    );
  }
  if (type === "audio") {
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
