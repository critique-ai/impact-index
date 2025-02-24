'use client';

import { getProfileResponse } from '@/lib/utils';
import { useSites } from '@/components/SitesProvider';
import { useContext } from 'react';
import { notFound } from 'next/navigation';
import { motion } from "motion/react";
import { Award, BarChart3, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { useState, useEffect } from 'react';
import type { ProfileResponse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  const accountId = params?.accountId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileResponse | null>(null);

  const { sites } = useSites();
  const currentSite = sites.find((site) => site.name === params?.siteId);
  if (!currentSite) notFound();

  useEffect(() => {
    const response = getProfileResponse(currentSite.name, accountId);
    response.then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [currentSite.name, accountId]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <Link
              href={`/${currentSite.name}`}
              className="text-gray-400 transition-colors"
            >
              ← Back to {currentSite.name} rankings
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : data?.entity ? (
            <section 
              id="stats" 
              className="scroll-mt-32 py-16 border-t border-gray-200"
            >
              <h2 className="text-2xl font-bold mb-8">Statistics</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                  label="H-Index"
                  value={data?.entity.index}
                  icon={Award}
                  iconColor="text-yellow-500"
                  delay={0.1}
                />
                <StatsCard
                  label={`Total ${currentSite.metric_name}`}
                  value={data?.entity.total_metrics}
                  icon={BarChart3}
                  iconColor="text-blue-500"
                  delay={0.2}
                />
                <StatsCard
                  label="Percentile"
                  value={data?.stats.percentile}
                  icon={Calendar}
                  iconColor="text-green-500"
                  delay={0.3}
                />
              </div>
            </section>
          ) : notFound()}
        </motion.div>
      </div>
    </div>
  );
}