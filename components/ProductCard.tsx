import Image from 'next/image';
import Link from 'next/link';
import { memo, useState, useEffect } from 'react';
import { Producto, Subcategoria } from '@/lib/supabase';
import { formatCurrency } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { useCart } from './cart-context';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface ProductCardProps {
  product: Producto;
  subcategorias?: Subcategoria[];
  subcategoriaActivaId?: string | null;
}

function ProductCardComponent({ product, subcategorias, subcategoriaActivaId }: ProductCardProps) {
  const { updateQuantity, items } = useCart();
  const [mostrarControles, setMostrarControles] = useState(false);
  
  const cantidad = items.find(i => i.productoId === product.id)?.cantidad || 0;
  const precio = product.precio_descuento || product.precio;
  const tieneDescuento = !!product.precio_descuento;
  const estaAgotado = product.stock === 0;
  const stockDisponible = product.stock;

  useEffect(() => {
    if (cantidad > 0) {
      setMostrarControles(true);
    } else {
      setMostrarControles(false);
    }
  }, [cantidad]);

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (estaAgotado || cantidad >= stockDisponible) return;
    updateQuantity(product.id, cantidad + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cantidad > 0) {
      updateQuantity(product.id, cantidad - 1);
      if (cantidad <= 1) {
        setMostrarControles(false);
      }
    }
  };

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, 1);
    setMostrarControles(true);
  };

  const isMaxStock = cantidad >= stockDisponible;

  const getSubcategoriaNombre = (id: string | null) => {
    if (!id) return '';
    const sub = subcategorias?.find(s => s.id === id);
    return sub?.nombre || '';
  };

  return (
    <Link
      href={`/modulo/${product.modulo_id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.imagen_url ? (
          <Image
            src={getOptimizedImageUrl(product.imagen_url, { width: 400 })}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhBhMxFCJR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAABAgMAEWH/2gAMAwEAAhEDEQA/AJHRtYv9RuJbe0ntYnjALNIGwc59CIpWq6Lf6dp0lxNd2k0aFVZYGYsCWx0eB/aiWvakll4jvb2RWkjhlWNWUZIbIwf5RVRp9y7aJbSNIzO0YZmY5JJ9a1x2Ylq5P//Z"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg font-bold">{product.codigo.substring(0, 2)}</span>
            </div>
          </div>
        )}
        
        {estaAgotado && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge className="bg-red-600 text-sm px-4 py-1">AGOTADO</Badge>
          </div>
        )}
        
        {!estaAgotado && tieneDescuento && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold">
            -{Math.round((1 - product.precio_descuento! / product.precio) * 100)}%
          </Badge>
        )}

        {product.subcategoria_id && product.subcategoria_id !== subcategoriaActivaId && (
          <Badge variant="outline" className="absolute top-3 left-3 bg-white/95 border-gray-200 text-charcoal text-xs">
            {getSubcategoriaNombre(product.subcategoria_id)}
          </Badge>
        )}
      </div>

      <div className="p-2 flex flex-col flex-1">
        <p className="text-xs text-gray-500 font-medium mb-0">{product.codigo}</p>
        
        <div className="flex items-center gap-1 mb-1">
          {tieneDescuento && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.precio)}
            </span>
          )}
          <span className={`text-base font-bold ${tieneDescuento ? 'text-red-500' : 'text-charcoal'}`}>
            {formatCurrency(precio)}
          </span>
        </div>

        {!estaAgotado ? (
          mostrarControles ? (
            <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded flex items-center justify-center font-bold text-charcoal bg-white hover:bg-green-500 hover:text-white transition-all duration-200 text-sm"
              >
                -
              </button>
              <span className="w-5 text-center font-bold text-xs">{cantidad}</span>
              <button
                onClick={handleIncrement}
                disabled={isMaxStock}
                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-all duration-200 text-sm ${
                  isMaxStock
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-charcoal hover:bg-green-500 hover:text-white'
                }`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAgregar}
              disabled={stockDisponible === 0}
              className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-green-500 hover:to-green-600 text-white font-bold text-xs uppercase rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
            >
              AGREGAR AL PEDIDO
            </button>
          )
        ) : (
          <div className="text-center text-gray-400 text-sm py-2">
            Sin stock
          </div>
        )}
      </div>
    </Link>
  );
}

export const ProductCard = memo(ProductCardComponent);
