import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBrand } from '@/hooks/useBrands';
import { useAnalytics, useAnalyticsSummary } from '@/hooks/useAnalytics';
import { format, subDays } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Loading } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import {
  MentionTrendChart,
  ProviderBarChart,
  ProviderPieChart,
  CompetitorBarChart,
} from '@/components/charts';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: brand } = useBrand(id!);
  
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
    granularity: 'day' as 'hour' | 'day' | 'week',
  });

  const { data: analytics, isLoading } = useAnalytics(id!, dateRange);
  const { data: summary } = useAnalyticsSummary(id!);

  if (isLoading) {
    return <Loading text="Loading analytics..." />;
  }

  if (!brand || !analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to={`/brands/${id}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block">
          ← Back to {brand.name}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Performance insights for {brand.name}</p>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="From"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <Input
              label="To"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
            <Select
              label="Granularity"
              value={dateRange.granularity}
              onChange={(e) => setDateRange({ ...dateRange, granularity: e.target.value as any })}
              options={[
                { value: 'hour', label: 'Hourly' },
                { value: 'day', label: 'Daily' },
                { value: 'week', label: 'Weekly' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Last 24 Hours"
            value={`${(summary.last24h.mentionRate * 100).toFixed(1)}%`}
            subtitle={`${summary.last24h.mentionCount} / ${summary.last24h.totalChecks} checks`}
            trend={summary.last24h.trend}
          />
          <StatsCard
            title="Last 7 Days"
            value={`${(summary.last7d.mentionRate * 100).toFixed(1)}%`}
            subtitle={`${summary.last7d.mentionCount} / ${summary.last7d.totalChecks} checks`}
          />
          <StatsCard
            title="Last 30 Days"
            value={`${(summary.last30d.mentionRate * 100).toFixed(1)}%`}
            subtitle={`${summary.last30d.mentionCount} / ${summary.last30d.totalChecks} checks`}
          />
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Mention Rate"
          value={`${(analytics.mentionRate * 100).toFixed(1)}%`}
        />
        <StatsCard
          title="Total Checks"
          value={analytics.totalChecks}
        />
        <StatsCard
          title="Mentions Found"
          value={analytics.mentionCount}
        />
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mention Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <MentionTrendChart data={analytics.timeline} />
        </CardContent>
      </Card>

      {/* Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>By AI Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <ProviderBarChart data={analytics.byProvider} />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.byProvider.map((provider) => (
              <div key={provider.provider} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{provider.provider}</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {(provider.rate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {provider.mentioned} / {provider.total} checks
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      {analytics.competitorComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competitor Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.competitorComparison}
                    dataKey="mentionCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.competitorComparison.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {analytics.competitorComparison.map((competitor, index) => (
                  <div key={competitor.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{competitor.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{competitor.mentionCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Avg pos: {competitor.avgPosition > 0 ? competitor.avgPosition.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Queries */}
      {analytics.topQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Queries</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-3">
            {analytics.topQueries.slice(0, 10).map((query) => (
              <div key={query.query} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{query.query}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {query.mentioned} mentions out of {query.total} checks
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(query.rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
