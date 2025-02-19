'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  delay?: number;
}

export function StatsCard({ label, value, icon: Icon, iconColor, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-800 rounded-xl p-6 shadow-xl"
    >
      <div className="space-y-2">
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-3xl font-bold text-white flex items-center gap-2">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </motion.div>
  );
} 