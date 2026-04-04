"use client";

import { useState, useEffect, useRef, useCallback, DragEvent } from "react";
import { cn } from "@/lib/utils";

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
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={cn(
        'bg-surface-lowest rounded-2xl shadow-2xl w-150 max-h-[80vh]',
        'flex flex-col overflow-hidden animate-scaleIn'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/50">
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/50">
          {(["stock", "uploads", "upload"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold transition-colors',
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {t === "stock" ? "Stock Library" : t === "uploads" ? "My Uploads" : "Upload New"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-85">
          {/* Stock Library */}
          {tab === "stock" && (
            <div className="flex h-full">
              <div className="w-28 border-r border-outline-variant/30 overflow-y-auto py-1 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-[11px] capitalize transition-colors',
                      selectedCategory === cat
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-3">
                {stockLoading ? (
                  <div className="flex items-center justify-center h-40 text-xs text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {currentImages.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => { onSelect(url); onClose(); }}
                        className="group aspect-square rounded-lg border border-outline-variant overflow-hidden hover:border-primary/50 hover:ring-2 hover:ring-primary/20 transition-all"
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
                <div className="flex items-center justify-center h-40 text-xs text-on-surface-variant">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                </div>
              ) : uploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-on-surface-outline text-xl">folder_open</span>
                  </div>
                  <span className="text-xs font-medium">No uploads yet</span>
                  <span className="text-[10px] text-on-surface-outline mt-1">Upload files to see them here</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => { onSelect(item.url); onClose(); }}
                      className="group aspect-square rounded-lg border border-outline-variant overflow-hidden hover:border-primary/50 hover:ring-2 hover:ring-primary/20 transition-all relative"
                    >
                      {item.type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant">
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
                className={cn(
                  'py-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all',
                  dragOver
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                )}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-sm font-medium">Uploading & converting...</span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl mb-2 block mx-auto">cloud_upload</span>
                    <div className="text-sm font-medium">Drop file here or click to browse</div>
                    <div className="text-[10px] text-on-surface-outline mt-1">
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
  const icon = type === "video" ? "videocam" : type === "audio" ? "audio_file" : "description";
  return <span className="material-symbols-outlined text-xl">{icon}</span>;
}
