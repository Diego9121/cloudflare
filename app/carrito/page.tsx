'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, Producto, Modulo, Subcategoria } from '@/lib/supabase';
import { formatCurrency, WHATSAPP_ADMIN, DEPARTAMENTOS_BOLIVIA } from '@/lib/constants';
import { useCart } from '@/components/cart-context';

export default function CarritoPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, totalItems } = useCart();
  const [productos, setProductos] = useState<(Producto & { cantidad?: number; modulo_nombre?: string; subcategoria_nombre?: string })[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    departamento: '',
    provincia: '',
    notas: '',
  });

  useEffect(() => {
    loadProductos();
  }, [items.length]);

  async function loadProductos() {
    if (items.length === 0) {
      setProductos([]);
      setModulos([]);
      setSubcategorias([]);
      setLoading(false);
      return;
    }

    const productoIds = items.map(item => item.productoId);
    
    const productosRes = await supabase
      .from('productos')
      .select('*')
      .in('id', productoIds)
      .eq('activo', true);

    if (!productosRes.data || productosRes.data.length === 0) {
      setLoading(false);
      return;
    }

    const moduloIds = [...new Set(productosRes.data.map(p => p.modulo_id))];
    const subcategoriaIds = [...new Set(
      productosRes.data
        .filter(p => p.subcategoria_id)
        .map(p => p.subcategoria_id as string)
    )];

    const [modulosRes, subcategoriasRes] = await Promise.all([
      supabase.from('modulos').select('*').in('id', moduloIds),
      subcategoriaIds.length > 0
        ? supabase.from('subcategorias').select('*').in('id', subcategoriaIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (modulosRes.data && subcategoriasRes.data) {
      const productosConCantidad = productosRes.data.map(p => {
        const item = items.find(i => i.productoId === p.id);
        const cantidadOriginal = item?.cantidad || 0;
        const cantidadAjustada = Math.min(cantidadOriginal, p.stock);
        
        if (cantidadAjustada < cantidadOriginal) {
          updateQuantity(p.id, cantidadAjustada);
        }
        
        const modulo = modulosRes.data.find(m => m.id === p.modulo_id);
        const subcategoria = subcategoriasRes.data.find(s => s.id === p.subcategoria_id);
        
        return { 
          ...p, 
          cantidad: cantidadAjustada,
          modulo_nombre: modulo?.nombre || '',
          subcategoria_nombre: subcategoria?.nombre || '',
        };
      });
      setProductos(productosConCantidad);
      setModulos(modulosRes.data);
      setSubcategorias(subcategoriasRes.data);
    }
    setLoading(false);
  }

  const updateItemQuantity = (productId: string, delta: number) => {
    const item = items.find(i => i.productoId === productId);
    if (item) {
      updateQuantity(productId, item.cantidad + delta);
    }
  };

  const getSubtotal = () => {
    return productos.reduce((sum, p) => {
      const cantidad = items.find(i => i.productoId === p.id)?.cantidad || 0;
      const precio = p.precio_descuento || p.precio;
      return sum + (precio * cantidad);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const productosCotizacion = productos.map(p => ({
      producto_id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      precio: p.precio_descuento || p.precio,
      cantidad: items.find(i => i.productoId === p.id)?.cantidad || 0,
      modulo_id: p.modulo_id,
      subcategoria_id: p.subcategoria_id,
    }));

    const { error } = await supabase.from('cotizaciones').insert({
      cliente_nombre: formData.nombre,
      cliente_celular: formData.celular,
      cliente_departamento: formData.departamento,
      cliente_provincia: formData.provincia,
      cliente_notas: formData.notas,
      productos: productosCotizacion,
      estado: 'PENDIENTE',
    });

    if (error) {
      alert('Error al guardar cotización');
      setSubmitting(false);
      return;
    }

    const total = getSubtotal();
    
    const groupedByModulo = productos.reduce((acc, p) => {
      const moduloKey = p.modulo_id;
      if (!acc[moduloKey]) {
        acc[moduloKey] = {
          nombre: p.modulo_nombre || 'Sin módulo',
          productos: [],
          subtotal: 0,
        };
      }
      const cantidad = items.find(i => i.productoId === p.id)?.cantidad || 0;
      const precio = p.precio_descuento || p.precio;
      const subtotalProducto = precio * cantidad;
      acc[moduloKey].productos.push({
        codigo: p.codigo,
        cantidad,
        subtotal: subtotalProducto,
        subcategoria: p.subcategoria_nombre || 'Sin subcategoría',
      });
      acc[moduloKey].subtotal += subtotalProducto;
      return acc;
    }, {} as Record<string, { nombre: string; productos: { codigo: string; cantidad: number; subtotal: number; subcategoria: string }[]; subtotal: number }>);

const formatPrecio = (precio: number) => `${precio.toFixed(2)} Bs`;

    let mensajeTexto = `────────────────────
JOYERÍA BELLA - COTIZACIÓN
────────────────────
DATOS DEL CLIENTE
────────────────────
Nombre:    ${formData.nombre}
Celular:   ${formData.celular}
Ubicación: ${formData.departamento} - ${formData.provincia}
Notas:     
────────────────────
PRODUCTOS
────────────────────`;

    Object.values(groupedByModulo).forEach((modulo) => {
      const subcatText = modulo.productos.length > 0 && modulo.productos[0].subcategoria !== 'Sin subcategoría' 
        ? ` (${modulo.productos[0].subcategoria})` 
        : '';
      mensajeTexto += `\n📿 ${modulo.nombre.toUpperCase()}${subcatText}`;
      modulo.productos.forEach(p => {
        mensajeTexto += `\n     ${p.codigo}    x${p.cantidad}    ${formatPrecio(p.subtotal)}`;
      });
      mensajeTexto += `\n     ▸ Subtotal: ${formatPrecio(modulo.subtotal)}`;
    });

    mensajeTexto += `\n────────────────────
        💰 TOTAL: ${formatPrecio(total)}
────────────────────
⏰ IMPORTANTE: Esta cotización tiene validez de 2 horas.
Después de este tiempo, los artículos volverán a estar disponibles.
────────────────────`;

    const mensaje = encodeURIComponent(mensajeTexto);
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${mensaje}`, '_blank');
    
    clearCart();
    alert('Cotización enviada. Recibirás el QR de pago por WhatsApp.');
    router.push('/');
  };

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      const formElement = document.getElementById('form-cotizacion');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const provincias = formData.departamento
    ? DEPARTAMENTOS_BOLIVIA.find(d => d.nombre === formData.departamento)?.provincias || []
    : [];

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-charcoal">Cargando carrito...</div>;
  }

  if (productos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-charcoal mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 text-center">Explora nuestras categorías para agregar productos</p>
        <Link href="/" className="px-8 py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold-dark transition">
          Explorar categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-charcoal hover:text-gold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Continuar comprando</span>
          </Link>
          <span className="bg-gold text-white px-4 py-2 rounded-full font-semibold text-sm">
            {totalItems} producto{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-charcoal">Carrito de Compras</h1>
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
            Vaciar carrito
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {productos.map(producto => {
            const cantidad = items.find(i => i.productoId === producto.id)?.cantidad || 0;
            const precio = producto.precio_descuento || producto.precio;
            const subtotal = precio * cantidad;

            return (
              <div key={producto.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <span className="text-gold font-bold text-sm">{producto.codigo}</span>
                  <h3 className="font-semibold text-lg text-charcoal mt-1">{producto.nombre}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    {producto.precio_descuento ? (
                      <>
                        <span className="text-gray-400 line-through text-sm">{formatCurrency(producto.precio)}</span>
                        <span className="text-gold font-bold">{formatCurrency(producto.precio_descuento)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-charcoal">{formatCurrency(producto.precio)}</span>
                    )}
                    <span className="text-gray-400 text-sm">c/u</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateItemQuantity(producto.id, -1)} 
                    className="bg-gray-100 w-10 h-10 rounded-full hover:bg-gold hover:text-white transition-colors text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-xl w-8 text-center">{cantidad}</span>
                  <button 
                    onClick={() => updateItemQuantity(producto.id, 1)} 
                    className="bg-gray-100 w-10 h-10 rounded-full hover:bg-gold hover:text-white transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[100px]">
                  <span className="text-xl font-bold text-charcoal">{formatCurrency(subtotal)}</span>
                </div>
                <button 
                  onClick={() => removeFromCart(producto.id)} 
                  className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-charcoal">Total:</span>
            <span className="text-3xl font-bold text-gold">{formatCurrency(getSubtotal())}</span>
          </div>
        </div>

        {!showForm ? (
          <button
            onClick={scrollToForm}
            disabled={productos.length === 0}
            className="w-full py-4 text-lg font-semibold rounded-xl transition shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-gold hover:bg-gold-dark text-white"
          >
            {productos.length === 0 ? 'Agrega productos al carrito' : 'Completar Cotización'}
          </button>
        ) : (
          <form id="form-cotizacion" onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl">
              <p className="text-gold-dark font-semibold text-center text-sm md:text-base">
                💰 IMPORTANTE: Debe adelantar el 50% del total de su cotización para asegurar su reserva
              </p>
            </div>

            <h2 className="text-xl font-bold text-charcoal mb-6">Datos de Envío</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Celular (WhatsApp) *</label>
                <input
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold transition"
                  placeholder="Ej: 71123456"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Departamento *</label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value, provincia: '' })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold transition"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {DEPARTAMENTOS_BOLIVIA.map(d => (
                      <option key={d.id} value={d.nombre}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Provincia *</label>
                  <select
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-gold transition"
                    required
                    disabled={!formData.departamento}
                  >
                    <option value="">Seleccionar...</option>
                    {provincias.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Notas / Dirección de envío</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-gold focus:border-gold transition"
                  placeholder="Indica la dirección exacta o cualquier otra indicación..."
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white transition shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar Cotización por WhatsApp'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
