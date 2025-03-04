import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollState {
  position: number;
  timestamp: number;
}

export function useScrollPosition(key: string) {
  const location = useLocation();
  const isRestoringRef = useRef(false);
  const scrollTimeout = useRef<number>();

  useEffect(() => {
    const restoreScroll = () => {
      try {
        const savedStateJson = localStorage.getItem(`scroll-${key}`);
        if (savedStateJson) {
          const savedState: ScrollState = JSON.parse(savedStateJson);
          if (Date.now() - savedState.timestamp < 30 * 60 * 1000) { // 30 minutos
            isRestoringRef.current = true;
            window.scrollTo({
              top: savedState.position,
              behavior: 'instant'
            });
            // Garante que o scroll foi aplicado
            requestAnimationFrame(() => {
              window.scrollTo({
                top: savedState.position,
                behavior: 'instant'
              });
              isRestoringRef.current = false;
            });
          }
        }
      } catch (error) {
        console.error('Error restoring scroll position:', error);
      }
    };

    // Restaura o scroll após um pequeno delay para garantir que o conteúdo foi renderizado
    setTimeout(restoreScroll, 0);

    const saveScroll = () => {
      if (isRestoringRef.current) return;

      const state: ScrollState = {
        position: window.scrollY,
        timestamp: Date.now()
      };
      localStorage.setItem(`scroll-${key}`, JSON.stringify(state));
    };

    const handleScroll = () => {
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = window.setTimeout(saveScroll, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScroll);
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
      saveScroll();
    };
  }, [key]);

  // Reseta o scroll em navegações diretas
  useEffect(() => {
    if (!location.key && !isRestoringRef.current) {
      window.scrollTo(0, 0);
    }
  }, [location]);
}