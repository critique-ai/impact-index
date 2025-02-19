'use client';

import { AnimatedTitle } from '@/components/AnimatedTitle';
import { Button } from '@/components/ui/button';
import { dummySites } from '@/lib/utils';
import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <AnimatedTitle />
          
          <p className="mt-8 text-xl text-gray-300 leading-relaxed">
            Discover the impact and reach of content creators across different platforms
            through the lens of the H-index metric - a powerful measure of both quality and quantity.
          </p>

          <div className="mt-12 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/reddit">Try Reddit Rankings</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-600 text-gray-300">
              <a href="https://github.com/yourusername/project" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </div>
          
          <div className="grid gap-8 mt-24">
            {dummySites.map((site) => (
              <Link
                key={site.id}
                href={`/${site.id}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 p-8 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold">{site.name}</h2>
                  <p className="mt-4 text-gray-300">{site.description}</p>
                  <div className="mt-6 flex items-center text-blue-400">
                    <span>View Rankings</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}