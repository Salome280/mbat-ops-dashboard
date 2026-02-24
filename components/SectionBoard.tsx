"use client";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import {
  AnyTask,
  SponsorshipPipelineStage,
  SponsorshipTask,
  TaskPriority,
  TaskSection,
  TaskStatus
} from "@/types/tasks";
import { useMemo, useState } from "react";

type BoardSection = Exclude<TaskSection, "Dashboard Summary">;

type ViewMode = "kanban" | "table";

interface SectionBoardProps {
  section: BoardSection;
  tasks: AnyTask[];
  onUpsertTask: (task: AnyTask) => void;
  onDeleteTask: (task: AnyTask) => void;
  onMoveTask: (
    taskId: string,
    section: BoardSection,
    targetColumn: TaskStatus | SponsorshipPipelineStage
  ) => void;
}

const STATUS_COLUMNS: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Completed"
];

const PIPELINE_COLUMNS: SponsorshipPipelineStage[] = [
  "Identified",
  "Contacted",
  "Followed Up",
  "Call Scheduled",
  "Proposal Sent",
  "Negotiating",
  "Confirmed",
  "Lost"
];

const priorityBadgeClasses: Record<TaskPriority, string> = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-sky-100 text-sky-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700"
};

const formatDateInput = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const formatShortDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
};

