import React from 'react';
import { Play, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { getImageUrl } from '../lib/tmdb';
import type { Movie } from '../lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const year = new Date(movie.release_date).getFullYear();
  const rating = Math.round(movie.vote_average * 10) / 10;

  return (
    <a 
      href={`/movie/${movie.id}`}
      className={cn("group relative overflow-hidden rounded-lg transition-all hover:scale-105", className)}
    >
      <div className="aspect-[2/3] w-full relative">
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-4 w-full">
            <h3 className="text-white font-semibold truncate">{movie.title}</h3>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <span>{year}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                {rating}
              </span>
            </div>
          </div>
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-colors">
            <Play className="w-6 h-6 text-white fill-white" />
          </button>
        </div>
      </div>
    </a>
  );
}