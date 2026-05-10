/**
 * Generate optimized Cloudinary image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: {
    width?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif';
  } = {}
): string {
  if (!url) return '';
  
  const { width = 400, quality = 'auto', format = 'auto' } = options;
  
  if (url.includes('res.cloudinary.com')) {
    return url.replace(
      '/upload/',
      `/upload/w_${width},q_${quality},f_${format},c_fill/`
    );
  }
  
  return url;
}

/**
 * Generate srcset for responsive images with Cloudinary
 */
export function generateSrcSet(
  url: string | null | undefined,
  widths: number[] = [200, 400, 640, 800, 1200]
): string {
  if (!url) return '';
  
  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Get thumbnail URL (small, optimized)
 */
export function getThumbnailUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, { width: 200 });
}

/**
 * Get medium URL (product grid)
 */
export function getMediumUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, { width: 400 });
}

/**
 * Get large URL (product detail)
 */
export function getLargeUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, { width: 800 });
}
