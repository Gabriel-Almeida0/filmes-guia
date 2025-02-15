import React from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { getGenres, getMoviesByGenre } from '../lib/tmdb';
import type { Movie, Genre } from '../lib/tmdb';

export function Genres() {
  const { id } = useParams<{ id: string }>();
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    const fetchMovies = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await getMoviesByGenre(id);
        setMovies(data);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMovies();
    }
  }, [id]);

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
          </>
        )}
      </main>
    </div>
  );
}