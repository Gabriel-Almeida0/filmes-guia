import React, { useCallback, useRef } from 'react';
import { Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { TVShowCard } from '../components/TVShowCard';
import { getTrendingTVShows } from '../lib/tmdb';
import { useScrollPosition } from '../hooks/useScrollPosition';
import type { TVShow } from '../lib/tmdb';

export function TVShows() {
  const [shows, setShows] = React.useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadedShowIds = useRef(new Set<number>());

  // Usa o hook de scroll
  useScrollPosition('tvshows-scroll');

  const loadShows = async (pageNumber: number, isInitial: boolean = false) => {
    if (isLoadingMore) return;

    try {
      if (isInitial) {
        setIsLoading(true);
        loadedShowIds.current.clear();
      } else {
        setIsLoadingMore(true);
      }

      const { results, total_pages } = await getTrendingTVShows(pageNumber);
      
      const newShows = results.filter(show => !loadedShowIds.current.has(show.id));
      
      newShows.forEach(show => loadedShowIds.current.add(show.id));
      
      if (isInitial) {
        setShows(newShows);
      } else {
        setShows(prev => [...prev, ...newShows]);
      }
      
      if (newShows.length === 0 && pageNumber < total_pages) {
        loadShows(pageNumber + 1, false);
        return;
      }
      
      setHasMore(pageNumber < total_pages);
    } catch (err) {
      setError('Falha ao carregar séries');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  React.useEffect(() => {
    loadShows(1, true);
  }, []);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoadingMore) {
      setPage(prev => {
        const nextPage = prev + 1;
        loadShows(nextPage);
        return nextPage;
      });
    }
  }, [hasMore, isLoadingMore]);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Séries</h1>
        
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
            shows.map((show) => (
              <TVShowCard key={show.id} show={show} />
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
              <span>Carregando mais séries...</span>
            </div>
          )}
        </div>

        {!isLoading && !error && !hasMore && (
          <div className="text-center text-white/60 py-8">
            Você chegou ao fim da lista!
          </div>
        )}
      </main>
    </div>
  );
}