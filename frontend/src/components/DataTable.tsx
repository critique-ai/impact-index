'use client';

import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { TopEntry } from '../types';

interface DataTableProps {
  data: TopEntry[];
  siteId: string;
  metricName: string;
}

export function DataTable({ data, siteId, metricName }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TopEntry;
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

  const toggleSort = (key: keyof TopEntry) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 cursor-pointer" onClick={() => toggleSort('name')}>
              <div className="flex items-center">
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => toggleSort('hIndex')}>
              <div className="flex items-center">
                H-Index
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => toggleSort('totalMetrics')}>
              <div className="flex items-center">
                Total {metricName}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry) => (
            <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                <Link
                  href={`/${siteId}/${entry.id}`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {entry.name}
                </Link>
              </td>
              <td className="px-6 py-4">{entry.hIndex}</td>
              <td className="px-6 py-4">{entry.totalMetrics.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}