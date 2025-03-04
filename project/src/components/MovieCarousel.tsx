import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { getNowPlayingMovies, getImageUrl, getMovieDetails } from '../lib/tmdb';
import type { Movie, MovieDetails } from '../lib/tmdb';

export function MovieCarousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMovieDetails, setCurrentMovieDetails] = useState<MovieDetails | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const autoplayTimeoutRef = useRef<number>();
  const SLIDE_DURATION = 500; // Aumentado para uma transição mais suave
  const AUTOPLAY_DELAY = 8000; // Aumentado para dar mais tempo de leitura
  const CONTENT_ANIMATION_DELAY = 100; // Delay para a animação do conteúdo

  const startAutoplayTimer = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      window.clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = window.setTimeout(() => {
      if (!isTransitioning) {
        changeSlide('next');
      }
    }, AUTOPLAY_DELAY);
  }, [isTransitioning]);

  const changeSlide = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning || movies.length === 0) return;

    setIsTransitioning(true);
    setSlideDirection(direction === 'next' ? 'right' : 'left');
    
    // Pequeno delay antes de mudar o slide para permitir que a animação de fade-out do conteúdo ocorra
    setTimeout(() => {
      const nextIndex = direction === 'next'
        ? (currentIndex + 1) % movies.length
        : (currentIndex - 1 + movies.length) % movies.length;

      setCurrentIndex(nextIndex);
    }, CONTENT_ANIMATION_DELAY);

    // Reset do estado de transição após a animação completa
    setTimeout(() => {
      setIsTransitioning(false);
      startAutoplayTimer();
    }, SLIDE_DURATION + CONTENT_ANIMATION_DELAY);
  }, [movies.length, isTransitioning, currentIndex, startAutoplayTimer]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getNowPlayingMovies();
        setMovies(fetchedMovies.filter(movie => movie.backdrop_path));
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movies[currentIndex]) return;
      
      try {
        const details = await getMovieDetails(movies[currentIndex].id.toString());
        setCurrentMovieDetails(details);
      } catch (err) {
        console.error('Failed to load movie details:', err);
      }
    };

    fetchMovieDetails();
  }, [currentIndex, movies]);

  useEffect(() => {
    if (movies.length === 0 || isTransitioning) return;
    startAutoplayTimer();
    return () => {
      if (autoplayTimeoutRef.current) {
        window.clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [movies.length, isTransitioning, startAutoplayTimer]);

  const handleTrailerClick = () => {
    if (!currentMovieDetails?.videos?.results) return;

    const trailer = currentMovieDetails.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    }
  };

  const handleIndicatorClick = (index: number) => {
    if (isTransitioning || index === currentIndex || movies.length === 0) return;
    
    setIsTransitioning(true);
    setSlideDirection(index > currentIndex ? 'right' : 'left');
    
    // Pequeno delay antes de mudar o slide
    setTimeout(() => {
      setCurrentIndex(index);
    }, CONTENT_ANIMATION_DELAY);
    
    setTimeout(() => {
      setIsTransitioning(false);
      startAutoplayTimer();
    }, SLIDE_DURATION + CONTENT_ANIMATION_DELAY);
  };

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
  const hasTrailer = currentMovieDetails?.videos?.results?.some(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div className="relative h-full">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0 scale-100'
                : index === (currentIndex - 1 + movies.length) % movies.length
                ? 'opacity-0 -translate-x-full scale-95'
                : 'opacity-0 translate-x-full scale-95'
            }`}
            style={{ zIndex: index === currentIndex ? 1 : 0 }}
          >
            <img
              src={getImageUrl(movie.backdrop_path)}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

            {/* Conteúdo do slide */}
            <div className={`absolute inset-0 z-10 flex items-center transition-all duration-500 ease-in-out ${
              isTransitioning 
                ? `opacity-0 transform ${slideDirection === 'right' ? '-translate-x-1/4' : 'translate-x-1/4'} scale-95`
                : 'opacity-100 translate-x-0 scale-100'
            }`}>
              <div className="container mx-auto px-4">
                <div className="max-w-2xl space-y-4 transform transition-all duration-500">
                  <h1 className="text-4xl md:text-6xl font-bold text-white">{movie.title}</h1>
                  <p className="text-lg text-white/80">{movie.overview}</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleTrailerClick}
                      disabled={!hasTrailer}
                      className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-white/90 hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      Assistir Trailer
                    </button>
                    <a 
                      href={`/movie/${movie.id}`}
                      className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95"
                    >
                      <Info className="w-5 h-5" />
                      Mais Informações
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => changeSlide('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => changeSlide('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentIndex === index 
                ? 'bg-white w-8' 
                : 'bg-white/50 w-2 hover:bg-white/70 hover:w-4'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}