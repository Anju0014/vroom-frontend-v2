"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    available: number;
    verified:number;
    booked: number;
    maintenance: number;
  };
}

export default function CarStatusChart({ data }: Props) {
  const chartData = [
    { name: "Available", value: data.available },
    { name: "Verified", value: data.verified  },
    { name: "Booked", value: data.booked },
    { name: "Maintenance", value: data.maintenance },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4">Car Status</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" outerRadius={90}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}