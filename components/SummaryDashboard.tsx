"use client";

import { AnyTask } from "@/types/tasks";

interface SummaryProps {
  totalSponsorsConfirmed: number;
  revenueSecured: number;
  revenueTarget: number;
  pipelineExpectedRevenue: number;
  upcomingDeadlines: AnyTask[];
  highPriorityTasks: AnyTask[];
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
};

export const SummaryDashboard: React.FC<SummaryProps> = ({
  totalSponsorsConfirmed,
  revenueSecured,
  revenueTarget,
  pipelineExpectedRevenue,
  upcomingDeadlines,
  highPriorityTasks
}) => {
  const securedPct =
    revenueTarget > 0 ? Math.min(100, (revenueSecured / revenueTarget) * 100) : 0;
  const pipelinePct =
    revenueTarget > 0
      ? Math.min(100, (pipelineExpectedRevenue / revenueTarget) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard Summary
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            High-level view of sponsorship revenue and critical operational work.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Sponsors Confirmed
          </p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">
            {totalSponsorsConfirmed}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Revenue Secured
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(revenueSecured)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Target {currency(revenueTarget)}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${securedPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Pipeline Expected Revenue
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(pipelineExpectedRevenue)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            vs target {currency(revenueTarget)}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pipelinePct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Combined Coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {currency(revenueSecured + pipelineExpectedRevenue)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
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

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
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
                {upcomingDeadlines.map(task => (
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
                {highPriorityTasks.map(task => (
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
