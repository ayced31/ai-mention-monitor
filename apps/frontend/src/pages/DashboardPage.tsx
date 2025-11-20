import { useBrands } from '@/hooks/useBrands';
import { Link } from 'react-router-dom';
import { StatsCard, ActivityFeed } from '@/components/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { brands, isLoading } = useBrands();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalQueries = brands?.reduce((sum, b) => sum + (b._count?.queries || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your brand mentions across AI assistants
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Brands"
          value={brands?.length || 0}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatsCard
          title="Active Queries"
          value={totalQueries}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <StatsCard
          title="AI Providers"
          value={4}
          subtitle="OpenAI, Anthropic, Perplexity, Gemini"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Brands - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Brands</CardTitle>
              <Link to="/brands" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                View All →
              </Link>
            </CardHeader>
            <CardContent>
              {brands && brands.length > 0 ? (
                <div className="space-y-4">
                  {brands.slice(0, 5).map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/brands/${brand.id}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{brand.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {brand._count?.queries || 0} {brand._count?.queries === 1 ? 'query' : 'queries'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-500">
                          {formatDistanceToNow(new Date(brand.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No brands yet</p>
                  <Link to="/brands" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    Create Your First Brand
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