const KanbanColumn: React.FC<{
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}> = ({ id, title, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[220px] flex-1 flex-col rounded-xl border border-dashed ${
        isOver ? "border-accent bg-red-50/40" : "border-gray-200 bg-gray-50/60"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-500">
          {count}
        </span>
      </div>
      <div className="space-y-2 px-2 pb-2 pt-1">{children}</div>
    </div>
  );
};

const KanbanCard: React.FC<{
  task: AnyTask;
  onClick: () => void;
}> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined
      }}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border bg-white p-2.5 text-xs shadow-sm transition ${
        isDragging ? "border-accent shadow-md ring-1 ring-accent/40" : "border-gray-200"
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[13px] font-medium text-gray-900">
          {task.title || "(Untitled task)"}
        </p>
      </div>
      {task.section === "Sponsorship" && (task as SponsorshipTask).company && (
        <p className="mb-1 text-[11px] text-gray-500">
          {(task as SponsorshipTask).company}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
            priorityBadgeClasses[task.priority]
          }`}
        >
          {task.priority}
        </span>
        <span className="text-[10px] text-gray-400">
          {formatShortDate(task.deadline)}
        </span>
      </div>
    </div>
  );
};

interface TaskModalProps {
  open: boolean;
  mode: "add" | "edit";
  section: BoardSection;
  initialTask?: AnyTask | null;
  onClose: () => void;
  onSave: (task: AnyTask) => void;
  onDelete?: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  mode,
  section,
  initialTask,
  onClose,
  onSave,
  onDelete
}) => {
  const isSponsorship = section === "Sponsorship";
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [owner, setOwner] = useState(initialTask?.owner ?? "");
  const [deadline, setDeadline] = useState(formatDateInput(initialTask?.deadline));
  const [status, setStatus] = useState<TaskStatus>(
    (initialTask?.status as TaskStatus) ?? "Not Started"
  );
  const [priority, setPriority] = useState<TaskPriority>(
    (initialTask?.priority as TaskPriority) ?? "Medium"
  );
  const [notes, setNotes] = useState(initialTask?.notes ?? "");

  const [pipelineStage, setPipelineStage] = useState<SponsorshipPipelineStage>(
    (initialTask as SponsorshipTask | undefined)?.pipelineStage ??
      "Identified"
  );
  const [company, setCompany] = useState(
    (initialTask as SponsorshipTask | undefined)?.company ?? ""
  );
  const [contactName, setContactName] = useState(
    (initialTask as SponsorshipTask | undefined)?.contactName ?? ""
  );
  const [dealValue, setDealValue] = useState<string>(
    (initialTask as SponsorshipTask | undefined)?.dealValue?.toString() ?? ""
  );
  const [probability, setProbability] = useState<string>(
    (initialTask as SponsorshipTask | undefined)?.probability?.toString() ?? "0"
  );
  const [lastContacted, setLastContacted] = useState(
    formatDateInput((initialTask as SponsorshipTask | undefined)?.lastContacted)
  );
  const [nextFollowUp, setNextFollowUp] = useState(
    formatDateInput((initialTask as SponsorshipTask | undefined)?.nextFollowUp)
  );
  const [source, setSource] = useState(
    (initialTask as SponsorshipTask | undefined)?.source ?? ""
  );
  const [stageNotes, setStageNotes] = useState(
    (initialTask as SponsorshipTask | undefined)?.stageNotes ?? ""
  );

  const [errors, setErrors] = useState<{ title?: string; probability?: string }>(
    {}
  );

  if (!open) return null;

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }

    let probNumber = 0;
    if (isSponsorship) {
      probNumber = Number(probability || 0);
      if (Number.isNaN(probNumber) || probNumber < 0 || probNumber > 100) {
        newErrors.probability = "Probability must be between 0 and 100.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const nowIso = new Date().toISOString();
    const base: AnyTask = {
      id: initialTask?.id ?? crypto.randomUUID(),
      section,
      title: title.trim(),
      description: description.trim() || undefined,
      owner: owner.trim() || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status,
      priority,
      notes: notes.trim() || undefined,
      createdAt: initialTask?.createdAt ?? nowIso,
      updatedAt: nowIso
    };

    if (isSponsorship) {
      const dealValueNumber = Number(dealValue || 0);
      const expectedRevenue = (dealValueNumber * probNumber) / 100;
      const sponsorshipTask: SponsorshipTask = {
        ...(base as any),
        section: "Sponsorship",
        pipelineStage,
        dealValue: dealValueNumber,
        contactName: contactName.trim(),
        probability: probNumber,
        expectedRevenue,
        company: company.trim(),
        lastContacted: lastContacted
          ? new Date(lastContacted).toISOString()
          : null,
        nextFollowUp: nextFollowUp
          ? new Date(nextFollowUp).toISOString()
          : null,
        source: source.trim() || undefined,
        stageNotes: stageNotes.trim() || undefined
      };
      onSave(sponsorshipTask);
    } else {
      onSave(base);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {mode === "add" ? "Add task" : "Edit task"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {section} &middot;{" "}
              {isSponsorship ? "Sponsorship pipeline" : "Status workflow"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>×
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Owner
              </label>
              <input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                placeholder="Person or team"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              >
                {STATUS_COLUMNS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              >
                {(["Low", "Medium", "High", "Critical"] as TaskPriority[]).map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSponsorship && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                    placeholder="Sponsor company"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Contact name
                  </label>
                  <input
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                    placeholder="Primary contact"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Pipeline stage
                  </label>
                  <select
                    value={pipelineStage}
                    onChange={e =>
                      setPipelineStage(e.target.value as SponsorshipPipelineStage)
                    }
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  >
                    {PIPELINE_COLUMNS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Deal value (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={probability}
                    onChange={e => setProbability(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  />
                  {errors.probability && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.probability}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Last contacted
                  </label>
                  <input
                    type="date"
                    value={lastContacted}
                    onChange={e => setLastContacted(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Next follow-up
                  </label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={e => setNextFollowUp(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    Source
                  </label>
                  <input
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                    placeholder="Inbound, intro, etc."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700">
                  Stage notes
                </label>
                <textarea
                  value={stageNotes}
                  onChange={e => setStageNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
                  placeholder="Negotiation details, blockers, etc."
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
              placeholder="Context, acceptance criteria, etc."
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Notes (internal)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs outline-none ring-accent/30 focus:border-accent focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
          {mode === "edit" && onDelete && (
            <button
              onClick={onDelete}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete task
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
            >
              {mode === "add" ? "Create task" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SectionBoard: React.FC<SectionBoardProps> = ({
  section,
  tasks,
  onUpsertTask,
  onDeleteTask,
  onMoveTask
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AnyTask | null>(null);

  const isSponsorship = section === "Sponsorship";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const targetColumn = over.id as string;
    onMoveTask(
      taskId,
      section,
      targetColumn as TaskStatus | SponsorshipPipelineStage
    );
  };

  const columns = isSponsorship ? PIPELINE_COLUMNS : STATUS_COLUMNS;

  const tasksByColumn = useMemo(() => {
    const map: Record<string, AnyTask[]> = {};
    columns.forEach(c => {
      map[c] = [];
    });
    tasks.forEach(task => {
      const key = isSponsorship
        ? (task as SponsorshipTask).pipelineStage
        : task.status;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks, columns, isSponsorship]);

  const handleAddClick = () => {
    setEditingTask(null);
    setAddOpen(true);
  };

  const handleEdit = (task: AnyTask) => {
    setEditingTask(task);
    setAddOpen(false);
  };

  const title = section;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-xs text-gray-500">
            {isSponsorship
              ? "Manage the sponsorship pipeline and revenue."
              : "Track work items and unblock the team."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-gray-100 p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-full px-2 py-1 ${
                viewMode === "kanban"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-full px-2 py-1 ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Table
            </button>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
          >
            <span>+ Add task</span>
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
            {columns.map(column => (
              <KanbanColumn
                key={column}
                id={column}
                title={column}
                count={tasksByColumn[column]?.length ?? 0}
              >
                {(tasksByColumn[column] ?? []).map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => handleEdit(task)}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="max-h-[480px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Task</th>
                  {isSponsorship && (
                    <>
                      <th className="px-3 py-2 text-left">Company</th>
                      <th className="px-3 py-2 text-left">Contact</th>
                    </>
                  )}
                  <th className="px-3 py-2 text-left">
                    {isSponsorship ? "Stage" : "Status"}
                  </th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Deadline</th>
                  {isSponsorship && (
                    <>
                      <th className="px-3 py-2 text-right">Deal</th>
                      <th className="px-3 py-2 text-right">Prob.</th>
                      <th className="px-3 py-2 text-right">Expected</th>
                      <th className="px-3 py-2 text-left">Next F/U</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-xs">
                {tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={isSponsorship ? 11 : 6}
                      className="px-3 py-6 text-center text-xs text-gray-500"
                    >
                      No tasks yet. Use &ldquo;Add task&rdquo; to create one.
                    </td>
                  </tr>
                )}
                {tasks.map(task => {
                  const sponsorship = task as SponsorshipTask;
                  return (
                    <tr
                      key={task.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEdit(task)}
                    >
                      <td className="max-w-[220px] truncate px-3 py-2 text-gray-900">
                        {task.title}
                      </td>
                      {isSponsorship && (
                        <>
                          <td className="px-3 py-2 text-gray-700">
                            {sponsorship.company || "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {sponsorship.contactName || "—"}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-gray-700">
                        {isSponsorship
                          ? sponsorship.pipelineStage
                          : task.status}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            priorityBadgeClasses[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {task.owner || "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {formatShortDate(task.deadline)}
                      </td>
                      {isSponsorship && (
                        <>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {sponsorship.dealValue
                              ? sponsorship.dealValue.toLocaleString("en-US", {
                                  maximumFractionDigits: 0
                                })
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {sponsorship.probability
                              ? `${sponsorship.probability}%`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {sponsorship.expectedRevenue
                              ? sponsorship.expectedRevenue.toLocaleString(
                                  "en-US",
                                  { maximumFractionDigits: 0 }
                                )
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {formatShortDate(sponsorship.nextFollowUp)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TaskModal
        open={addOpen}
        mode="add"
        section={section}
        onClose={() => setAddOpen(false)}
        onSave={onUpsertTask}
      />

      <TaskModal
        open={!!editingTask}
        mode="edit"
        section={section}
        initialTask={editingTask ?? undefined}
        onClose={() => setEditingTask(null)}
        onSave={onUpsertTask}
        onDelete={
          editingTask
            ? () => {
                onDeleteTask(editingTask);
                setEditingTask(null);
              }
            : undefined
        }
      />
    </div>
  );
};
