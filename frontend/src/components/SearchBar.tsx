'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ siteId, placeholder }: { siteId: string; placeholder: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${siteId}/${query.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-gray-800 py-4 pl-12 pr-4 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>
    </form>
  );
}