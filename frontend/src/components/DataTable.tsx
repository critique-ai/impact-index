'use client';

import { ArrowUpDown, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Entity } from '@/types';

interface DataTableProps {
  data: Entity[];
  siteId: string;
  metricName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTable({ 
  data, 
  siteId, 
  metricName, 
  currentPage, 
  totalPages, 
  onPageChange 
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Entity;
    direction: 'asc' | 'desc';
  }>({ key: 'index', direction: 'desc' });

  const sortedData = [...data].sort((a, b) => {
    if (a.index < b.index) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a.index > b.index) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const toggleSort = (key: keyof Entity) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div>
      <div className="space-y-2">
        <div className="flex justify-end gap-4 mb-4">
          <button
            onClick={() => toggleSort('index')}
            className="flex items-center gap-2 text-sm text-gray-400  transition-colors"
          >
            H-Index
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleSort('total_metrics')}
            className="flex items-center gap-2 text-sm text-gray-400  transition-colors"
          >
            {metricName}
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {sortedData.map((entry, index) => (
          <Link
            key={entry.identifier}
            href={`/${siteId}/${entry.identifier}`}
            className="group block"
          >
            <div className="flex items-center p-4 hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-500">
                #{index + 1}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                  {entry.identifier}
                </h3>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className=" font-semibold">{entry.index}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">
                    {entry.total_metrics.toLocaleString()} {metricName}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}