import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Query {
  id: string;
  queryText: string;
  isActive: boolean;
  frequency: string;
  lastChecked: string | null;
  _count?: {
    mentions: number;
  };
}

interface QueryListProps {
  queries: Query[];
  brandId: string;
  onDelete?: (queryId: string) => void;
  onToggle?: (queryId: string, isActive: boolean) => void;
}

export function QueryList({ queries, brandId, onDelete, onToggle }: QueryListProps) {
  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No queries yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Create your first query to start tracking mentions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queries.map((query) => (
        <div
          key={query.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {query.queryText}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  query.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {query.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Frequency: {query.frequency}</span>
              {query._count && (
                <span>{query._count.mentions} mentions</span>
              )}
              {query.lastChecked && (
                <span>
                  Last checked: {formatDistanceToNow(new Date(query.lastChecked), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onToggle && (
              <button
                onClick={() => onToggle(query.id, !query.isActive)}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {query.isActive ? 'Pause' : 'Resume'}
              </button>
            )}
            <Link
              to={`/brands/${brandId}/queries/${query.id}`}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              View
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(query.id)}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
