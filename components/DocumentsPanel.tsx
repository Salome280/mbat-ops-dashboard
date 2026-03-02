"use client";

import { useState } from "react";
import type { DocumentCategory, DocumentItem, DocumentSection } from "@/types/documents";
import { DOCUMENT_CATEGORIES } from "@/types/documents";
import { useDocuments } from "@/hooks/useDocuments";

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const categoryColors: Record<DocumentCategory, string> = {
  Contract: "bg-violet-100 text-violet-700",
  Invoice: "bg-sky-100 text-sky-700",
  Proposal: "bg-amber-100 text-amber-700",
  Deck: "bg-emerald-100 text-emerald-700",
  Other: "bg-gray-100 text-gray-700"
};

interface Props {
  section: DocumentSection;
}

export const DocumentsPanel: React.FC<Props> = ({ section }) => {
  const { addDocument, deleteDocument, listBySection } = useDocuments();

  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Other");
  const [file, setFile] = useState<File | null>(null);
  const [filterCat, setFilterCat] = useState<DocumentCategory | "All">("All");

  const docs = listBySection(section);
  const filtered =
    filterCat === "All" ? docs : docs.filter(d => d.category === filterCat);

  const resetForm = () => {
    setTitle("");
    setCategory("Other");
    setFile(null);
    setError(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("section", section);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: fd
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      const now = new Date().toISOString();
      const doc: DocumentItem = {
        id: crypto.randomUUID(),
        section,
        title: title.trim(),
        category,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        url: data.url,
        createdAt: now,
        updatedAt: now
      };

      addDocument(doc);
      resetForm();
    } catch {
      setError("Upload failed. Vercel Blob may not be configured.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
        <div className="flex items-center gap-2">
          <select
            value={filterCat}
            onChange={e =>
              setFilterCat(e.target.value as DocumentCategory | "All")
            }
            className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs outline-none focus:border-accent"
          >
            <option value="All">All</option>
            {DOCUMENT_CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
            >
              + Upload
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Title
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document title"
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={e =>
                  setCategory(e.target.value as DocumentCategory)
                }
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              >
                {DOCUMENT_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              File (max 20 MB)
            </label>
            <input
              type="file"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 && !showForm && (
        <p className="text-xs text-gray-500">No documents yet.</p>
      )}

      {filtered.map(doc => (
        <div
          key={doc.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-gray-900">
                {doc.title}
              </p>
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  categoryColors[doc.category]
                }`}
              >
                {doc.category}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {doc.fileName} · {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={doc.url}
              download={doc.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-1 text-xs font-medium text-accent underline hover:bg-red-50"
            >
              Download
            </a>
            <button
              onClick={() => deleteDocument(doc.id)}
              className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
