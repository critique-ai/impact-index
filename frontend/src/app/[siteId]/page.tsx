'use client';

import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import {  getTopResponse } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { motion } from "motion/react";
import { useSites } from '@/components/SitesProvider';
import { useContext, useState, useEffect, useRef } from 'react';
import type { Site, TopResponse } from '@/types';
import { Loader2 } from 'lucide-react';
import { toWords } from 'number-to-words';
import { PreviewModal } from '@/components/PreviewModal';
import { useTheme } from 'next-themes';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BoxPlotChart } from '@/components/BoxPlot';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const { theme } = useTheme();


  const histConfig = {
    perc: {
      label: "Percentage",
      color: currentSite?.primary_color || "#3b82f6",
    },
  } satisfies ChartConfig

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

  const handleMouseEnter = (url: string) => {
    hoverTimeoutRef.current = setTimeout(() => {
      const previewUrlWithTheme = `${url}${url.includes('?') ? '&' : '?'}theme=${theme || 'light'}`;
      setPreviewUrl(previewUrlWithTheme);
      setIsPreviewOpen(true);
    }, 500);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget?.closest?.('[data-preview-window]')) {
      return;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsPreviewOpen(false);
  };

  const formatHistogramData = (histogram?: Site['histogram']) => {
    if (!histogram) return [];
    return histogram.map(bucket => ({
      range: `${bucket.bucket_start.toFixed(0)}-${bucket.bucket_end.toFixed(0)}`,
      count: bucket.count,
      perc: bucket.percentage
    }));
  };

  const formatBoxPlotData = (histogram?: Site['histogram']) => {
    if (!histogram) return [];
    
    // You'll need to adjust this based on your actual data structure
    return [{
      x: "Distribution",
      min: Math.min(...histogram.map(h => h.bucket_start)),
      max: Math.max(...histogram.map(h => h.bucket_end)),
      median: histogram.reduce((acc, h) => acc + h.bucket_start + h.bucket_end, 0) / (2 * histogram.length),
      firstQuartile: histogram[Math.floor(histogram.length * 0.25)].bucket_start,
      thirdQuartile: histogram[Math.floor(histogram.length * 0.75)].bucket_end,
      outliers: [],
      binData: histogram.map(h => ({
        value: (h.bucket_start + h.bucket_end) / 2,
        count: h.count
      }))
    }];
  };

  return currentSite ? (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex justify-center">
            <h1 className="text-4xl font-bold">
              {currentSite.name} rankings
            </h1>
          </div>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            {currentSite.index_description}
          </p>


          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-4">
            {/* Histogram Column */}
            {currentSite.histogram && (
              <>
                <div className="md:col-span-6">
                  <ChartContainer config={histConfig}>
                    <BarChart
                      data={formatHistogramData(currentSite.histogram)}
                      margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="range"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{stroke: "currentColor", fontSize: 12}}
                        label={{ 
                          value: 'Index Range', 
                          position: 'bottom',
                          offset: 10,
                          className: "text-muted-foreground"
                        }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        fill={currentSite.primary_color || "#3b82f6"}
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList
                          dataKey="perc"
                          position="top"
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                          fill="currentColor"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="md:col-span-6">
                      <BoxPlotChart
                        width={400}
                        height={300}
                        data={formatBoxPlotData(currentSite.histogram)}
                        color={currentSite.primary_color || "#3b82f6"}
                      />
                </div>
              </>
            )}
          </div>


          <div className="flex flex-col items-center mb-12">
            <SearchBar
              siteId={params.siteId as string}
              placeholder={`Search for ${currentSite.entity_name.toLowerCase()}...`}
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
                  Try indexing {searchTerm}
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
                resultsPerPage={perPage}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </div>
        </motion.div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        url={previewUrl}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  ) : notFound();
}