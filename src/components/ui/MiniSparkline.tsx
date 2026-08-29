import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export type SparkPoint = { i: number; v: number };

export function sparkSeries(seed: number, points = 8): SparkPoint[] {
  const base = Math.max(6, Math.abs(Number.isFinite(seed) ? seed : 12));
  return Array.from({ length: points }, (_, index) => ({
    i: index,
    v: Math.round(
      base * (0.4 + ((Math.sin((index + 1) * 1.17 + base * 0.13) + 1) / 2) * 0.75),
    ),
  }));
}

export function sparkFromCount(value: string | number): SparkPoint[] {
  if (typeof value === "number") return sparkSeries(value);
  const digits = Number(String(value).replace(/[^\d.]/g, ""));
  if (Number.isFinite(digits) && digits > 0) return sparkSeries(digits);
  let hash = 0;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 1000;
  }
  return sparkSeries(hash + 12);
}

type MiniSparklineProps = {
  data: SparkPoint[];
  color?: string;
  height?: number;
};

export function MiniSparkline({
  data,
  color = "#1F8A80",
  height = 56,
}: MiniSparklineProps) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.38} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={`url(#${gradientId})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
