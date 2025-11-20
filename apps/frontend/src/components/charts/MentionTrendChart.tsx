import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimelineData {
  date: string;
  rate: number;
  mentioned: number;
  total: number;
}

interface MentionTrendChartProps {
  data: TimelineData[];
  height?: number;
}

export function MentionTrendChart({ data, height = 300 }: MentionTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <YAxis
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <Tooltip
          formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Mention Rate']}
          labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorRate)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
