import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2 } from 'lucide-react';
import { searchPeople } from '../lib/api';
import SearchResults from '../components/Search Components/SearchResults.jsx';

// --- Search Input ---
const SearchInput = ({ value, onChange, onClear, isLoading }) => (
  <div className="relative w-full max-w-2xl mx-auto">
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5 pointer-events-none" />
      <input
        type="text"
        placeholder="Search for people by name..."
        className="input input-bordered w-full pl-12 pr-4 py-3 h-12 rounded-full bg-base-100 shadow-sm focus:shadow-md transition-all duration-200 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && !isLoading && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-circle btn-xs"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
      )}
    </div>
  </div>
);

// --- Main Page ---
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError, isFetched, error } = useQuery({
    queryKey: ['searchPeople', debouncedTerm],
    queryFn: () => searchPeople(debouncedTerm),
    enabled: debouncedTerm.length > 0,
    retry: false,
  });

  const results = Array.isArray(data) ? data : [];
  const clearSearch = () => setSearchTerm('');

  return (
    <div className="bg-base-100">
      {/* Header + Search Input */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-base-200">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your People</h1>
            <p className="text-base-content/60 text-sm">Search by name to discover community members</p>
          </div>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Results — delegated to SearchResults */}
      <SearchResults
        results={results}
        isLoading={isLoading}
        isError={isError}
        isFetched={isFetched}
        error={error}
        debouncedTerm={debouncedTerm}
        onSuggestionClick={setSearchTerm}
      />
    </div>
  );
};

export default SearchPage;