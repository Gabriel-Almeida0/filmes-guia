import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { TVShowCard } from '../components/TVShowCard';
import { searchMovies, searchTVShows } from '../lib/tmdb';
import type { Movie, TVShow } from '../lib/tmdb';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [tvShows, setTVShows] = React.useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const search = async () => {
      if (!query) {
        setMovies([]);
        setTVShows([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [movieResults, tvResults] = await Promise.all([
          searchMovies(query),
          searchTVShows(query)
        ]);

        // Filtra filmes e séries sem imagens
        setMovies(movieResults.filter(movie => movie.poster_path));
        setTVShows(tvResults.filter(show => show.poster_path));
      } catch (err) {
        setError('Falha ao buscar resultados');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Resultados para "{query}"</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-white/60" />
          </div>
        ) : error ? (
          <div className="text-center text-white/60 py-8">
            {error}
          </div>
        ) : movies.length === 0 && tvShows.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            Nenhum resultado encontrado para "{query}"
          </div>
        ) : (
          <div className="space-y-8">
            {movies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Filmes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </section>
            )}

            {tvShows.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Séries</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tvShows.map((show) => (
                    <TVShowCard key={show.id} show={show} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}