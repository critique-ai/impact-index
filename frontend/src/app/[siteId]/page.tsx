'use client';

import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import {  getTopResponse } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSites } from '@/components/SitesProvider';
import { useContext, useState, useEffect } from 'react';
import type { Site, TopResponse } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SitePage() {
  const params = useParams();
  const { sites } = useSites();
  const currentSite = sites.find(site => params.siteId === site.name);
  const [data, setData] = useState<TopResponse | null>(null);
  const [filteredData, setFilteredData] = useState<TopResponse['entities']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setShowNoResults(false);
      setFilteredData(data?.entities ?? []);
    } else {
      const filtered = data?.entities.filter(entity => 
        entity.identifier.toLowerCase().includes(searchTerm.toLowerCase())
      ) ?? [];
      setFilteredData(filtered);
      setShowNoResults(filtered.length === 0);
    }
  }, [searchTerm, data]);

  useEffect(() => {
    setIsLoading(true);
    getTopResponse(params.siteId as string, currentPage, perPage)
      .then(response => {
        setData(response);
        setFilteredData(response?.entities ?? []);
        setIsLoading(false);
      });
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
            {currentSite.name} rankings
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            {currentSite.index_description}
          </p>

          <div className="flex flex-col items-center mb-12">
            <SearchBar
              siteId={params.siteId as string}
              placeholder={`Search for a ${currentSite.entity_name.toLowerCase()}...`}
              onSearch={setSearchTerm}
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <DataTable
                data={searchTerm ? filteredData : data?.entities ?? []}
                siteId={params.siteId as string}
                metricName={currentSite.metric_name}
                EntityName={currentSite.entity_name}
                currentPage={currentPage}
                totalPages={data?.pagination?.total_pages ?? 1}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  ) : notFound();
}