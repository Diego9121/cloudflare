'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function ImageCropModal({ imageSrc, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setLoading(true);
    try {
      const image = new Image();
      image.src = imageSrc;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        alert('Error al crear el contexto del canvas');
        setLoading(false);
        return;
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          } else {
            alert('Error al generar la imagen recortada');
          }
          setLoading(false);
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error al recortar la imagen');
      setLoading(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full h-full sm:w-full sm:max-w-md sm:h-auto overflow-hidden flex flex-col">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-charcoal">Recortar Imagen</h3>
          <p className="text-sm text-gray-500">Ajusta el tamaño y posición</p>
        </div>

        <div className="relative flex-1 min-h-[30vh] sm:h-64 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="p-2 sm:p-4 border-t border-gray-200">
          <div className="mb-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 sm:py-2.5 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={getCroppedImg}
              disabled={loading}
              className="flex-1 bg-gold text-white py-2 sm:py-2.5 rounded-lg hover:bg-gold-dark font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                'Recortar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}