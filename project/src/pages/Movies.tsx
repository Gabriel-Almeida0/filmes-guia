import React, { useCallback, useRef, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { getTrendingMovies } from '../lib/tmdb';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { usePageState } from '../hooks/usePageState';
import type { Movie } from '../lib/tmdb';

interface MoviesState {
  movies: Movie[];
  page: number;
  hasMore: boolean;
}

export function Movies() {
  const [state, setState] = usePageState<MoviesState>('movies', {
    movies: [],
    page: 1,
    hasMore: true
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadedMovieIds = useRef(new Set<number>());
  const isInitialLoadRef = useRef(true);

  useScrollPosition('movies-scroll');

  // Inicializa o set de IDs com os filmes já carregados
  useEffect(() => {
    loadedMovieIds.current = new Set(state.movies.map(movie => movie.id));
  }, []);

  const loadMovies = async (pageNumber: number, isInitial: boolean = false) => {
    if (isLoadingMore) return;

    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const { results, total_pages } = await getTrendingMovies(pageNumber);
      
      const newMovies = results
        .filter(movie => movie.poster_path)
        .filter(movie => !loadedMovieIds.current.has(movie.id));
      
      newMovies.forEach(movie => loadedMovieIds.current.add(movie.id));
      
      setState({
        movies: isInitial ? newMovies : [...state.movies, ...newMovies],
        page: pageNumber,
        hasMore: pageNumber < total_pages
      });
      
      if (newMovies.length === 0 && pageNumber < total_pages) {
        loadMovies(pageNumber + 1, false);
      }
    } catch (err) {
      setError('Failed to load movies');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isInitialLoadRef.current && state.movies.length === 0) {
      loadMovies(1, true);
      isInitialLoadRef.current = false;
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && state.hasMore && !isLoadingMore) {
      loadMovies(state.page + 1);
    }
  }, [state.hasMore, isLoadingMore, state.page]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Filmes</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading ? (
            [...Array(10)].map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse"
              />
            ))
          ) : error ? (
            <div className="col-span-full text-center text-white/60 py-8">
              {error}
            </div>
          ) : (
            state.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </div>

        <div
          ref={observerTarget}
          className="h-20 flex justify-center items-center mt-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-white/60">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Carregando mais filmes...</span>
            </div>
          )}
        </div>

        {!isLoading && !error && !state.hasMore && (
          <div className="text-center text-white/60 py-8">
            Você chegou ao fim da lista!
          </div>
        )}
      </main>
    </div>
  );
}