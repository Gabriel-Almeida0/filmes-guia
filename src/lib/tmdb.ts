const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB API key is not configured. Please add VITE_TMDB_API_KEY to your .env file.');
}

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
    ...params
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB: ${endpoint}`, error);
    throw error;
  }
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/trending/movie/week');
  return data.results || [];
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/movie/now_playing');
  return data.results || [];
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`, {
    append_to_response: 'credits'
  });
}

export async function getMoviesByGenre(genreId: string): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/discover/movie', {
    with_genres: genreId
  });
  return data.results || [];
}

export async function getGenres(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
  return data.genres || [];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/search/movie', {
    query
  });
  return data.results || [];
}

export function getImageUrl(path: string | null, size: 'original' | 'w500' = 'original'): string {
  if (!path) {
    return 'https://via.placeholder.com/500x750?text=No+Image';
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
}