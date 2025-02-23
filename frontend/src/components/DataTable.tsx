'use client';

import { ArrowUpDown, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Entity } from '@/types';

interface DataTableProps {
  data: Entity[];
  siteId: string;
  metricName: string;
  EntityName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  resultsPerPage: number;
}

export function DataTable({ 
  data, 
  siteId, 
  EntityName,
  metricName, 
  currentPage, 
  totalPages, 
  resultsPerPage,
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
        {/* Header Row */}
        <div className="grid grid-cols-4 gap-4 mb-4 px-4">
          <div className="w-12">
            <span className="text-sm text-gray-400">#</span>
          </div>
          <button
            onClick={() => toggleSort('identifier')}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors"
          >
            {EntityName}
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleSort('index')}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors justify-end"
          >
            H-Index
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleSort('total_metrics')}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors justify-end"
          >
            {metricName}
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Data Rows */}
        {sortedData.map((entry, index) => {
          // Calculate the actual rank considering the page number
          const actualRank = (currentPage - 1) * resultsPerPage + (index + 1);
          
          return (
            <Link
              key={entry.identifier}
              href={`/${siteId}/${entry.identifier}`}
              className="group block"
            >
              <div className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-700/50 rounded-lg transition-colors items-center">
                <div className="w-12 text-2xl font-bold text-gray-500">
                  #{actualRank}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors truncate">
                    {entry.identifier}
                  </h3>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-semibold">{entry.index}</span>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-semibold">
                    {entry.total_metrics.toLocaleString()} {metricName}
                  </span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Link>
          );
        })}
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