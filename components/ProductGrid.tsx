'use client';

import { useCallback } from 'react';
import { Producto, Subcategoria } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { useInfiniteProducts, useIntersectionObserver } from '@/lib/hooks/useInfiniteProducts';

interface ProductGridProps {
  moduloId: string;
  subcategoriaId?: string | null;
  subcategorias?: Subcategoria[];
}

export function ProductGrid({ moduloId, subcategoriaId, subcategorias }: ProductGridProps) {
  const { products, loading, loadingMore, hasMore, loadMore } = useInfiniteProducts({
    moduloId,
    subcategoriaId,
    pageSize: 24,
  });

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  const loadMoreRef = useIntersectionObserver(handleLoadMore, { threshold: 0.1 });

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-charcoal mb-2">No hay productos</h3>
        <p className="text-gray-500">Esta subcategoría aún no tiene productos disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} subcategorias={subcategorias} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-3 text-charcoal">
              <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              <span>Cargando más productos...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-gray-400 mt-8 text-sm">
          Has visto todos los productos disponibles
        </p>
      )}
    </>
  );
}
