'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getSearchSuggestions } from '@/lib/utils';
import { PreviewModal } from './PreviewModal';

interface Suggestion {
  identifier: string;
  index: number;
  url: string;
}

interface SearchBarProps {
  siteId: string;
  placeholder: string;
  onSearch: (term: string) => void;
  onSuggestionSelect?: (suggestion: Suggestion) => void;
}

export function SearchBar({ siteId, placeholder, onSearch, onSuggestionSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const { suggestions } = await getSearchSuggestions(siteId, searchQuery);
    setSuggestions(suggestions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Debounce the suggestions fetch
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 300);

    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.identifier);
    setShowSuggestions(false);
    // Show preview modal with the constructed URL
    setPreviewUrl(`/${siteId}/${suggestion.identifier}`);
    setShowPreview(true);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewUrl('');
  };

  const handlePreviewMouseLeave = (e: React.MouseEvent) => {
    handleClosePreview();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(''); // Trigger search with empty string to reset
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query); // This will trigger the no results message in the parent component
  };

  return (
    <>
      <div className="w-full max-w-2xl" ref={searchContainerRef}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full rounded-lg py-4 pl-12 pr-10 placeholder-gray-400 border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.identifier + index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium">{suggestion.identifier}</div>
                    <div className="text-sm text-gray-500 truncate">{suggestion.url}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        url={previewUrl}
        onMouseLeave={handlePreviewMouseLeave}
      />
    </>
  );
}