'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 transition-all duration-300 group-focus-within:text-white" />
        
        <Input
          type="text"
          placeholder="搜索作品名称或作者..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-12 h-14 bg-white/20 backdrop-blur-md 
            border-2 border-white/20 
            focus:border-white/50 focus:ring-white/20
            text-white placeholder:text-white/50
            rounded-2xl text-base
            shadow-lg shadow-black/10
            transition-all duration-300
            hover:shadow-xl hover:shadow-black/15"
        />
        
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 
              hover:bg-white/10 rounded-xl
              transition-all duration-200"
          >
            <X className="h-5 w-5 text-white/60 hover:text-white" />
          </Button>
        )}
        
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 
          group-focus-within:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      </div>
    </form>
  );
}
