import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

interface ProviderData {
  provider: string;
  rate: number;
  mentioned: number;
  total: number;
}

interface ProviderPieChartProps {
  data: ProviderData[];
  height?: number;
}

export function ProviderPieChart({ data, height = 300 }: ProviderPieChartProps) {
  const chartData = data.map(item => ({
    name: item.provider,
    value: item.rate * 100,
    count: item.mentioned,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => `${value.toFixed(1)}%`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
