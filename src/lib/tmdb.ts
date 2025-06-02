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

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
}

export interface TVShowDetails extends TVShow {
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  tagline: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
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

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
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

export async function getTrendingMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const data = await fetchFromTMDB<{ results: Movie[]; total_pages: number }>('/trending/movie/week', {
    page: page.toString()
  });
  return {
    results: data.results || [],
    total_pages: data.total_pages
  };
}

export async function getTrendingTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB<{ results: TVShow[]; total_pages: number }>('/trending/tv/week', {
    page: page.toString()
  });
  return {
    results: data.results || [],
    total_pages: data.total_pages
  };
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/movie/now_playing');
  return data.results || [];
}

export async function getAiringTodayTVShows(): Promise<TVShow[]> {
  const data = await fetchFromTMDB<{ results: TVShow[] }>('/tv/airing_today');
  return data.results || [];
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`, {
    append_to_response: 'credits,videos'
  });
}

export async function getTVShowDetails(id: string): Promise<TVShowDetails> {
  return fetchFromTMDB<TVShowDetails>(`/tv/${id}`, {
    append_to_response: 'credits'
  });
}

export async function getMoviesByGenre(genreId: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const data = await fetchFromTMDB<{ results: Movie[]; total_pages: number }>('/discover/movie', {
    with_genres: genreId,
    page: page.toString()
  });
  return {
    results: data.results || [],
    total_pages: data.total_pages
  };
}

export async function getTVShowsByGenre(genreId: string, page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB<{ results: TVShow[]; total_pages: number }>('/discover/tv', {
    with_genres: genreId,
    page: page.toString()
  });
  return {
    results: data.results || [],
    total_pages: data.total_pages
  };
}

export async function getGenres(type: 'movie' | 'tv' = 'movie'): Promise<Genre[]> {
  const data = await fetchFromTMDB<{ genres: Genre[] }>(`/genre/${type}/list`);
  return data.genres || [];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>('/search/movie', {
    query
  });
  return data.results || [];
}

export async function searchTVShows(query: string): Promise<TVShow[]> {
  const data = await fetchFromTMDB<{ results: TVShow[] }>('/search/tv', {
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