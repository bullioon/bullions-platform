"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { time: "09:00", value: 1200 },
  { time: "10:00", value: 1800 },
  { time: "11:00", value: 1500 },
  { time: "12:00", value: 2400 },
  { time: "13:00", value: 3100 },
  { time: "14:00", value: 2800 },
  { time: "15:00", value: 3700 },
];

export default function PerformanceChart() {
  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B6FF00" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#B6FF00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke="#B6FF00"
            strokeWidth={3}
            fill="url(#colorGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
