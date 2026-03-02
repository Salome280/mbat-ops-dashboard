"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { PipelineStageData } from "@/lib/metrics";

interface Props {
  data: PipelineStageData[];
}

const STAGE_COLORS: Record<string, string> = {
  Identified: "#94a3b8",
  Contacted: "#60a5fa",
  "Followed Up": "#38bdf8",
  "Call Scheduled": "#818cf8",
  "Proposal Sent": "#a78bfa",
  Negotiating: "#f59e0b",
  Confirmed: "#10b981",
  Lost: "#ef4444",
};

const currencyTick = (value: number) =>
  value >= 1_000 ? `€${(value / 1_000).toFixed(0)}k` : `€${value}`;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">
        €{payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export const PipelineStageBar: React.FC<Props> = ({ data }) => {
  const hasData = data.some((d) => d.dealValue > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">
          No pipeline data to display yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        Pipeline by Stage
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        Total deal value per pipeline stage
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tickFormatter={currencyTick}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="dealValue" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell
                key={entry.stage}
                fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
