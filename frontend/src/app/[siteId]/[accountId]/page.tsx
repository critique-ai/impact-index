'use client';

import { getProfileResponse } from '@/lib/utils';
import { useSites } from '@/components/SitesProvider';
import { useContext } from 'react';
import { notFound } from 'next/navigation';
import { motion } from "motion/react";
import { Award, BarChart3, Calendar, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { useState, useEffect } from 'react';
import type { ProfileResponse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTheme  } from 'next-themes';
export default function ProfilePage() {
  const params = useParams();
  const accountId = params?.accountId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const { theme, setTheme } = useTheme();
  const { sites } = useSites();
  const currentSite = sites.find((site) => site.name === params?.siteId);
  if (!currentSite) notFound();

  useEffect(() => {
    // Handle theme from query parameter, checking both current window and parent if in iframe
    const getSearchParams = () => {
      const currentParams = window.location.search;
      if (currentParams) return currentParams;
      
      try {
        // Check if we're in an iframe and try to get parent's search params
        if (window.parent && window.parent !== window) {
          return window.parent.location.search;
        }
      } catch (e) {
        // Catching security errors that might occur when accessing parent
        console.log('Unable to access parent window params');
      }
      return '';
    };

    const searchParams = getSearchParams();
    if (searchParams.includes('theme=dark')) {
      setTheme('dark');
    } else if (searchParams.includes('theme=light')) {
      setTheme('light');
    }

    const response = getProfileResponse(currentSite.name, accountId);
    response.then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [currentSite.name, accountId, setTheme]);

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
              <h2 className="text-2xl font-bold mb-8"> {data.entity.identifier}'s numbers</h2>
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
                <div className="relative group md:col-span-2 lg:col-span-1">
                  <StatsCard
                    label="Ranking"
                    value={`Top ${Math.ceil(100 - (data?.stats.percentile || 0))}%`}
                    icon={Users}
                    iconColor="text-green-500"
                    delay={0.3}
                  >
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${data?.stats.percentile || 0}%`,
                            transform: `translateX(${-(100 - (data?.stats.percentile || 0))}%)`,
                          }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        This account has a higher index than {data?.stats.percentile}% of {currentSite.entity_name}.
                      </p>
                    </div>
                  </StatsCard>
                </div>
                <StatsCard
                  label="Member Since"
                  value={new Date(data?.entity.created_at).toLocaleDateString()}
                  icon={Calendar}
                  iconColor="text-purple-500"
                  delay={0.4}
                />
                <StatsCard
                  label="Last Updated"
                  value={new Date(data?.entity.last_updated_at).toLocaleDateString()}
                  icon={Calendar}
                  iconColor="text-orange-500"
                  delay={0.5}
                />
              </div>
            </section>
          ) : notFound()}
        </motion.div>
      </div>
    </div>
  );
}