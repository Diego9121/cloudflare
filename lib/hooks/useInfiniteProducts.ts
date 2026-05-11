'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, Producto } from '@/lib/supabase';

interface UseInfiniteProductsOptions {
  moduloId: string;
  subcategoriaId?: string | null;
  pageSize?: number;
}

interface UseInfiniteProductsReturn {
  products: Producto[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useInfiniteProducts({
  moduloId,
  subcategoriaId,
  pageSize = 24,
}: UseInfiniteProductsOptions): UseInfiniteProductsReturn {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const loadProducts = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      let query = supabase
        .from('productos')
        .select('*', { count: 'exact' })
        .eq('modulo_id', moduloId)
        .eq('activo', true)
        .order('codigo', { ascending: true })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      if (subcategoriaId) {
        query = query.eq('subcategoria_id', subcategoriaId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (isRefresh) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

      setHasMore((count || 0) > (pageNum + 1) * pageSize);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    }
  }, [moduloId, subcategoriaId, pageSize]);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setProducts([]);
    setHasMore(true);
    loadProducts(0, true).then(() => setLoading(false));
  }, [moduloId, subcategoriaId]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setPage(prev => prev + 1);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (page > 0) {
      loadProducts(page).then(() => {
        setLoadingMore(false);
        loadingRef.current = false;
      });
    }
  }, [page, loadProducts]);

  const refresh = useCallback(() => {
    setPage(0);
    setProducts([]);
    setHasMore(true);
    setLoading(true);
    loadProducts(0, true).then(() => setLoading(false));
  }, [loadProducts]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    }, optionsRef.current);

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback]);

  return targetRef;
}
