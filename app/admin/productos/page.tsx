'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, Producto, Modulo, Subcategoria, generateProductCode } from '@/lib/supabase';
import { formatCurrency } from '@/lib/constants';
import { AdminProtected } from '@/components/admin-protected';
import { ImageCropModal } from '@/components/ImageCropModal';
import { ImportProductsModal } from '@/components/ImportProductsModal';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [filterAgotados, setFilterAgotados] = useState(false);
  const [showNuevoModuloModal, setShowNuevoModuloModal] = useState(false);
  const [showNuevaSubcategoriaModal, setShowNuevaSubcategoriaModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filterModulo, setFilterModulo] = useState('');
  const [filterSubcategoria, setFilterSubcategoria] = useState('');
  const productsPerPage = 30;

  useEffect(() => {
    loadTotalCount();
    loadModulosYSubcategorias();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAgotados, filterModulo, filterSubcategoria]);

  useEffect(() => {
    loadTotalCount();
  }, [filterModulo, filterSubcategoria, filterAgotados]);

  useEffect(() => {
    loadProductsPage(currentPage);
  }, [currentPage, filterAgotados, filterModulo, filterSubcategoria]);

  async function loadTotalCount() {
    const params = new URLSearchParams();
    params.set('limit', '1');
    if (filterAgotados) params.set('agotados', 'true');
    if (filterModulo) params.set('modulo', filterModulo);
    if (filterSubcategoria) params.set('subcategoria', filterSubcategoria);
    
    const res = await fetch(`/api/admin/productos?${params}`);
    const data = await res.json();
    setTotalProducts(data.total || 0);
  }

  async function loadProductsPage(page: number) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', productsPerPage.toString());
    if (filterAgotados) params.set('agotados', 'true');
    if (filterModulo) params.set('modulo', filterModulo);
    if (filterSubcategoria) params.set('subcategoria', filterSubcategoria);
    
    const res = await fetch(`/api/admin/productos?${params}`);
    const data = await res.json();
    if (data.productos) setProductos(data.productos);
    setLoading(false);
  }

  async function loadModulosYSubcategorias() {
    const [modulosRes, subcategoriasRes] = await Promise.all([
      fetch('/api/admin/modulos?tipo=modulos'),
      fetch('/api/admin/modulos?tipo=subcategorias'),
    ]);
    const modulosData = await modulosRes.json();
    const subcategoriasData = await subcategoriasRes.json();
    if (modulosData.data) setModulos(modulosData.data);
    if (subcategoriasData.data) setSubcategorias(subcategoriasData.data);
  }

  const getModuloNombre = (id: string) => modulos.find(m => m.id === id)?.nombre || '';
  const getSubcategoriaNombre = (id: string | null) => id ? subcategorias.find(s => s.id === id)?.nombre || '' : '';

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    await fetch(`/api/admin/productos?id=${id}`, { method: 'DELETE' });
    loadTotalCount();
    loadProductsPage(currentPage);
  };

  const toggleActivo = async (product: Producto) => {
    await fetch('/api/admin/productos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, activo: !product.activo }),
    });
    loadProductsPage(currentPage);
  };

  const handleModuloCreado = (nuevoModulo: Modulo) => {
    setModulos(prev => [...prev, nuevoModulo]);
    setShowNuevoModuloModal(false);
  };

  const handleSubcategoriaCreada = (nuevaSubcategoria: Subcategoria) => {
    setSubcategorias(prev => [...prev, nuevaSubcategoria]);
    setShowNuevaSubcategoriaModal(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-xl text-gold">Cargando...</div>;
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-gold py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Gestionar Productos</h1>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold hover:text-white transition text-sm">
              ← Dashboard
            </Link>
            <Link href="/admin/modulos" className="px-3 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold hover:text-white transition text-sm">
              Módulos
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <select
              value={filterModulo}
              onChange={(e) => { setFilterModulo(e.target.value); setFilterSubcategoria(''); }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold bg-white"
            >
              <option value="">Todos los módulos</option>
              {modulos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <select
              value={filterSubcategoria}
              onChange={(e) => setFilterSubcategoria(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold bg-white"
              disabled={!filterModulo}
            >
              <option value="">Todas las subcategorías</option>
              {subcategorias
                .filter(s => s.modulo_id === filterModulo)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))
              }
            </select>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm font-semibold shadow-md"
          >
            + Nuevo Producto
          </Link>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-black text-black hover:bg-gray-100 transition text-sm font-semibold"
          >
            📥 Importar CSV
          </button>
          <button
            onClick={() => setFilterAgotados(!filterAgotados)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition ${
              filterAgotados
                ? 'bg-red-500 text-white border-red-500'
                : 'border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white'
            }`}
          >
            {filterAgotados ? 'Ver todos' : 'Solo Agotados'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gold text-white">
              <tr>
                <th className="px-4 py-3 text-left w-24">Imagen</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Módulo</th>
                <th className="px-4 py-3 text-left">Subcategoría</th>
                <th className="px-4 py-3 text-center">Precio</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(product => (
                <tr key={product.id} className={`border-b hover:bg-gray-50 ${!product.activo ? 'bg-gray-100 opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    {product.imagen_url ? (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                        <Image src={product.imagen_url} alt={product.nombre} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{product.codigo.substring(0, 2)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gold">{product.codigo}</td>
                  <td className="px-4 py-3">{getModuloNombre(product.modulo_id)}</td>
                  <td className="px-4 py-3">{getSubcategoriaNombre(product.subcategoria_id)}</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {product.precio_descuento ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm mr-1">{formatCurrency(product.precio)}</span>
                        <span className="text-red-500">{formatCurrency(product.precio_descuento)}</span>
                      </div>
                    ) : (
                      formatCurrency(product.precio)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${product.stock === 0 ? 'text-red-500' : product.stock <= 3 ? 'text-yellow-500' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                    {product.stock === 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">AGOTADO</span>
                    )}
                    {product.stock > 0 && product.stock <= 3 && (
                      <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Stock bajo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="text-blue-500 hover:text-blue-700 mr-2">Editar</button>
                    <button onClick={() => toggleActivo(product)} className="text-yellow-500 hover:text-yellow-700 mr-2">
                      {product.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Anterior
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Siguiente
            </button>
          </div>
        )}

        {totalPages > 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Mostrando {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, totalProducts)} de {totalProducts} productos
          </p>
        )}
      </main>

      {showProductModal && (
        <ProductModal
          product={editingProduct}
          modulos={modulos}
          subcategorias={subcategorias}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
          onSave={() => { loadTotalCount(); loadProductsPage(currentPage); }}
          onOpenNuevoModulo={() => setShowNuevoModuloModal(true)}
          onOpenNuevaSubcategoria={() => setShowNuevaSubcategoriaModal(true)}
        />
      )}

      {showNuevoModuloModal && (
        <NuevoModuloModal
          onClose={() => setShowNuevoModuloModal(false)}
          onSave={handleModuloCreado}
        />
      )}

      {showNuevaSubcategoriaModal && (
        <NuevaSubcategoriaModal
          modulos={modulos}
          onClose={() => setShowNuevaSubcategoriaModal(false)}
          onSave={handleSubcategoriaCreada}
        />
      )}

      {showImportModal && (
        <ImportProductsModal
          modulos={modulos}
          subcategorias={subcategorias}
          onClose={() => setShowImportModal(false)}
          onComplete={() => { loadTotalCount(); loadProductsPage(currentPage); }}
        />
      )}
    </div>
    </AdminProtected>
  );
}

interface ProductModalProps {
  product: Producto | null;
  modulos: Modulo[];
  subcategorias: Subcategoria[];
  onClose: () => void;
  onSave: () => void;
  onOpenNuevoModulo: () => void;
  onOpenNuevaSubcategoria: () => void;
}

function ProductModal({ product, modulos, subcategorias, onClose, onSave, onOpenNuevoModulo, onOpenNuevaSubcategoria }: ProductModalProps) {
  const [form, setForm] = useState({
    modulo_id: product?.modulo_id || '',
    subcategoria_id: product?.subcategoria_id || '',
    precio: product?.precio?.toString() || '',
    precio_descuento: product?.precio_descuento?.toString() || '',
    stock: product?.stock?.toString() || '0',
    imagen_url: product?.imagen_url || '',
    en_liquidacion: !!product?.precio_descuento,
  });
  const [codigo, setCodigo] = useState(product?.codigo || '');
  const [uploading, setUploading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const filteredSubcategorias = subcategorias.filter(s => s.modulo_id === form.modulo_id);

  useEffect(() => {
    if (form.modulo_id && !product) {
      generateCodigo();
    }
  }, [form.modulo_id, form.subcategoria_id]);

  async function generateCodigo() {
    if (!form.modulo_id) return;
    try {
      const subcategoriaId = form.subcategoria_id || null;
      const nuevoCodigo = await generateProductCode(form.modulo_id, subcategoriaId);
      setCodigo(nuevoCodigo);
    } catch (err) {
      console.error('Error generando código:', err);
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmkxj8sls';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true);
    setShowCropModal(false);

    const file = new File([croppedBlob], 'product-image.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'joyeria_bella');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        alert('Error: ' + data.error.message);
      } else {
        setForm(prev => ({ ...prev, imagen_url: data.secure_url }));
      }
    } catch (err) {
      alert('Error al subir imagen: ' + err);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modulo_id) {
      alert('Selecciona un módulo');
      return;
    }
    setGuardando(true);

    const precioNum = parseFloat(String(form.precio)) || 0;
    const precioDescuentoNum = form.en_liquidacion && form.precio_descuento ? parseFloat(String(form.precio_descuento)) : null;

    const productoData = {
      codigo: product?.codigo || codigo,
      nombre: '',
      modulo_id: form.modulo_id,
      subcategoria_id: form.subcategoria_id || null,
      precio: precioNum,
      precio_descuento: precioDescuentoNum,
      stock: parseInt(String(form.stock)) || 0,
      imagen_url: form.imagen_url || null,
      activo: true,
    };

    try {
      if (product) {
        await fetch('/api/admin/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, ...productoData }),
        });
      } else {
        await fetch('/api/admin/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoData),
        });
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Error al guardar producto');
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 sm:p-4 z-50">
      <div className="bg-white rounded-2xl p-3 sm:p-6 w-full max-w-xs sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-2 sm:mb-6">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-40 sm:h-40 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-2">
              {form.imagen_url ? (
                <Image src={form.imagen_url} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {uploading ? (
              <span className="text-gold text-sm">Subiendo...</span>
            ) : (
              <div className="flex gap-2">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="camera-upload"
                  />
                  <label htmlFor="camera-upload" className="cursor-pointer flex items-center gap-1.5 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Foto
                  </label>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label htmlFor="gallery-upload" className="cursor-pointer flex items-center gap-1.5 px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galería
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <div className="flex gap-2">
                <select
                  value={form.modulo_id}
                  onChange={(e) => setForm({ ...form, modulo_id: e.target.value, subcategoria_id: '' })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-gold min-w-0"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {modulos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onOpenNuevoModulo}
                  className="px-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg flex-shrink-0"
                  title="Crear nuevo módulo"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
              <div className="flex gap-2">
                <select
                  value={form.subcategoria_id}
                  onChange={(e) => setForm({ ...form, subcategoria_id: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-gold min-w-0"
                  disabled={!form.modulo_id}
                >
                  <option value="">Ninguna</option>
                  {filteredSubcategorias.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onOpenNuevaSubcategoria}
                  className="px-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg flex-shrink-0"
                  disabled={!form.modulo_id}
                  title="Crear nueva subcategoría"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Precio (Bs)</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
                placeholder="9.50"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
                min="0"
                required
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.en_liquidacion}
                onChange={(e) => setForm({ ...form, en_liquidacion: e.target.checked, precio_descuento: '' })}
                className="w-5 h-5 rounded text-gold focus:ring-gold"
              />
              <span className="font-medium text-gray-700">En Liquidación</span>
            </label>
            {form.en_liquidacion && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Precio de Liquidación (Bs)</label>
                <input
                  type="number"
                  value={form.precio_descuento}
                  onChange={(e) => setForm({ ...form, precio_descuento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
                  placeholder="8.00"
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-100 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Código:</span>
              <span className="font-bold text-gold text-lg">{product ? product.codigo : codigo || 'Selecciona un módulo'}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="flex-1 btn-gold py-3 font-medium disabled:opacity-50">
              {guardando ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>

      {showCropModal && imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onClose={() => { setShowCropModal(false); setImageToCrop(null); }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

interface NuevoModuloModalProps {
  onClose: () => void;
  onSave: (modulo: Modulo) => void;
}

function NuevoModuloModal({ onClose, onSave }: NuevoModuloModalProps) {
  const [nombre, setNombre] = useState('');
  const [prefijo, setPrefijo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !prefijo) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/admin/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'modulo', nombre, prefijo_codigo: prefijo }),
      });
      const data = await res.json();
      if (data.success) onSave(data.data);
    } catch (err) {
      alert('Error al crear módulo');
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-charcoal mb-4">Nuevo Módulo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Módulo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: Anillos"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo de Código</label>
            <input
              type="text"
              value={prefijo}
              onChange={(e) => setPrefijo(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: AN"
              maxLength={3}
              required
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 btn-gold py-2.5 disabled:opacity-50">
              {guardando ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NuevaSubcategoriaModalProps {
  modulos: Modulo[];
  onClose: () => void;
  onSave: (subcategoria: Subcategoria) => void;
}

function NuevaSubcategoriaModal({ modulos, onClose, onSave }: NuevaSubcategoriaModalProps) {
  const [nombre, setNombre] = useState('');
  const [moduloId, setModuloId] = useState(modulos[0]?.id || '');
  const [prefijo, setPrefijo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !moduloId) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/admin/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'subcategoria', nombre, modulo_id: moduloId, prefijo_codigo: prefijo || null }),
      });
      const data = await res.json();
      if (data.success) onSave(data.data);
    } catch (err) {
      alert('Error al crear subcategoría');
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-charcoal mb-4">Nueva Subcategoría</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Subcategoría</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: Compromiso"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
            <select
              value={moduloId}
              onChange={(e) => setModuloId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              required
            >
              {modulos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo de Código (opcional)</label>
            <input
              type="text"
              value={prefijo}
              onChange={(e) => setPrefijo(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: C"
              maxLength={3}
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 btn-gold py-2.5 disabled:opacity-50">
              {guardando ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
