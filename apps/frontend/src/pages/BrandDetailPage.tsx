import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBrand } from '@/hooks/useBrands';
import { useQueries } from '@/hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: brand, isLoading: brandLoading } = useBrand(id!);
  const {
    queries,
    isLoading: queriesLoading,
    createQuery,
    deleteQuery,
    triggerCheck,
    isCreating,
    isChecking,
  } = useQueries(id!);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    queryText: '',
    frequency: 'DAILY' as 'HOURLY' | 'DAILY' | 'WEEKLY',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createQuery(formData);
    setFormData({ queryText: '', frequency: 'DAILY', isActive: true });
    setShowForm(false);
  };

  const handleDelete = async (queryId: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      await deleteQuery(queryId);
    }
  };

  const handleTriggerCheck = async (queryId: string) => {
    await triggerCheck(queryId);
    alert('Mention check queued! Results will appear shortly.');
  };

  if (brandLoading || queriesLoading) {
    return <div>Loading...</div>;
  }

  if (!brand) {
    return <div>Brand not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/brands" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to Brands
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
          {brand.domain && (
            <a
              href={brand.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              {brand.domain}
            </a>
          )}
        </div>
        <Link
          to={`/brands/${id}/analytics`}
          className="btn btn-primary"
        >
          View Analytics
        </Link>
      </div>

      {/* Brand Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h2>
          {brand.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {brand.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No keywords defined</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Competitors</h2>
          {brand.competitors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {brand.competitors.map((competitor, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {competitor}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No competitors defined</p>
          )}
        </div>
      </div>

      {/* Queries Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Queries</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add Query'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Query Text *
              </label>
              <input
                type="text"
                required
                className="input mt-1"
                placeholder="Best project management tools 2024"
                value={formData.queryText}
                onChange={(e) => setFormData({ ...formData, queryText: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                The question or search query to monitor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Check Frequency
              </label>
              <select
                className="input mt-1"
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
              >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (will be checked automatically)
              </label>
            </div>

            <div className="flex space-x-3">
              <button type="submit" disabled={isCreating} className="btn btn-primary">
                {isCreating ? 'Creating...' : 'Create Query'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {queries.length > 0 ? (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{query.queryText}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${query.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {query.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span>Frequency: {query.frequency}</span>
                      <span>{query._count?.mentions || 0} mentions</span>
                      {query.lastChecked && (
                        <span>
                          Last checked {formatDistanceToNow(new Date(query.lastChecked), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleTriggerCheck(query.id)}
                      disabled={isChecking}
                      className="btn btn-secondary text-sm px-3 py-1"
                    >
                      {isChecking ? 'Checking...' : 'Check Now'}
                    </button>
                    <button
                      onClick={() => handleDelete(query.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No queries yet</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Create Your First Query
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
