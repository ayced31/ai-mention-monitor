import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProviderData {
  provider: string;
  rate: number;
  mentioned: number;
  total: number;
}

interface ProviderBarChartProps {
  data: ProviderData[];
  height?: number;
}

export function ProviderBarChart({ data, height = 300 }: ProviderBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="provider"
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <YAxis
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <Tooltip
          formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Bar dataKey="rate" fill="#3b82f6" name="Mention Rate" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
