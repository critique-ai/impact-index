'use client';

import { useEffect, useRef } from 'react';
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

interface MetricsChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  label: string;
}

export function MetricsChart({ data, label }: MetricsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label,
            data: data.values,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, label]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-xl p-6 shadow-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Metrics Distribution</h3>
      <div className="aspect-[16/9]">
        <canvas ref={chartRef} />
      </div>
    </motion.div>
  );
} 