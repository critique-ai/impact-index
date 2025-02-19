'use client';

import { dummyProfileResponse, dummySites } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, BarChart3, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { MetricsChart } from '@/components/MetricsChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProfilePage({
  params: { siteId, accountId },
}: {
  params: { siteId: string; accountId: string };
}) {
  const site = dummySites.find(s => s.id === siteId);
  if (!site) notFound();

  const data = dummyProfileResponse(siteId, accountId);
  if (!data) notFound();

  const metricsData = {
    labels: data.profile.topContent.map(c => c.title.slice(0, 20) + '...'),
    values: data.profile.topContent.map(c => c.metrics),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <Link
              href={`/${siteId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to {site.name} Rankings
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatsCard
              label="H-Index"
              value={data.profile.hIndex}
              icon={Award}
              iconColor="text-yellow-500"
              delay={0.1}
            />
            <StatsCard
              label={`Total ${site.metricName}`}
              value={data.profile.totalMetrics}
              icon={BarChart3}
              iconColor="text-blue-500"
              delay={0.2}
            />
            <StatsCard
              label="Content Count"
              value={data.profile.topContent.length}
              icon={Calendar}
              iconColor="text-green-500"
              delay={0.3}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <MetricsChart data={metricsData} label={site.metricName} />
            
            <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6">Top Content</h2>
              <div className="space-y-4">
                {data.profile.topContent.map((content) => (
                  <a
                    key={content.id}
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                      <div className="flex-grow pr-4">
                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {content.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {content.metrics.toLocaleString()} {site.metricName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(content.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}