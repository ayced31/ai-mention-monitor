import { useState, useEffect } from 'react';
import { useBrands } from '@/hooks/useBrands';
import { BrandCard } from '@/components/dashboard';
import { Card, CardContent, Input } from '@/components/ui';

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9; // 3x3 grid

  const { brands, pagination, isLoading, createBrand, deleteBrand, isCreating } = useBrands({
    search: searchQuery,
    page: currentPage,
    limit,
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    keywords: '',
    competitors: '',
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBrand({
      name: formData.name,
      domain: formData.domain || undefined,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      competitors: formData.competitors.split(',').map(c => c.trim()).filter(Boolean),
    });
    setFormData({ name: '', domain: '', keywords: '', competitors: '' });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      await deleteBrand(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading brands...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brands</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your brands and track mentions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Brand'}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search brands by name, domain, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {pagination && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {brands.length} of {pagination.total} brands
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Brand</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <Input
                  type="url"
                  placeholder="https://acme.com"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keywords (comma-separated)
                </label>
                <Input
                  type="text"
                  placeholder="acme, acme software, project management"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alternative names or keywords for your brand
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Competitors (comma-separated)
                </label>
                <Input
                  type="text"
                  placeholder="Competitor A, Competitor B"
                  value={formData.competitors}
                  onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Brand'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onDelete={handleDelete} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Card>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No brands found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Create Your First Brand
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {pagination.totalPages}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
