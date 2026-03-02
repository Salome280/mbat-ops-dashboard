import {
  AnyTask,
  SponsorshipPipelineStage,
  SponsorshipTask,
  TaskPriority,
} from "@/types/tasks";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  Revenue by week  (RevenueLineChart)                                */
/* ------------------------------------------------------------------ */

export interface WeeklyRevenue {
  week: string;
  revenue: number;
}

export function getRevenueByWeek(tasks: SponsorshipTask[]): WeeklyRevenue[] {
  const confirmed = tasks.filter((t) => t.pipelineStage === "Confirmed");
  if (confirmed.length === 0) return [];

  const weekMap = new Map<string, number>();

  for (const task of confirmed) {
    const date = new Date(task.updatedAt || task.createdAt);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString();
    weekMap.set(key, (weekMap.get(key) ?? 0) + task.dealValue);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => ({
      week: formatWeekLabel(new Date(key)),
      revenue,
    }));
}

/* ------------------------------------------------------------------ */
/*  Deal value by pipeline stage  (PipelineStageBar)                   */
/* ------------------------------------------------------------------ */

export interface PipelineStageData {
  stage: string;
  dealValue: number;
}

const PIPELINE_STAGE_ORDER: SponsorshipPipelineStage[] = [
  "Identified",
  "Contacted",
  "Followed Up",
  "Call Scheduled",
  "Proposal Sent",
  "Negotiating",
  "Confirmed",
  "Lost",
];

export function getDealValueByStage(
  tasks: SponsorshipTask[]
): PipelineStageData[] {
  const map = new Map<SponsorshipPipelineStage, number>();
  for (const stage of PIPELINE_STAGE_ORDER) map.set(stage, 0);
  for (const task of tasks)
    map.set(
      task.pipelineStage,
      (map.get(task.pipelineStage) ?? 0) + task.dealValue
    );

  return PIPELINE_STAGE_ORDER.map((stage) => ({
    stage,
    dealValue: map.get(stage) ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/*  Owner workload  (OwnerWorkloadBar)                                 */
/* ------------------------------------------------------------------ */

export interface OwnerWorkloadData {
  owner: string;
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export function getOwnerWorkload(tasks: AnyTask[]): OwnerWorkloadData[] {
  const map = new Map<string, Record<TaskPriority, number>>();

  for (const task of tasks) {
    const owner = task.owner?.trim() || "Unassigned";
    if (!map.has(owner))
      map.set(owner, { Critical: 0, High: 0, Medium: 0, Low: 0 });
    map.get(owner)![task.priority]++;
  }

  return Array.from(map.entries())
    .map(([owner, counts]) => ({ owner, ...counts }))
    .sort((a, b) => {
      const totalA = a.Critical + a.High + a.Medium + a.Low;
      const totalB = b.Critical + b.High + b.Medium + b.Low;
      return totalB - totalA;
    });
}

/* ------------------------------------------------------------------ */
/*  KPI deltas  (week-over-week comparison)                            */
/* ------------------------------------------------------------------ */

export interface KpiDelta {
  value: number | null;
  label: string;
  isPositive: boolean;
}

function computeDelta(current: number, previous: number): KpiDelta {
  if (previous === 0 && current === 0)
    return { value: null, label: "N/A", isPositive: false };
  if (previous === 0)
    return { value: null, label: "N/A", isPositive: current > 0 };

  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct);
  return {
    value: rounded,
    label: `${rounded >= 0 ? "+" : ""}${rounded}%`,
    isPositive: rounded >= 0,
  };
}

export function computeKpiDeltas(
  sponsorshipTasks: SponsorshipTask[],
  allTasks: AnyTask[]
) {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const isCurrentWeek = (dateStr: string) =>
    new Date(dateStr) >= currentWeekStart;
  const isPreviousWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= previousWeekStart && d < currentWeekStart;
  };

  const confirmedCurr = sponsorshipTasks.filter(
    (t) => t.pipelineStage === "Confirmed" && isCurrentWeek(t.updatedAt)
  ).length;
  const confirmedPrev = sponsorshipTasks.filter(
    (t) => t.pipelineStage === "Confirmed" && isPreviousWeek(t.updatedAt)
  ).length;

  const revenueCurr = sponsorshipTasks
    .filter(
      (t) => t.pipelineStage === "Confirmed" && isCurrentWeek(t.updatedAt)
    )
    .reduce((s, t) => s + t.dealValue, 0);
  const revenuePrev = sponsorshipTasks
    .filter(
      (t) => t.pipelineStage === "Confirmed" && isPreviousWeek(t.updatedAt)
    )
    .reduce((s, t) => s + t.dealValue, 0);

  const pipelineCurr = sponsorshipTasks
    .filter((t) => isCurrentWeek(t.updatedAt))
    .reduce((s, t) => s + t.expectedRevenue, 0);
  const pipelinePrev = sponsorshipTasks
    .filter((t) => isPreviousWeek(t.updatedAt))
    .reduce((s, t) => s + t.expectedRevenue, 0);

  const highPriCurr = allTasks.filter(
    (t) =>
      (t.priority === "Critical" || t.priority === "High") &&
      isCurrentWeek(t.updatedAt)
  ).length;
  const highPriPrev = allTasks.filter(
    (t) =>
      (t.priority === "Critical" || t.priority === "High") &&
      isPreviousWeek(t.updatedAt)
  ).length;

  return {
    sponsorsConfirmed: computeDelta(confirmedCurr, confirmedPrev),
    revenueSecured: computeDelta(revenueCurr, revenuePrev),
    pipelineRevenue: computeDelta(pipelineCurr, pipelinePrev),
    combinedCoverage: computeDelta(
      revenueCurr + pipelineCurr,
      revenuePrev + pipelinePrev
    ),
    highPriorityTasks: computeDelta(highPriCurr, highPriPrev),
  };
}
