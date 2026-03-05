"use client";

import { useMemo, useState } from "react";
import { AnyTask, SponsorshipTask } from "@/types/tasks";
import { RevenueLineChart } from "@/components/charts/RevenueLineChart";
import { PipelineStageBar } from "@/components/charts/PipelineStageBar";
import { OwnerWorkloadBar } from "@/components/charts/OwnerWorkloadBar";
import {
  computeKpiDeltas,
  getDealValueByStage,
  getOwnerWorkload,
  getRevenueByWeek,
  type KpiDelta,
} from "@/lib/metrics";

interface SummaryProps {
  totalSponsorsConfirmed: number;
  manualSponsorsConfirmedOverride: number | null;
  onManualSponsorsConfirmedOverrideChange: (value: number | null) => void;
  revenueSecured: number;
  revenueTarget: number;
  onRevenueTargetChange: (value: number) => void;
  manualRevenueAdjustment: number;
  onManualRevenueAdjustmentChange: (value: number) => void;
  pipelineExpectedRevenue: number;
  manualPipelineAdjustment: number;
  onManualPipelineAdjustmentChange: (value: number) => void;
  upcomingDeadlines: AnyTask[];
  highPriorityTasks: AnyTask[];
  sponsorshipTasks: SponsorshipTask[];
  allTasks: AnyTask[];
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const DeltaBadge: React.FC<{ delta: KpiDelta }> = ({ delta }) => {
  if (delta.value === null) {
    return (
      <span className="mt-1 inline-block text-[11px] text-gray-400">
        vs last week: N/A
      </span>
    );
  }

  return (
    <span
      className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium ${
        delta.isPositive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      <svg
        viewBox="0 0 12 12"
        className={`h-3 w-3 ${delta.isPositive ? "" : "rotate-180"}`}
        fill="currentColor"
      >
        <path d="M6 3l4 5H2l4-5z" />
      </svg>
      {delta.label} vs last week
    </span>
  );
};

export const SummaryDashboard: React.FC<SummaryProps> = ({
  totalSponsorsConfirmed,
  manualSponsorsConfirmedOverride,
  onManualSponsorsConfirmedOverrideChange,
  revenueSecured,
  revenueTarget,
  onRevenueTargetChange,
  manualRevenueAdjustment,
  onManualRevenueAdjustmentChange,
  pipelineExpectedRevenue,
  manualPipelineAdjustment,
  onManualPipelineAdjustmentChange,
  upcomingDeadlines,
  highPriorityTasks,
  sponsorshipTasks,
  allTasks,
}) => {
  const securedPct =
    revenueTarget > 0
      ? Math.min(100, (revenueSecured / revenueTarget) * 100)
      : 0;
  const pipelinePct =
    revenueTarget > 0
      ? Math.min(100, (pipelineExpectedRevenue / revenueTarget) * 100)
      : 0;

  const deltas = useMemo(
    () => computeKpiDeltas(sponsorshipTasks, allTasks),
    [sponsorshipTasks, allTasks]
  );

  const revenueByWeek = useMemo(
    () => getRevenueByWeek(sponsorshipTasks),
    [sponsorshipTasks]
  );
  const pipelineByStage = useMemo(
    () => getDealValueByStage(sponsorshipTasks),
    [sponsorshipTasks]
  );
  const ownerWorkload = useMemo(
    () => getOwnerWorkload(allTasks),
    [allTasks]
  );

  const [editingSponsors, setEditingSponsors] = useState(false);
  const sponsorsDisplay =
    manualSponsorsConfirmedOverride ?? totalSponsorsConfirmed;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Dashboard Summary
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          High-level view of sponsorship revenue and critical operational work.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Sponsors Confirmed */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Sponsors Confirmed
            </p>
            <button
              type="button"
              onClick={() => setEditingSponsors(true)}
              className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Edit sponsors confirmed"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
          {editingSponsors ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={sponsorsDisplay}
                onChange={(e) =>
                  onManualSponsorsConfirmedOverrideChange(
                    e.target.value === "" ? null : parseInt(e.target.value, 10) || 0
                  )
                }
                onBlur={() => setEditingSponsors(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingSponsors(false);
                }}
                className="w-20 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-2xl font-semibold outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                autoFocus
              />
              {manualSponsorsConfirmedOverride !== null && (
                <button
                  type="button"
                  onClick={() => {
                    onManualSponsorsConfirmedOverrideChange(null);
                    setEditingSponsors(false);
                  }}
                  className="text-[11px] text-gray-500 underline hover:text-gray-700"
                >
                  Use actual
                </button>
              )}
            </div>
          ) : (
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {sponsorsDisplay}
            </p>
          )}
          <DeltaBadge delta={deltas.sponsorsConfirmed} />
        </div>

        {/* Revenue Secured */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Revenue Secured
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(revenueSecured)}
          </p>
          <DeltaBadge delta={deltas.revenueSecured} />
          {manualRevenueAdjustment !== 0 && (
            <p className="mt-1 text-[11px] text-gray-400">
              Includes manual adjustment
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Target{" "}
            <input
              type="number"
              value={revenueTarget}
              onChange={(e) =>
                onRevenueTargetChange(Number(e.target.value) || 0)
              }
              className="w-24 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${securedPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Manual adj:</span>
            <input
              type="number"
              value={manualRevenueAdjustment}
              onChange={(e) =>
                onManualRevenueAdjustmentChange(Number(e.target.value) || 0)
              }
              className="w-20 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>
        </div>

        {/* Pipeline Expected Revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Pipeline Expected Revenue
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(pipelineExpectedRevenue)}
          </p>
          <DeltaBadge delta={deltas.pipelineRevenue} />
          <p className="mt-2 text-xs text-gray-500">
            vs target {currency(revenueTarget)}
            {manualPipelineAdjustment !== 0 && (
              <span className="ml-1">
                (adj:{" "}
                {manualPipelineAdjustment >= 0 ? "+" : ""}
                {currency(manualPipelineAdjustment)})
              </span>
            )}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pipelinePct}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400">
              Manual pipeline adj:
            </span>
            <input
              type="number"
              value={manualPipelineAdjustment}
              onChange={(e) =>
                onManualPipelineAdjustmentChange(Number(e.target.value) || 0)
              }
              className="w-20 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => onManualPipelineAdjustmentChange(0)}
              className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Reset to 0
            </button>
          </div>
        </div>

        {/* Combined Coverage */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Combined Coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(revenueSecured + pipelineExpectedRevenue)}
          </p>
          <DeltaBadge delta={deltas.combinedCoverage} />
          <p className="mt-2 text-xs text-gray-500">
            {(revenueTarget > 0
              ? Math.min(
                  100,
                  ((revenueSecured + pipelineExpectedRevenue) / revenueTarget) *
                    100
                )
              : 0
            ).toFixed(0)}
            % of target
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueLineChart data={revenueByWeek} />
        <PipelineStageBar data={pipelineByStage} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <OwnerWorkloadBar data={ownerWorkload} />
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming deadlines */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Upcoming deadlines (next 14 days)
            </h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {upcomingDeadlines.length} items
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Task
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Section
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Due
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {upcomingDeadlines.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-xs text-gray-500"
                    >
                      No upcoming deadlines in the next 14 days.
                    </td>
                  </tr>
                )}
                {upcomingDeadlines.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="max-w-[180px] truncate px-3 py-2 text-xs text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {task.section}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {formatDate(task.deadline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High priority tasks */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              High priority tasks
            </h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {highPriorityTasks.length} items
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Task
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Section
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {highPriorityTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-xs text-gray-500"
                    >
                      No high priority items at the moment.
                    </td>
                  </tr>
                )}
                {highPriorityTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="max-w-[180px] truncate px-3 py-2 text-xs text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {task.section}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          task.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "High"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
