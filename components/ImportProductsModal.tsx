'use client';

import { useState, useRef } from 'react';
import { Modulo, Subcategoria } from '@/lib/supabase';

interface ImportProductsModalProps {
  modulos: Modulo[];
  subcategorias: Subcategoria[];
  onClose: () => void;
  onComplete: () => void;
}

interface ProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  modulo: string;
  subcategoria: string;
}

export function ImportProductsModal({ modulos, subcategorias, onClose, onComplete }: ImportProductsModalProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentProduct: '' });
  const [result, setResult] = useState<{ success: number; warnings: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('El CSV debe tener al menos una fila de datos');
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes('codigo') || !header.includes('precio')) {
        alert('El CSV debe tener las columnas: codigo,nombre,precio,stock,modulo,subcategoria');
        return;
      }

      const parsedProducts: ProductRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 5) {
          parsedProducts.push({
            codigo: parts[0].trim(),
            nombre: parts[1].trim(),
            precio: parseFloat(parts[2]) || 0,
            stock: parseInt(parts[3]) || 0,
            modulo: parts[4]?.trim() || '',
            subcategoria: parts[5]?.trim() || '',
          });
        }
      }

      setProducts(parsedProducts);
    };
    reader.readAsText(file);
  };

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setPhotos(Array.from(files));
  };

  const findPhoto = (codigo: string): File | undefined => {
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const ext of exts) {
      const found = photos.find(p => 
        p.name.toLowerCase().replace(ext, '') === codigo.toLowerCase() ||
        p.name.toLowerCase() === codigo.toLowerCase() + ext
      );
      if (found) return found;
    }
    return undefined;
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmkxj8sls';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'joyeria_bella');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || null;
    } catch {
      return null;
    }
  };

  const startImport = async () => {
    if (products.length === 0) {
      alert('No hay productos para importar');
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: products.length, currentProduct: '' });

    const errors: string[] = [];
    let success = 0;
    let warnings = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      setProgress({ 
        current: i + 1, 
        total: products.length, 
        currentProduct: `${product.codigo} - ${product.nombre}` 
      });

      const moduloData = modulos.find(m => m.nombre.toUpperCase() === product.modulo.toUpperCase());
      if (!moduloData) {
        errors.push(`Fila ${i + 1}: Módulo "${product.modulo}" no encontrado`);
        continue;
      }

      let subcategoriaId: string | null = null;
      if (product.subcategoria) {
        const subcat = subcategorias.find(s => 
          s.nombre.toUpperCase() === product.subcategoria.toUpperCase() && 
          s.modulo_id === moduloData.id
        );
        subcategoriaId = subcat?.id || null;
      }

      let imagenUrl: string | null = null;
      const photo = findPhoto(product.codigo);
      if (photo) {
        imagenUrl = await uploadToCloudinary(photo);
      }

      const productoData = {
        codigo: product.codigo,
        nombre: product.nombre,
        precio: product.precio,
        stock: product.stock,
        modulo_id: moduloData.id,
        subcategoria_id: subcategoriaId,
        imagen_url: imagenUrl,
        activo: true,
      };

      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error?.includes('duplicate') || errorData.error?.includes('único')) {
          warnings++;
        } else {
          errors.push(`Fila ${i + 1}: ${errorData.error || 'Error desconocido'}`);
        }
      } else {
        success++;
      }
    }

    setImporting(false);
    setResult({ success, warnings, errors });
  };

  const handleClose = () => {
    if (!importing) {
      onComplete();
      onClose();
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-charcoal mb-4">✅ Importación Completada</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Exitosos:</span>
              <span className="font-bold text-green-600">{result.success}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Omitidos (ya existen):</span>
              <span className="font-bold text-yellow-600">{result.warnings}</span>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-red-600 font-medium mb-2">Errores:</p>
                <ul className="text-sm text-red-500 list-disc list-inside max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>...y {result.errors.length - 5} más</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold-dark transition"
          >
            Cerrar y ver productos
          </button>
        </div>
      </div>
    );
  }

  if (importing) {
    const percentage = Math.round((progress.current / progress.total) * 100);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-charcoal mb-4">⏳ Importando productos...</h2>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gold h-4 rounded-full transition-all duration-300" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-center text-gray-600 mt-2">{percentage}%</p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium text-charcoal">Actual:</p>
            <p className="truncate">{progress.currentProduct}</p>
            <p className="mt-2 text-gray-400">
              {progress.current} de {progress.total}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-charcoal mb-6">📥 Importar Productos desde CSV</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              1. Seleccionar archivo CSV *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvSelect}
              ref={fileInputRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-gold"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: codigo,nombre,precio,stock,modulo,subcategoria
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              2. Seleccionar fotos (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosSelect}
              ref={photosInputRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-gold"
            />
            <p className="text-xs text-gray-500 mt-1">
              Los nombres de las fotos deben coincidir con los códigos (ej: A001.jpg)
            </p>
          </div>

          {products.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Vista previa:</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p>• {products.length} productos detectados</p>
                <p>• Módulos: {[...new Set(products.map(p => p.modulo))].join(', ')}</p>
                <p>• Fotos seleccionadas: {photos.length}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={startImport}
              disabled={products.length === 0}
              className="flex-1 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold-dark transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🚀 Iniciar Importación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}