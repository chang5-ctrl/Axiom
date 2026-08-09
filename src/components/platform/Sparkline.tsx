import { Area, AreaChart, ResponsiveContainer } from "recharts";

import type { TimeSeriesPoint } from "@/types/platform";

/**
 * Compact inline trend. Renders nothing when the series is empty or flat at
 * zero so a card never implies movement that was not measured.
 */
export function Sparkline({
  data,
  height = 34,
  tone = "primary",
}: {
  data: TimeSeriesPoint[];
  height?: number;
  tone?: "primary" | "success" | "warning";
}) {
  const hasSignal = data.some((point) => point.value > 0);
  if (data.length < 2 || !hasSignal) return null;

  const stroke = `var(--${tone})`;
  const gradientId = `spark-${tone}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
