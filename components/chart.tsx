// components/chart.tsx
"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  data: {
    due_date: string;
    items_due: number;
  }[];
}

const chartConfig = {
  items_due: {
    label: "Jumlah Item",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DueDateChart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p>Tidak ada data peminjaman</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
      style={
        {
          "--color-items_due": "#8884d8",
          "--chart-1": "#8884d8",
        } as React.CSSProperties
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fillItemsDue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-items_due)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-items_due)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="due_date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="items_due"
            type="natural"
            fill="url(#fillItemsDue)"
            stroke="var(--color-items_due)"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
