'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, Modulo, Subcategoria, createSubcategoria, updateProductCodesBySubcategoria } from '@/lib/supabase';
import { AdminProtected } from '@/components/admin-protected';
import { ImageCropModal } from '@/components/ImageCropModal';

export default function ModulosAdmin() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [showSubcategoriaModal, setShowSubcategoriaModal] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);
  const [selectedModuloId, setSelectedModuloId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [modulosRes, subcategoriasRes] = await Promise.all([
      supabase.from('modulos').select('*').order('nombre'),
      supabase.from('subcategorias').select('*').order('nombre'),
    ]);
    if (modulosRes.data) setModulos(modulosRes.data);
    if (subcategoriasRes.data) setSubcategorias(subcategoriasRes.data);
    setLoading(false);
  }

  const getSubcategoriasByModulo = (moduloId: string) => {
    return subcategorias.filter(s => s.modulo_id === moduloId);
  };

  const deleteModulo = async (id: string) => {
    if (!confirm('¿Eliminar este módulo? Las subcategorías asociadas también se eliminarán.')) return;
    await supabase.from('subcategorias').delete().eq('modulo_id', id);
    await supabase.from('modulos').delete().eq('id', id);
    loadData();
  };

  const deleteSubcategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta subcategoría?')) return;
    await supabase.from('subcategorias').delete().eq('id', id);
    loadData();
  };

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-xl text-gold">Cargando...</div>;
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-gold py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Gestionar Módulos y Subcategorías</h1>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold hover:text-white transition text-sm">
              ← Dashboard
            </Link>
            <Link href="/admin/productos" className="px-3 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold hover:text-white transition text-sm">
              Productos
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-charcoal">Módulos</h2>
              <button onClick={() => { setEditingModulo(null); setShowModuloModal(true); }} className="btn-gold text-sm">
                + Nuevo Módulo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modulos.map(modulo => (
                <div key={modulo.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="relative h-32 bg-gradient-to-br from-gold/20 to-gold-dark/20">
                    {modulo.imagen_url ? (
                      <Image src={modulo.imagen_url} alt={modulo.nombre} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-gold/50">{modulo.prefijo_codigo}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-charcoal">{modulo.nombre}</p>
                        <p className="text-sm text-gold">({modulo.prefijo_codigo})</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setEditingModulo(modulo); setShowModuloModal(true); }} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteModulo(modulo.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {modulos.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No hay módulos creados
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-charcoal">Subcategorías</h2>
              <button onClick={() => { setSelectedModuloId(modulos[0]?.id || ''); setEditingSubcategoria(null); setShowSubcategoriaModal(true); }} className="btn-gold text-sm" disabled={modulos.length === 0}>
                + Nueva Subcategoría
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Filtrar por módulo:</label>
              <select
                value={selectedModuloId}
                onChange={(e) => setSelectedModuloId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Todos los módulos</option>
                {modulos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {subcategorias
                .filter(s => !selectedModuloId || s.modulo_id === selectedModuloId)
                .map(sub => {
                  const modulo = modulos.find(m => m.id === sub.modulo_id);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                          <span className="text-gold text-xs font-bold">{modulo?.prefijo_codigo}</span>
                        </div>
                        <div>
                          <span className="font-medium text-charcoal">{sub.nombre}</span>
                          <span className="ml-2 text-sm text-gray-500">en {modulo?.nombre}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingSubcategoria(sub); setShowSubcategoriaModal(true); }} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                        <button onClick={() => deleteSubcategoria(sub.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              {subcategorias.filter(s => !selectedModuloId || s.modulo_id === selectedModuloId).length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay subcategorías</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModuloModal && (
        <ModuloModal
          modulo={editingModulo}
          onClose={() => { setShowModuloModal(false); setEditingModulo(null); }}
          onSave={loadData}
        />
      )}

      {showSubcategoriaModal && (
        <SubcategoriaModal
          subcategoria={editingSubcategoria}
          modulos={modulos}
          selectedModuloId={selectedModuloId || modulos[0]?.id}
          onClose={() => { setShowSubcategoriaModal(false); setEditingSubcategoria(null); }}
          onSave={loadData}
        />
      )}
    </div>
    </AdminProtected>
  );
}

function ModuloModal({ modulo, onClose, onSave }: { modulo: Modulo | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: modulo?.nombre || '',
    prefijo_codigo: modulo?.prefijo_codigo || '',
    imagen_url: modulo?.imagen_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const cloudName = 'dmkxj8sls';

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

    const file = new File([croppedBlob], 'modulo-image.jpg', { type: 'image/jpeg' });
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
    setGuardando(true);
    
    const data = {
      nombre: form.nombre,
      prefijo_codigo: form.prefijo_codigo.toUpperCase(),
      imagen_url: form.imagen_url || null,
    };

    try {
      if (modulo) {
        await supabase.from('modulos').update(data).eq('id', modulo.id);
      } else {
        await supabase.from('modulos').insert(data);
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Error al guardar módulo');
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-charcoal mb-6">{modulo ? 'Editar Módulo' : 'Nuevo Módulo'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden mb-3">
              {form.imagen_url ? (
                <Image src={form.imagen_url} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Sin imagen</span>
                </div>
              )}
            </div>
            {uploading ? (
              <span className="text-gold text-sm">Subiendo...</span>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="modulo-camera-upload"
                  />
                  <label htmlFor="modulo-camera-upload" className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Tomar Foto
                  </label>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="modulo-gallery-upload"
                  />
                  <label htmlFor="modulo-gallery-upload" className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galería
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Módulo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: Aretes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prefijo de Código</label>
            <input
              type="text"
              value={form.prefijo_codigo}
              onChange={(e) => setForm({ ...form, prefijo_codigo: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: AR"
              maxLength={3}
              required
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 btn-gold py-2.5 disabled:opacity-50">
              {guardando ? 'Guardando...' : modulo ? 'Guardar' : 'Crear'}
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

function SubcategoriaModal({ subcategoria, modulos, selectedModuloId, onClose, onSave }: { 
  subcategoria: Subcategoria | null; 
  modulos: Modulo[];
  selectedModuloId: string;
  onClose: () => void; 
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    nombre: subcategoria?.nombre || '',
    modulo_id: subcategoria?.modulo_id || selectedModuloId,
    prefijo_codigo: subcategoria?.prefijo_codigo || '',
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.prefijo_codigo || form.prefijo_codigo.trim() === '') {
      alert('El prefijo de código es obligatorio');
      return;
    }
    
    setGuardando(true);
    
    try {
      const selectedModulo = modulos.find((m: Modulo) => m.id === form.modulo_id);
      const prefijoUpper = form.prefijo_codigo.toUpperCase().trim();
      
      if (subcategoria) {
        const oldPrefijo = subcategoria.prefijo_codigo || '';
        
        await supabase.from('subcategorias').update({
          nombre: form.nombre,
          prefijo_codigo: prefijoUpper
        }).eq('id', subcategoria.id);
        
        if (oldPrefijo !== prefijoUpper && selectedModulo) {
          await updateProductCodesBySubcategoria(
            subcategoria.id,
            oldPrefijo,
            prefijoUpper,
            selectedModulo.prefijo_codigo
          );
        }
      } else {
        await createSubcategoria(form.nombre, form.modulo_id, prefijoUpper);
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Error al guardar subcategoría');
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-charcoal mb-6">{subcategoria ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de Subcategoría</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: Colgantes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Módulo</label>
            <select
              value={form.modulo_id}
              onChange={(e) => setForm({ ...form, modulo_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              required
            >
              {modulos.map((m: Modulo) => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.prefijo_codigo})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prefijo de Código *</label>
            <input
              type="text"
              value={form.prefijo_codigo}
              onChange={(e) => setForm({ ...form, prefijo_codigo: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-gold"
              placeholder="Ej: C (máx 4 caracteres)"
              maxLength={4}
              required
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 btn-gold py-2.5 disabled:opacity-50">
              {guardando ? 'Guardando...' : subcategoria ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
