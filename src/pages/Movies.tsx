import React from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { getTrendingMovies } from '../lib/tmdb';
import type { Movie } from '../lib/tmdb';

export function Movies() {
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getTrendingMovies();
        setMovies(data);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
            movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}