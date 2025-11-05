'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import FilterChips from '@/components/FilterChips';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  const categoryOptions = [
    { value: 'pothole', label: 'Pothole' },
    { value: 'damaged_road', label: 'Damaged Road' },
    { value: 'debris', label: 'Debris' },
    { value: 'signage', label: 'Signage' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'reported', label: 'Reported' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'fixed', label: 'Fixed' },
  ];

  useEffect(() => {
    const query = searchParams?.get('query');
    if (query) {
      setSearchQuery(query);
    }
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [reports, categoryFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (categoryFilter.length > 0) {
      filtered = filtered.filter(r => categoryFilter.includes(r.issueType));
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(r => statusFilter.includes(r.status));
    }

    setFilteredReports(filtered);
  };

  const handleMarkerClick = (report) => {
    setSelectedIssue(report);
    setIsDrawerOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would geocode the address and recenter the map
    // For now, we'll just show a message
    alert('Address search will be implemented with geocoding');
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setStatusFilter([]);
  };

  const hasActiveFilters = categoryFilter.length > 0 || statusFilter.length > 0;

  return (
    <div className="relative h-screen">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-4">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or place..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
            <FilterChips
              filters={categoryFilter}
              onFilterChange={(value) => {
                setCategoryFilter(
                  categoryFilter.includes(value)
                    ? categoryFilter.filter(f => f !== value)
                    : [...categoryFilter, value]
                );
              }}
              options={categoryOptions}
            />
          </div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <FilterChips
              filters={statusFilter}
              onFilterChange={(value) => {
                setStatusFilter(
                  statusFilter.includes(value)
                    ? statusFilter.filter(f => f !== value)
                    : [...statusFilter, value]
                );
              }}
              options={statusOptions}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Reported</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Fixed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded shadow-lg">
          Error loading reports: {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredReports.length === 0 && hasActiveFilters && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <EmptyState
            title="No results found"
            description="Try adjusting your filters to see more reports."
            actionLabel="Clear Filters"
            actionHref="#"
            icon={<button onClick={clearFilters} className="text-blue-600">Clear Filters</button>}
          />
        </div>
      )}

      {/* Map */}
      <Map reports={filteredReports} onMarkerClick={handleMarkerClick} />

      {/* Details Drawer */}
      {isDrawerOpen && selectedIssue && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-[2000] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedIssue.issueType?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Issue'}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <StatusBadge status={selectedIssue.status} />
            </div>

            {selectedIssue.imageUrl && (
              <img
                src={selectedIssue.imageUrl}
                alt={selectedIssue.issueType}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {selectedIssue.description && (
              <p className="text-gray-700 mb-4">{selectedIssue.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Created:</span>{' '}
                {new Date(selectedIssue.createdAt).toLocaleDateString()}
              </div>
              {selectedIssue.severity && (
                <div>
                  <span className="font-semibold">Severity:</span> {selectedIssue.severity}/5
                </div>
              )}
              <div>
                <span className="font-semibold">Location:</span>{' '}
                {selectedIssue.latitude?.toFixed(4)}, {selectedIssue.longitude?.toFixed(4)}
              </div>
            </div>

            <div className="mt-6">
              <a
                href={`/issue/${selectedIssue.id}`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Full Details
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
