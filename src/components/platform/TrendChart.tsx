import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MetricPoint, TimeSeriesPoint } from "@/types/platform";

type Formatter = (value: number) => string;

interface TrendChartProps {
  data: TimeSeriesPoint[];
  variant?: "area" | "bar";
  height?: number;
  valueFormatter?: Formatter;
  emptyMessage?: string;
}

const AXIS = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
} as const;

function EmptyChart({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function tooltipStyle() {
  return {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    fontSize: "12px",
    color: "var(--popover-foreground)",
  } as const;
}

/** Time-series chart driven entirely by backend data — never seeded values. */
export function TrendChart({
  data,
  variant = "area",
  height = 240,
  valueFormatter,
  emptyMessage = "No data recorded for this period yet.",
}: TrendChartProps) {
  const format: Formatter = valueFormatter ?? ((value) => value.toLocaleString());

  if (data.length === 0) return <EmptyChart message={emptyMessage} height={height} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === "bar" ? (
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} {...AXIS} />
          <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={format} {...AXIS} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(value) => format(Number(value))} />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={38} />
        </BarChart>
      ) : (
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} {...AXIS} />
          <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={format} {...AXIS} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(value) => format(Number(value))} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#trend-fill)"
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

/** Horizontal distribution list — a chart without the chart junk. */
export function BreakdownBars({
  data,
  valueFormatter,
  emptyMessage = "Nothing to break down yet.",
}: {
  data: MetricPoint[];
  valueFormatter?: Formatter;
  emptyMessage?: string;
}) {
  const format: Formatter = valueFormatter ?? ((value) => value.toLocaleString());
  const max = data.reduce((acc, point) => Math.max(acc, point.value), 0);

  if (data.length === 0 || max === 0) {
    return <p className="text-xs text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {data.map((point) => (
        <li key={point.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{point.label}</span>
            <span className="tabular-nums text-muted-foreground">{format(point.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max((point.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
