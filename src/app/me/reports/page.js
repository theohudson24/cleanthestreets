'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import IssueCard from '@/components/IssueCard';
import FilterChips from '@/components/FilterChips';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  const statusOptions = [
    { value: 'reported', label: 'Reported' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'fixed', label: 'Fixed' },
  ];

  const categoryOptions = [
    { value: 'pothole', label: 'Pothole' },
    { value: 'damaged_road', label: 'Damaged Road' },
    { value: 'debris', label: 'Debris' },
    { value: 'signage', label: 'Signage' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchMyReports();
  }, []);

  useEffect(() => {
    let nextReports = [...reports];

    if (statusFilter.length > 0) {
      nextReports = nextReports.filter((report) => statusFilter.includes(report.status));
    }

    if (categoryFilter.length > 0) {
      nextReports = nextReports.filter((report) => categoryFilter.includes(report.issueType));
    }

    setFilteredReports(nextReports);
  }, [reports, statusFilter, categoryFilter]);

  const fetchMyReports = async () => {
    try {
      const response = await fetch('/api/me/reports', { cache: 'no-store' });

      if (response.status === 401) {
        router.push('/signin?redirect=/me/reports');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reports</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <FilterChips
              filters={statusFilter}
              onFilterChange={(value) => {
                setStatusFilter(
                  statusFilter.includes(value)
                    ? statusFilter.filter((filterValue) => filterValue !== value)
                    : [...statusFilter, value]
                );
              }}
              options={statusOptions}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
            <FilterChips
              filters={categoryFilter}
              onFilterChange={(value) => {
                setCategoryFilter(
                  categoryFilter.includes(value)
                    ? categoryFilter.filter((filterValue) => filterValue !== value)
                    : [...categoryFilter, value]
                );
              }}
              options={categoryOptions}
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState
            title={reports.length === 0 ? 'No Reports Yet' : 'No Results'}
            description={
              reports.length === 0
                ? "You haven't submitted any reports yet. Get started by reporting your first issue!"
                : 'Try adjusting your filters to see more reports.'
            }
            actionLabel={reports.length === 0 ? 'Report an Issue' : undefined}
            actionHref={reports.length === 0 ? '/report' : undefined}
          />
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <IssueCard key={report.id} issue={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
