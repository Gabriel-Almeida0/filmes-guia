import React, { useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { getGenres, getMoviesByGenre } from '../lib/tmdb';
import { useScrollPosition } from '../hooks/useScrollPosition';
import type { Movie, Genre } from '../lib/tmdb';

export function Genres() {
  const { id } = useParams<{ id: string }>();
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadedMovieIds = useRef(new Set<number>());

  // Usa o hook de scroll com uma chave única para cada gênero
  useScrollPosition(`genres-scroll-${id || 'list'}`);

  React.useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        setError('Failed to load genres');
        console.error(err);
      }
    };

    fetchGenres();
  }, []);

  const loadMovies = async (pageNumber: number, isInitial: boolean = false) => {
    if (!id || isLoadingMore) return;

    try {
      if (isInitial) {
        setIsLoading(true);
        loadedMovieIds.current.clear();
      } else {
        setIsLoadingMore(true);
      }

      const { results, total_pages } = await getMoviesByGenre(id, pageNumber);
      
      const newMovies = results
        .filter(movie => movie.poster_path)
        .filter(movie => !loadedMovieIds.current.has(movie.id));
      
      newMovies.forEach(movie => loadedMovieIds.current.add(movie.id));
      
      if (isInitial) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }
      
      if (newMovies.length === 0 && pageNumber < total_pages) {
        loadMovies(pageNumber + 1, false);
        return;
      }
      
      setHasMore(pageNumber < total_pages);
    } catch (err) {
      setError('Failed to load movies');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  React.useEffect(() => {
    if (id) {
      setPage(1);
      setMovies([]);
      setHasMore(true);
      loadMovies(1, true);
    }
  }, [id]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoadingMore && id) {
      setPage(prev => {
        const nextPage = prev + 1;
        loadMovies(nextPage);
        return nextPage;
      });
    }
  }, [hasMore, isLoadingMore, id]);

  React.useEffect(() => {
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

  const currentGenre = genres.find(genre => genre.id.toString() === id);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {!id ? (
          <>
            <h1 className="text-3xl font-bold mb-8">Gêneros</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <a
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                >
                  <h2 className="text-xl font-semibold">{genre.name}</h2>
                </a>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8">
              {currentGenre ? currentGenre.name : 'Carregando...'}
            </h1>
            
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
                movies.map((movie) => (
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

            {!isLoading && !error && !hasMore && (
              <div className="text-center text-white/60 py-8">
                Você chegou ao fim da lista!
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}