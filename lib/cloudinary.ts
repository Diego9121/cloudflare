const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south';
}

export function getOptimizedImageUrl(
  publicUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  if (!publicUrl.includes('cloudinary.com')) {
    return publicUrl;
  }

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length === 0) {
    return publicUrl;
  }

  const transformString = transformations.join(',');
  
  const uploadIndex = publicUrl.indexOf('/upload/');
  if (uploadIndex === -1) {
    return publicUrl;
  }

  return `${publicUrl.substring(0, uploadIndex + 8)}${transformString}/${publicUrl.substring(uploadIndex + 8)}`;
}

export const imageSizes = {
  thumbnail: { width: 200, height: 200 },
  card: { width: 400, height: 400 },
  medium: { width: 600, height: 600 },
  large: { width: 800, height: 800 },
  full: { width: 1200, height: 1200 },
};

export function getThumbnailUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    ...imageSizes.card,
    quality: 'auto:eco',
  });
}

export function getMediumUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    ...imageSizes.medium,
    quality: 'auto:good',
  });
}
