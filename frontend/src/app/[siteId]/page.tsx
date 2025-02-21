'use client';

import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import {  getTopResponse } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSites } from '@/components/SitesProvider';
import { useContext, useState, useEffect } from 'react';
import type { Site, TopResponse } from '@/types';

export default function SitePage() {
  const params = useParams();
  const { sites } = useSites();
  const currentSite = sites.find(site => params.siteId === site.name);
  const [data, setData] = useState<TopResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    getTopResponse(params.siteId as string, currentPage, perPage)
      .then(response => setData(response));
  }, [params.siteId, currentPage, perPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return currentSite ? (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            {currentSite.name} Rankings
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            {currentSite.index_description}
          </p>

          <div className="flex justify-center mb-12">
            <SearchBar
              siteId={params.siteId as string}
              placeholder={`Search for a ${currentSite.entity_name.toLowerCase()}...`}
            />
          </div>

          <div className="rounded-xl shadow-xl p-6">
            <DataTable
              data={data?.entities ?? []}
              siteId={params.siteId as string}
              metricName={currentSite.metric_name}
              currentPage={currentPage}
              totalPages={data?.pagination?.total_pages ?? 1}
              onPageChange={handlePageChange}
            />
          </div>
        </motion.div>
      </div>
    </div>
  ) : notFound();
}