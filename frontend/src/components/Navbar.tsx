'use client';

import Link from 'next/link';
import { GitBranch} from 'lucide-react';
import { Button } from './ui/button';
import { useParams } from 'next/navigation';
import { useSites } from '@/components/SitesProvider';

export function Navbar() {
  const params = useParams();
  const { sites } = useSites();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Impact Index
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {sites.map((site) => (
                <Link
                  key={site.name}
                  href={`/${site.name}`}
                  className={`text-sm ${
                    params.siteId === site.name
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  } transition-colors`}
                >
                  {site.name}
                </Link>
              ))}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-gray-700">
            <a
              href="https://github.com/critique-ai/impact-index"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Code on Github
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
} 