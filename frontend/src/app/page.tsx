'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MorphingText } from "@/components/magicui/morphing-text";
import { RippleButton } from "@/components/magicui/ripple-button";
import { useSites } from '@/components/SitesProvider';
import { AuroraText } from '@/components/magicui/aurora-text';
import { PreviewModal } from '@/components/PreviewModal';

export default function Home() {
  const { sites } = useSites();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewUrl('https://en.wikipedia.org/wiki/H-index#Calculation');
      setIsPreviewOpen(true);
    }, 500); // basically 0 second delay
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Check if we're moving to the preview window
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('[data-preview-window]')) {
      return;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsPreviewOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
              The Impact index of
            </h1>
            <div className="flex justify-center w-full">
              <MorphingText texts={sites.map(site => site.name).concat(['everything'])} />
            </div>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 mt-8">
            Calculating an <span 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="font-medium border-b border-dotted border-gray-500 hover:border-gray-700 cursor-help text-slate-900 dark:text-slate-200"
            >H-index</span> of sorts for various sites on the web.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
            (Fully Open Source btw.)
          </p>

          <div className="flex justify-center gap-4 mb-12">
            {sites.map((site) => (
              <Link href={`/${site.name}`} key={site.name}>
                <RippleButton rippleColor="#ADD8E6">
                  {site.name}
                </RippleButton>
              </Link>
            ))}
          </div>

          <div className="mt-24">
            <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
            <div className="space-y-4">
              <details className="border-b border-gray-300 pb-4">
                <summary className="cursor-pointer text-lg font-medium">What do you mean H-index on everything?</summary>
                <p className="mt-2 text-gray-600">H-index is an interesting metric that measures impact for researchers in academics. If someone came up with one brilliant thing that's cited by millions, they'd still only have an H index of 1, in order to have a higher H index you have to have a continued string of useful stuff. It's an interesting exercise to apply that to various sites since the principle is quite generalizable. For example for reddit, it represents your impact with comments and posts for a given user, for Youtube it represents the impact of a channel with views over the given videos, etc.  </p>
              </details>
              <details className="border-b border-gray-300 pb-4">
                <summary className="cursor-pointer text-lg font-medium">Why did you make this?</summary>
                <p className="mt-2 text-gray-600">Trying to raise my own H-index</p>
              </details>
              <details className="border-b border-gray-300 pb-4">
                <summary className="cursor-pointer text-lg font-medium">Who's behind this?</summary>
                <p className="mt-2 text-gray-600">One of the tinkerers at Critique AI, <a href="https://critique-labs.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">check us out</a></p>
              </details>
            </div>
          </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        url={previewUrl}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
