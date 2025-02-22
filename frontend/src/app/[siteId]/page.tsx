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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TopResponse | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setShowNoResults(false);
      getTopResponse(params.siteId as string, currentPage, perPage)
        .then(response => setData(response));
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetch(`/api/search/${params.siteId}?q=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(results => {
          setSearchResults(results);
          setShowNoResults(results.entities.length === 0);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, params.siteId, currentPage, perPage]);

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
            {currentSite.name} rankings
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            {currentSite.index_description}
          </p>

          <div className="flex flex-col items-center mb-12">
            <SearchBar
              siteId={params.siteId as string}
              placeholder={`Search for a ${currentSite.entity_name.toLowerCase()}...`}
            />
            {showNoResults && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  This {currentSite.entity_name.toLowerCase()} either doesn't exist or hasn't been indexed yet.
                </p>
                <a
                  href={`/${params.siteId}/${searchTerm}`}
                  className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                >
                  Try indexing this {currentSite.entity_name.toLowerCase()}
                </a>
              </div>
            )}
          </div>

          <div className="rounded-xl shadow-xl p-6">
            <DataTable
              data={(searchTerm ? searchResults?.entities : data?.entities) ?? []}
              siteId={params.siteId as string}
              metricName={currentSite.metric_name}
              EntityName={currentSite.entity_name}
              currentPage={currentPage}
              totalPages={(searchTerm ? searchResults?.pagination?.total_pages : data?.pagination?.total_pages) ?? 1}
              onPageChange={handlePageChange}
            />
          </div>
        </motion.div>
      </div>
    </div>
  ) : notFound();
}