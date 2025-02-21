'use client';

import Link from 'next/link';
import { GitBranch} from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { dummySites } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const currentSite = dummySites.find(site => pathname?.startsWith(`/${site.id}`));

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Impact Index
            </Link>
            {currentSite && (
              <div className="hidden md:flex items-center gap-6">
                {dummySites.map((site) => (
                  <Link
                    key={site.id}
                    href={`/${site.id}`}
                    className={`text-sm ${
                      pathname?.startsWith(`/${site.id}`)
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-white'
                    } transition-colors`}
                  >
                    {site.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="border-gray-700">
            <a
              href="https://github.com/yourusername/project"
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