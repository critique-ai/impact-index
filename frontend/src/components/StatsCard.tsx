'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from "motion/react";
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  delay?: number;
  children?: ReactNode;
}

export function StatsCard({ label, value, icon: Icon, iconColor, delay = 0, children }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 shadow-xl"
    >
      <div className="space-y-2">
        <div className="text-gray-400 dark:text-gray-500 text-sm">{label}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      {children}
    </motion.div>
  );
} 