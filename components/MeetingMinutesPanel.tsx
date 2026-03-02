"use client";

import { useState } from "react";
import type { MeetingSection } from "@/types/meetingMinutes";
import { useMeetingMinutes } from "@/hooks/useMeetingMinutes";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const dateInputValue = (iso?: string) => {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

interface Props {
  section: MeetingSection;
}

export const MeetingMinutesPanel: React.FC<Props> = ({ section }) => {
  const { minutes, addMinute, updateMinute, deleteMinute } =
    useMeetingMinutes(section);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formDate, setFormDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [formTitle, setFormTitle] = useState("");
  const [formAttendees, setFormAttendees] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTitle("");
    setFormAttendees("");
    setFormNotes("");
    setEditingId(null);
    setShowForm(false);
  };

  const startAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (id: string) => {
    const m = minutes.find(x => x.id === id);
    if (!m) return;
    setEditingId(id);
    setFormDate(dateInputValue(m.date));
    setFormTitle(m.title);
    setFormAttendees(m.attendees ?? "");
    setFormNotes(m.notes);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingId) {
      updateMinute(editingId, {
        date: new Date(formDate).toISOString(),
        title: formTitle.trim(),
        attendees: formAttendees.trim() || undefined,
        notes: formNotes.trim()
      });
    } else {
      addMinute({
        section,
        date: new Date(formDate).toISOString(),
        title: formTitle.trim(),
        attendees: formAttendees.trim() || undefined,
        notes: formNotes.trim()
      });
    }

    resetForm();
  };

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Meeting Minutes
        </h2>
        {!showForm && (
          <button
            onClick={startAdd}
            className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
          >
            + Add meeting minutes
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Title
              </label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Meeting topic"
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Attendees
            </label>
            <input
              value={formAttendees}
              onChange={e => setFormAttendees(e.target.value)}
              placeholder="Names, separated by commas"
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={4}
              placeholder="Key decisions, action items, etc."
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
            >
              {editingId ? "Save changes" : "Add"}
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

      {minutes.length === 0 && !showForm && (
        <p className="text-xs text-gray-500">No meeting minutes yet.</p>
      )}

      {minutes.map(m => (
        <div
          key={m.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{m.title}</p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {formatDate(m.date)}
                {m.attendees && <span className="ml-2">· {m.attendees}</span>}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEdit(m.id)}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMinute(m.id)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
          {m.notes && (
            <p className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
              {m.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
