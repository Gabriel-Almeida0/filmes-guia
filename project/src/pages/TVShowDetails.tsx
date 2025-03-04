import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getTVShowDetails, getImageUrl } from '../lib/tmdb';
import type { TVShowDetails } from '../lib/tmdb';

export function TVShowDetails() {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = React.useState<TVShowDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchShow = async () => {
      if (!id) return;
      
      try {
        const data = await getTVShowDetails(id);
        setShow(data);
      } catch (err) {
        setError('Falha ao carregar detalhes da série');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShow();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="h-[70vh] bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-white/60 text-center">
          {error || 'Série não encontrada'}
        </div>
      </div>
    );
  }

  const year = new Date(show.first_air_date).getFullYear();
  const rating = Math.round(show.vote_average * 10) / 10;
  const runtime = show.episode_run_time[0] ? `${show.episode_run_time[0]}min por episódio` : 'Duração variável';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(show.backdrop_path)}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50" />
        </div>

        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-64 flex-shrink-0">
              <img
                src={getImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold">{show.name}</h1>
                {show.tagline && (
                  <p className="text-xl text-white/60 mt-2">{show.tagline}</p>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span>{year}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                  {rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {runtime}
                </span>
                <div className="flex items-center gap-2">
                  {show.genres.map((genre) => (
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

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-white/80">
                  <span>{show.number_of_seasons} temporadas</span>
                  <span>{show.number_of_episodes} episódios</span>
                </div>
                <p className="text-lg leading-relaxed">{show.overview}</p>
              </div>
            </div>
          </div>

          {show.credits?.cast && show.credits.cast.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Elenco Principal</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {show.credits.cast.slice(0, 6).map((actor) => (
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