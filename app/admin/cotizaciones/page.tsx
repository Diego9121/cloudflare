'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Cotizacion, CotizacionProducto } from '@/lib/supabase';
import { formatCurrency, WHATSAPP_ADMIN } from '@/lib/constants';
import { AdminProtected } from '@/components/admin-protected';

interface ProductoStock {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
}

export default function CotizacionesAdmin() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [productosStock, setProductosStock] = useState<ProductoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cotizacionesRes, productosRes] = await Promise.all([
      supabase.from('cotizaciones').select('*').order('created_at', { ascending: false }),
      supabase.from('productos').select('id, codigo, nombre, stock').order('codigo'),
    ]);
    if (cotizacionesRes.data) setCotizaciones(cotizacionesRes.data);
    if (productosRes.data) setProductosStock(productosRes.data);
    setLoading(false);
  }

  const filteredCotizaciones = cotizaciones.filter(c => {
    const matchesEstado = !filterEstado || c.estado === filterEstado;
    const matchesSearch = c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cliente_celular.includes(searchTerm);
    return matchesEstado && matchesSearch;
  });

  const getStockProducto = (productoId: string): number => {
    const producto = productosStock.find(p => p.id === productoId);
    return producto?.stock || 0;
  };

  const tieneStockInsuficiente = (productos: CotizacionProducto[]): boolean => {
    return productos.some(p => p.cantidad > getStockProducto(p.producto_id));
  };

  const updateEstado = async (id: string, nuevoEstado: string) => {
    const cotizacion = cotizaciones.find(c => c.id === id);
    if (!cotizacion) return;

    if (nuevoEstado === 'APROBADO' && tieneStockInsuficiente(cotizacion.productos)) {
      const insuficiente = cotizacion.productos.filter(p => p.cantidad > getStockProducto(p.producto_id));
      const mensaje = `Stock insuficiente:\n${insuficiente.map(p => `${p.codigo}: Solicitado ${p.cantidad}, Disponible ${getStockProducto(p.producto_id)}`).join('\n')}\n\n¿Desea aprobar de todos modos?`;
      
      if (!confirm(mensaje)) return;
    }

    if (nuevoEstado === 'APROBADO') {
      for (const producto of cotizacion.productos) {
        const stockActual = getStockProducto(producto.producto_id);
        if (stockActual >= producto.cantidad) {
          const nuevoStock = stockActual - producto.cantidad;
          await supabase.from('productos').update({ stock: nuevoStock }).eq('id', producto.producto_id);
        }
      }
      const productosRes = await supabase.from('productos').select('id, codigo, nombre, stock').order('codigo');
      if (productosRes.data) setProductosStock(productosRes.data);
    }

    await supabase.from('cotizaciones').update({ estado: nuevoEstado as any, updated_at: new Date().toISOString() }).eq('id', id);
    loadData();
  };

  const deleteCotizacion = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return;
    await supabase.from('cotizaciones').delete().eq('id', id);
    loadData();
  };

  const getTotal = (productos: CotizacionProducto[]) => {
    return productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const contactByWhatsApp = (celular: string) => {
    window.open(`https://wa.me/${celular.replace(/\s/g, '')}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-xl text-gold">Cargando...</div>;
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-gold py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cotizaciones en Curso</h1>
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="text-gold-light hover:text-white">← Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 min-w-[200px]"
          />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredCotizaciones.map(cotizacion => {
            const productos = cotizacion.productos;
            const total = getTotal(productos);
            const stockInsuficiente = tieneStockInsuficiente(productos);
            const estadoBadgeColor = cotizacion.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                   cotizacion.estado === 'PAGADO' ? 'bg-blue-100 text-blue-700' :
                                   cotizacion.estado === 'APROBADO' ? 'bg-green-100 text-green-700' :
                                   'bg-red-100 text-red-700';

            return (
              <div key={cotizacion.id} className={`bg-white rounded-xl shadow-md overflow-hidden ${stockInsuficiente && (cotizacion.estado === 'PENDIENTE' || cotizacion.estado === 'PAGADO') ? 'ring-2 ring-red-400' : ''}`}>
                <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-charcoal">{cotizacion.cliente_nombre}</h3>
                    <p className="text-gray-600">{cotizacion.cliente_celular}</p>
                    <p className="text-sm text-gray-500">
                      {cotizacion.cliente_departamento} - {cotizacion.cliente_provincia}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${estadoBadgeColor}`}>
                      {cotizacion.estado}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(cotizacion.created_at)}</p>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-charcoal mb-3">Productos:</h4>
                  <div className="space-y-2">
                    {productos.map((prod, idx) => {
                      const stockDisp = getStockProducto(prod.producto_id);
                      const sinStock = prod.cantidad > stockDisp;
                      return (
                        <div key={idx} className={`flex justify-between items-center border-b border-gray-100 pb-2 ${sinStock ? 'bg-red-50 px-2 py-1 rounded' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gold">{prod.codigo}</span>
                            <span className="text-gray-600">{prod.nombre}</span>
                            {sinStock && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                Stock: {stockDisp}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">x{prod.cantidad}</span>
                            <span className="ml-4 font-semibold">{formatCurrency(prod.precio * prod.cantidad)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-gold flex justify-between items-center">
                    <span className="text-lg font-bold text-charcoal">Total:</span>
                    <span className="text-2xl font-bold text-gold">{formatCurrency(total)}</span>
                  </div>

                  {cotizacion.cliente_notas && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{cotizacion.cliente_notas}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => contactByWhatsApp(cotizacion.cliente_celular)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Contactar
                  </button>
                  
                  {cotizacion.estado === 'PENDIENTE' && (
                    <>
                      <button
                        onClick={() => updateEstado(cotizacion.id, 'PAGADO')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Marcar Pagado
                      </button>
                      <button
                        onClick={() => updateEstado(cotizacion.id, 'RECHAZADO')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {cotizacion.estado === 'PAGADO' && (
                    <>
                      <button
                        onClick={() => updateEstado(cotizacion.id, 'APROBADO')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => updateEstado(cotizacion.id, 'RECHAZADO')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteCotizacion(cotizacion.id)}
                    className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCotizaciones.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay cotizaciones que mostrar
            </div>
          )}
        </div>
      </main>
    </div>
    </AdminProtected>
  );
}
