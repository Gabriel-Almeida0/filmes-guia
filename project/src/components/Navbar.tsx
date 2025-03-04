import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
              <Film className="w-8 h-8" />
              <span>Almeida Filmes</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/movies" className="text-white/80 hover:text-white transition-colors">Filmes</a>
              <a href="/tv-shows" className="text-white/80 hover:text-white transition-colors">Séries</a>
              <a href="/genres" className="text-white/80 hover:text-white transition-colors">Gêneros</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className={cn(
              "relative transition-all duration-300",
              isSearchFocused ? "w-64" : "w-48"
            )}>
              <input
                type="search"
                placeholder="Buscar filmes..."
                className="w-full bg-white/10 text-white placeholder-white/60 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
              >
                <Search className="w-4 h-4 text-white/60" />
              </button>
            </form>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="/movies" className="block text-white/80 hover:text-white transition-colors">Filmes</a>
            <a href="/tv-shows" className="block text-white/80 hover:text-white transition-colors">Séries</a>
            <a href="/genres" className="block text-white/80 hover:text-white transition-colors">Gêneros</a>
          </div>
        </div>
      )}
    </nav>
  );
}