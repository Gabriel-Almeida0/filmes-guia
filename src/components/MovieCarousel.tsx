import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { getNowPlayingMovies, getImageUrl } from '../lib/tmdb';
import type { Movie } from '../lib/tmdb';

export function MovieCarousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getNowPlayingMovies();
        setMovies(fetchedMovies);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-[70vh] bg-white/5 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>
    );
  }

  if (error || movies.length === 0) {
    return (
      <div className="relative h-[70vh] bg-black flex items-center justify-center">
        <div className="text-white/60 text-center">
          {error || 'No movies available'}
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div className="relative h-full">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(currentMovie.backdrop_path)}
            alt={currentMovie.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white">{currentMovie.title}</h1>
              <p className="text-lg text-white/80">{currentMovie.overview}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
                  <Play className="w-5 h-5 fill-black" />
                  Watch Trailer
                </button>
                <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => setCurrentIndex((prev) => (prev + 1) % movies.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}