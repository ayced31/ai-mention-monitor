import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Brand {
  id: string;
  name: string;
  domain?: string | null;
  keywords: string[];
  competitors: string[];
  createdAt: string;
  _count?: {
    queries: number;
  };
}

interface BrandCardProps {
  brand: Brand;
  onDelete?: (brandId: string) => void;
}

export function BrandCard({ brand, onDelete }: BrandCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              to={`/brands/${brand.id}`}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {brand.name}
            </Link>
            {brand.domain && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {brand.domain}
              </p>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(brand.id)}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Delete brand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {brand.keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Keywords</p>
              <div className="flex flex-wrap gap-1">
                {brand.keywords.slice(0, 5).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  >
                    {keyword}
                  </span>
                ))}
                {brand.keywords.length > 5 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{brand.keywords.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {brand.competitors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Competitors</p>
              <div className="flex flex-wrap gap-1">
                {brand.competitors.slice(0, 3).map((competitor, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                  >
                    {competitor}
                  </span>
                ))}
                {brand.competitors.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{brand.competitors.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            {brand._count && (
              <span>{brand._count.queries} {brand._count.queries === 1 ? 'query' : 'queries'}</span>
            )}
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-xs">
            Created {formatDistanceToNow(new Date(brand.createdAt), { addSuffix: true })}
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <Link
            to={`/brands/${brand.id}`}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-center transition-colors"
          >
            View Details
          </Link>
          <Link
            to={`/brands/${brand.id}/analytics`}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
          >
            Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
