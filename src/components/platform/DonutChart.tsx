import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { MetricPoint } from "@/types/platform";

const SERIES_COLORS = [
  "var(--chart-1, var(--primary))",
  "var(--chart-2, var(--success))",
  "var(--chart-3, var(--warning))",
  "var(--chart-4, var(--destructive))",
  "var(--chart-5, var(--muted-foreground))",
];

/** Composition chart for distributions such as segments, plans or health bands. */
export function DonutChart({
  data,
  height = 220,
  valueFormatter,
  centerLabel,
  centerValue,
  emptyMessage = "No distribution recorded yet.",
}: {
  data: MetricPoint[];
  height?: number;
  valueFormatter?: (value: number) => string;
  centerLabel?: string;
  centerValue?: string;
  emptyMessage?: string;
}) {
  const format = valueFormatter ?? ((value: number) => value.toLocaleString());
  const total = data.reduce((sum, point) => sum + point.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div
        className="grid place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
            >
              {data.map((point, index) => (
                <Cell key={point.label} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "var(--popover-foreground)",
              }}
              formatter={(value) => format(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              {centerValue && (
                <p className="font-display text-xl font-semibold tabular-nums">{centerValue}</p>
              )}
              {centerLabel && (
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {centerLabel}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((point, index) => (
          <li key={point.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }}
              />
              <span className="truncate">{point.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {format(point.value)} · {((point.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
