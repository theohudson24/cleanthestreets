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
    <div className="relative h-screen bg-slate-950">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto space-y-3 w-[min(440px,calc(100vw-2rem))] sm:w-[min(480px,calc(100vw-3rem))]">
          {/* Search */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-slate-50">Find a location</p>
                <p className="text-xs text-slate-400">Search or pan the map to explore.</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200 border border-white/10">
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
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-200"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:brightness-105"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/75 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <p className="text-[13px] font-semibold text-slate-50">Filter reports</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-indigo-200 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="px-4 pb-4 space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Category</div>
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
                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Status</div>
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
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/50 backdrop-blur-xl px-4 py-3 text-slate-100">
            <h3 className="text-xs font-semibold mb-2 text-slate-200">Status legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400" />
                <span className="text-xs text-slate-300">Reported</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300">Fixed</span>
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
            actionLabel="Clear Filters"
            actionHref="#"
            icon={<button onClick={clearFilters} className="text-indigo-300 hover:text-white">Clear Filters</button>}
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
