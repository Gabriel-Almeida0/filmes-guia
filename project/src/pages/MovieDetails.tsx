import React from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getMovieDetails, getImageUrl } from '../lib/tmdb';
import type { MovieDetails } from '../lib/tmdb';

export function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = React.useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
      } catch (err) {
        setError('Failed to load movie details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleTrailerClick = () => {
    if (!movie?.videos?.results) return;

    const trailer = movie.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="h-[70vh] bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-white/60 text-center">
          {error || 'Movie not found'}
        </div>
      </div>
    );
  }

  const releaseYear = new Date(movie.release_date).getFullYear();
  const rating = Math.round(movie.vote_average * 10) / 10;
  const runtime = `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`;
  const hasTrailer = movie.videos?.results?.some(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50" />
        </div>

        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-64 flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-white/60 mt-2">{movie.tagline}</p>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span>{releaseYear}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                  {rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {runtime}
                </span>
                <div className="flex items-center gap-2">
                  {movie.genres.map((genre) => (
                    <a
                      key={genre.id}
                      href={`/genres/${genre.id}`}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {genre.name}
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-lg leading-relaxed">{movie.overview}</p>

              <button 
                onClick={handleTrailerClick}
                disabled={!hasTrailer}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-white/90"
              >
                <Play className="w-5 h-5 fill-black" />
                Assistir Trailer
              </button>
            </div>
          </div>

          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Elenco Principal</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {movie.credits.cast.slice(0, 6).map((actor) => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={getImageUrl(actor.profile_path, 'w500')}
                      alt={actor.name}
                      className="w-full aspect-[2/3] rounded-lg object-cover mb-2"
                    />
                    <p className="font-semibold">{actor.name}</p>
                    <p className="text-sm text-white/60">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}