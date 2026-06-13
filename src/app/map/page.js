'use client';

import { Suspense, useEffect, useState } from 'react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

function MapPageContent() {
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
      setReports(data.items ?? []);
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
      filtered = filtered.filter((r) => categoryFilter.includes(r.issueType));
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((r) => statusFilter.includes(r.status));
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
    <div className="relative h-screen bg-white">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto space-y-3 w-[min(440px,calc(100vw-2rem))] sm:w-[min(480px,calc(100vw-3rem))]">
          {/* Search */}
          <div className="rounded-2xl border border-green-100 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Find a location</p>
                <p className="text-xs text-gray-500">Search or pan the map to explore.</p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700 border border-green-100">
                Live
              </span>
            </div>
            <div className="px-4 pb-4">
              <form onSubmit={handleSearch} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search address or place…"
                  className="flex-1 rounded-xl border border-green-100 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-green-100 bg-white shadow-sm">
            <div className="px-4 pt-4">
              <p className="text-[13px] font-semibold text-gray-900">Filter reports</p>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Category</div>
                <FilterChips
                  filters={categoryFilter}
                  onFilterChange={(value) => {
                    setCategoryFilter(
                      categoryFilter.includes(value)
                        ? categoryFilter.filter((f) => f !== value)
                        : [...categoryFilter, value]
                    );
                  }}
                  options={categoryOptions}
                  variant="linear"
                />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Status</div>
                <FilterChips
                  filters={statusFilter}
                  onFilterChange={(value) => {
                    setStatusFilter(
                      statusFilter.includes(value)
                        ? statusFilter.filter((f) => f !== value)
                        : [...statusFilter, value]
                    );
                  }}
                  options={statusOptions}
                  variant="linear"
                />
              </div>
              {hasActiveFilters && (
                <div className="pt-1">
                  <button
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-green-100 bg-white shadow-sm px-4 py-3 text-gray-900">
            <h3 className="text-xs font-semibold mb-2 text-gray-700">Status legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">Reported</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-400" />
                <span className="text-xs text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-600">Fixed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <div className="bg-rose-500/90 text-white border border-white/15 px-4 py-3 rounded-xl shadow-xl shadow-rose-500/30 flex items-center gap-3">
            <span className="text-sm font-semibold">Error loading reports:</span>
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredReports.length === 0 && hasActiveFilters && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <EmptyState
            title="No results found"
            description="Try adjusting your filters to see more reports."
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
                className="block w-full text-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
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

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
