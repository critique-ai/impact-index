'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MorphingText } from "@/components/magicui/morphing-text";
import { RippleButton } from "@/components/magicui/ripple-button";
import { useSites } from '@/components/SitesProvider';

export default function Home() {
  const { sites } = useSites();
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
              The Impact Index of 
            </h1>
            <div className="flex justify-center w-full">
              <MorphingText texts={sites.map(site => site.name)} />
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-12 mt-4">
            Check out the H-index breakdowns for various sites. (Fully Open Source btw.)
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
                <summary className="cursor-pointer text-lg font-medium">What's an H index?</summary>
                <p className="mt-2 text-gray-600">The H-index is a metric that measures both the productivity and citation impact of the publications of a scientist or scholar.</p>
              </details>
              <details className="border-b border-gray-300 pb-4">
                <summary className="cursor-pointer text-lg font-medium">Why did you make this?</summary>
                <p className="mt-2 text-gray-600">Just something I always wondered</p>
              </details>
              <details className="border-b border-gray-300 pb-4">
                <summary className="cursor-pointer text-lg font-medium">Who's behind this?</summary>
                <p className="mt-2 text-gray-600">Critique AI, <a href="https://critique-labs.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">check us out</a></p>
              </details>
            </div>
          </div>
      </div>
    </div>
  );
}
