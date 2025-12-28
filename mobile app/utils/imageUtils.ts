/**
 * Image URL utilities with fallback support
 * Primary: Local IP server (10.177.237.139:8000)
 * Fallback: Production server (90skalyanam.com)
 * 
 * Images are stored in:
 * - Profile: /assets/images/user/profile/
 * - Gallery: /assets/images/user/gallery/
 */

export interface ImageUrls {
  primary: string | null;
  fallback: string | null;
}

/**
 * Construct profile image URL with fallback
 * @param image - Image filename or full URL
 * @returns Object with primary and fallback URLs
 */
export const getImageUrl = (image: string | null | undefined): ImageUrls => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  
  const trimmedImage = image.trim();
  // If it's already a full URL (from API), use production URL directly
  if (trimmedImage.startsWith('http')) {
    // If it's a local IP URL, convert to production URL
    if (trimmedImage.includes('10.177.237.139') || trimmedImage.includes('localhost')) {
      // Extract filename from URL
      const filename = trimmedImage.split('/').pop();
      const productionUrl = `https://90skalyanam.com/assets/images/user/profile/${filename}`;
      console.log('🔄 Converting local IP URL to production:', { local: trimmedImage, production: productionUrl });
      return { primary: productionUrl, fallback: null };
    }
    // If it's already a production URL, use it directly
    return { primary: trimmedImage, fallback: null };
  }
  
  // If it's just a filename, construct URL with production server
  const primaryUrl = `https://90skalyanam.com/assets/images/user/profile/${trimmedImage}`;
  // Fallback to environment variable (local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.177.237.139:8000/Final%20Code/assets/assets/images/user/profile';
  const fallbackUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

/**
 * Construct gallery image URL with fallback
 * @param image - Image filename or full URL
 * @returns Object with primary and fallback URLs
 */
export const getGalleryImageUrl = (image: string | null | undefined): ImageUrls => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  
  const trimmedImage = image.trim();
  // If it's already a full URL (from API), use production URL directly
  if (trimmedImage.startsWith('http')) {
    // If it's a local IP URL, convert to production URL
    if (trimmedImage.includes('10.177.237.139') || trimmedImage.includes('localhost')) {
      // Extract filename from URL
      const filename = trimmedImage.split('/').pop();
      const productionUrl = `https://90skalyanam.com/assets/images/user/gallery/${filename}`;
      console.log('🔄 Converting local IP gallery URL to production:', { local: trimmedImage, production: productionUrl });
      return { primary: productionUrl, fallback: null };
    }
    // If it's already a production URL, use it directly
    return { primary: trimmedImage, fallback: null };
  }
  
  // If it's just a filename, construct URL with production server
  const primaryUrl = `https://90skalyanam.com/assets/images/user/gallery/${trimmedImage}`;
  // Fallback to environment variable (local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || 'http://10.177.237.139:8000/Final%20Code/assets/assets/images/user/gallery';
  const fallbackUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

/**
 * Get primary image URL only (for simple cases)
 * @param image - Image filename or full URL
 * @returns Primary image URL or null
 */
export const getPrimaryImageUrl = (image: string | null | undefined): string | null => {
  const urls = getImageUrl(image);
  return urls.primary;
};

/**
 * Get primary gallery image URL only (for simple cases)
 * @param image - Image filename or full URL
 * @returns Primary gallery image URL or null
 */
export const getPrimaryGalleryImageUrl = (image: string | null | undefined): string | null => {
  const urls = getGalleryImageUrl(image);
  return urls.primary;
};
