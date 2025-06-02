import { useEffect, useState, useCallback, useRef } from 'react';

interface PageState<T> {
  data: T;
  timestamp: number;
}

export function usePageState<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const isInitializedRef = useRef(false);

  // Carrega o estado salvo
  useEffect(() => {
    if (isInitializedRef.current) return;

    try {
      const savedStateJson = localStorage.getItem(`state-${key}`);
      if (savedStateJson) {
        const savedState: PageState<T> = JSON.parse(savedStateJson);
        if (Date.now() - savedState.timestamp < 30 * 60 * 1000) { // 30 minutos
          setData(savedState.data);
        } else {
          localStorage.removeItem(`state-${key}`);
        }
      }
    } catch (error) {
      console.error('Error restoring page state:', error);
    }

    isInitializedRef.current = true;
  }, [key]);

  // Função para atualizar o estado
  const updateData = useCallback((newData: T) => {
    setData(newData);
    const state: PageState<T> = {
      data: newData,
      timestamp: Date.now()
    };
    localStorage.setItem(`state-${key}`, JSON.stringify(state));
  }, [key]);

  // Salva o estado antes de desmontar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state: PageState<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`state-${key}`, JSON.stringify(state));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [key, data]);

  return [data, updateData] as const;
}