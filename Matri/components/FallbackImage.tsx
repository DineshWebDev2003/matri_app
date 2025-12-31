import React, { useState } from 'react';
import { Image } from 'react-native';

import { ImageSourcePropType } from 'react-native';

interface FallbackImageProps {
  source: ImageSourcePropType;
  // Can be static require(...) number or { uri }
  fallbackSource?: ImageSourcePropType;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  [key: string]: any;
}

/**
 * Custom Image component with fallback support
 * If primary image fails to load, automatically tries fallback image
 * 
 * Usage:
 * <FallbackImage 
 *   source={{ uri: primaryUrl }} 
 *   fallbackSource={{ uri: fallbackUrl }}
 *   style={styles.image}
 * />
 */
const FallbackImage = ({ 
  source, 
  fallbackSource,
  ...props 
}: FallbackImageProps) => {
  // Ensure source is properly formatted
  let validSource: ImageSourcePropType;
  
  if (!source) {
    validSource = { uri: '' };
  } else if (typeof source === 'string') {
    validSource = { uri: String(source).trim() };
  } else if (source && typeof source === 'object' && 'uri' in source) {
    const uri = source.uri;
    validSource = { uri: typeof uri === 'string' ? String(uri).trim() : '' };
  } else {
    validSource = { uri: '' };
  }

  // Ensure fallback is properly formatted
  let validFallback: ImageSourcePropType | undefined;
  if (fallbackSource) {
    if (typeof fallbackSource === 'string') {
      validFallback = { uri: String(fallbackSource).trim() };
    } else if (typeof fallbackSource === 'number') {
      // Static require(...) returns a number in React Native
      validFallback = fallbackSource;
    } else if (typeof fallbackSource === 'object' && 'uri' in fallbackSource) {
      const uri = fallbackSource.uri;
      const uriStr = typeof uri === 'string' ? String(uri).trim() : '';
      validFallback = uriStr ? { uri: uriStr } : undefined;
    }
  }
  
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(validSource);
  const [error, setError] = useState(false);

  const handleError = () => {
    // If we have a fallback image (uri or static), switch to it
    if (!error && validFallback) {
      console.log('⚠️ Primary image failed, trying fallback:', typeof validFallback === 'object' && 'uri' in (validFallback as any) ? (validFallback as any).uri : '[static image]');
      setError(true);
      setImageSource(validFallback);
    } else if (!error && !validFallback) {
      console.log('❌ Image failed to load and no fallback available:', validSource.uri);
      setError(true);
    }
  };

  // Don't render if no valid source
  // If the source is an object with uri ensure it's non-empty; static numbers are ok
  // If no valid primary source but we have a fallback (static or uri) show fallback directly
  if (
    (!imageSource || (typeof imageSource === 'object' && 'uri' in (imageSource as any) && !(imageSource as any).uri)) &&
    validFallback
  ) {
    return (
      <Image
        source={validFallback}
        {...props}
      />
    );
  }
  
  if (
    !imageSource ||
    (typeof imageSource === 'object' && 'uri' in (imageSource as any) && !(imageSource as any).uri)
  ) {
    return null;
  }

  return (
    <Image
      source={imageSource}
      onError={handleError}
      {...props}
    />
  );
};

export default FallbackImage;
