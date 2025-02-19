'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { dummySites } from '../lib/utils';

export function AnimatedTitle() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dummySites.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-4xl md:text-6xl font-bold text-center">
      The H-Index of{' '}
      <span className="relative inline-block w-32">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            className="absolute left-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {dummySites[currentIndex].name}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}