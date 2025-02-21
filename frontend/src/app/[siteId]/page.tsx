'use client';

import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { dummyTopResponse, dummySites } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SitePage({
  params: { siteId },
}: {
  params: { siteId: string };
}) {
  const site = dummySites.find(s => s.id === siteId);
  if (!site) notFound();

  const data = dummyTopResponse(siteId);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            {site.name} Rankings
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            {site.hIndexDescription}
          </p>

          <div className="flex justify-center mb-12">
            <SearchBar
              siteId={siteId}
              placeholder={`Search for a ${site.entityName.toLowerCase()}...`}
            />
          </div>

          <div className="rounded-xl shadow-xl p-6">
            <DataTable
              data={data.entries}
              siteId={siteId}
              metricName={site.metricName}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}