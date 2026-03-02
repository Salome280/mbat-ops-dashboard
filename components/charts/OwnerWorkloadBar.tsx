"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { OwnerWorkloadData } from "@/lib/metrics";

interface Props {
  data: OwnerWorkloadData[];
}

const PRIORITY_COLORS = {
  Critical: "#dc2626",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#94a3b8",
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-900">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
      <div className="mt-1 border-t border-gray-100 pt-1 text-xs font-semibold text-gray-900">
        Total: {total}
      </div>
    </div>
  );
};

export const OwnerWorkloadBar: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">No task data to display yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        Owner Workload
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        Task count by owner, split by priority
      </p>

      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48 + 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            dataKey="owner"
            type="category"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#64748b" }}
          />
          <Bar
            dataKey="Critical"
            stackId="stack"
            fill={PRIORITY_COLORS.Critical}
            radius={[0, 0, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="High"
            stackId="stack"
            fill={PRIORITY_COLORS.High}
            maxBarSize={24}
          />
          <Bar
            dataKey="Medium"
            stackId="stack"
            fill={PRIORITY_COLORS.Medium}
            maxBarSize={24}
          />
          <Bar
            dataKey="Low"
            stackId="stack"
            fill={PRIORITY_COLORS.Low}
            radius={[0, 6, 6, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
