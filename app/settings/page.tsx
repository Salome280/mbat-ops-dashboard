"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutShell } from "@/components/LayoutShell";
import { useTasksState } from "@/hooks/useTasksState";
import { TaskSection } from "@/types/tasks";

export default function SettingsPage() {
  const {
    settings,
    setRevenueTarget,
    setManualRevenueAdjustment,
    teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useTasksState();
  const router = useRouter();

  const [newMemberName, setNewMemberName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (trimmed) {
      addTeamMember(trimmed);
      setNewMemberName("");
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEdit = () => {
    if (editingId) {
      updateTeamMember(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    }
  };

  return (
    <LayoutShell
      activeSection="Settings"
      onSectionChange={() => router.push("/")}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revenue targets and team members.
          </p>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Revenue Settings
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Revenue Target (€)
              </label>
              <input
                type="number"
                value={settings.revenueTarget}
                onChange={e =>
                  setRevenueTarget(Number(e.target.value) || 0)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Manual Revenue Adjustment
              </label>
              <input
                type="number"
                value={settings.manualRevenueAdjustment}
                onChange={e =>
                  setManualRevenueAdjustment(Number(e.target.value) || 0)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Added to Revenue Secured. Use negative for deductions.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Team Members
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Used in the Owner dropdown when creating or editing tasks.
          </p>

          <ul className="mt-4 space-y-2">
            {teamMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50/50 px-3 py-2"
              >
                {editingId === m.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-accent"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-red-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900">{m.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(m.id, m.name)}
                        className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTeamMember(m.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
            <input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="New member name"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800"
            >
              Add
            </button>
          </form>
        </section>
      </div>
    </LayoutShell>
  );
}
