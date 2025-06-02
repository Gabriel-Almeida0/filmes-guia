import React from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCarousel } from '../components/MovieCarousel';
import { MovieCard } from '../components/MovieCard';
import { getTrendingMovies } from '../lib/tmdb';
import type { Movie } from '../lib/tmdb';

export function Home() {
  const [trendingMovies, setTrendingMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { results } = await getTrendingMovies();
        // Filtra filmes sem imagens
        setTrendingMovies(results.filter(movie => movie.poster_path));
      } catch (err) {
        setError('Failed to load trending movies');
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
      <MovieCarousel />
      
      <main className="container mx-auto px-4 py-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Em Alta</h2>
            <a href="/movies" className="text-white/60 hover:text-white transition-colors">
              Ver Todos
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
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
              trendingMovies.slice(0, 4).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}