'use client';

import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { TableEntry } from '@/types';
import { Award, TrendingUp } from 'lucide-react';

interface DataTableProps {
  data: TableEntry[];
  siteId: string;
  metricName: string;
}

export function DataTable({ data, siteId, metricName }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableEntry;
    direction: 'asc' | 'desc';
  }>({ key: 'hIndex', direction: 'desc' });

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const toggleSort = (key: keyof TableEntry) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={() => toggleSort('hIndex')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          H-Index
          <ArrowUpDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => toggleSort('totalMetrics')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {metricName}
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {sortedData.map((entry, index) => (
        <Link
          key={entry.id}
          href={`/${siteId}/${entry.id}`}
          className="group block"
        >
          <div className="flex items-center p-4 hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-500">
              #{index + 1}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {entry.name}
              </h3>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-white font-semibold">{entry.hIndex}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-white font-semibold">
                  {entry.totalMetrics.toLocaleString()} {metricName}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}