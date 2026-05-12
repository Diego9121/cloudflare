'use client';

import { useState, useEffect } from 'react';
import { Producto, Subcategoria } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { supabase } from '@/lib/supabase';

interface ProductGridProps {
  moduloId: string;
  subcategoriaId?: string | null;
  subcategorias?: Subcategoria[];
}

const PRODUCTS_PER_PAGE = 30;

export function ProductGrid({ moduloId, subcategoriaId, subcategorias }: ProductGridProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  useEffect(() => {
    loadProducts(1);
  }, [moduloId, subcategoriaId]);

  async function loadProducts(page: number) {
    setLoading(true);
    const from = (page - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .eq('modulo_id', moduloId)
      .eq('activo', true)
      .order('codigo', { ascending: true })
      .range(from, to);

    if (subcategoriaId) {
      query = query.eq('subcategoria_id', subcategoriaId);
    }

    const { data, count } = await query;
    
    if (data) setProducts(data);
    if (count) setTotalCount(count);
    setLoading(false);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

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

  const indexOfFirst = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const indexOfLast = Math.min(currentPage * PRODUCTS_PER_PAGE, totalCount);

  return (
    <>
      <p className="text-center text-sm text-gray-500 mb-6">
        Mostrando {indexOfFirst} - {indexOfLast} de {totalCount} productos
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} subcategorias={subcategorias} subcategoriaActivaId={subcategoriaId} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showDots = (page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2);
              
              if (!showPage && !showDots) return null;
              
              if (showDots) {
                return <span key={`dots-${page}`} className="px-2 text-gray-400">...</span>;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-gold text-white'
                      : 'bg-white text-charcoal hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Siguiente →
          </button>
        </div>
      )}
    </>
  );
}
