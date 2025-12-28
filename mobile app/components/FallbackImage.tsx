import React, { useState } from 'react';
import { Image } from 'react-native';

interface FallbackImageProps {
  source: { uri: string };
  fallbackSource?: { uri: string };
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
export const FallbackImage = ({ 
  source, 
  fallbackSource,
  ...props 
}: FallbackImageProps) => {
  // Ensure source is properly formatted
  let validSource: { uri: string };
  
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
  let validFallback: { uri: string } | undefined;
  if (fallbackSource) {
    if (typeof fallbackSource === 'string') {
      validFallback = { uri: String(fallbackSource).trim() };
    } else if (typeof fallbackSource === 'object' && 'uri' in fallbackSource) {
      const uri = fallbackSource.uri;
      const uriStr = typeof uri === 'string' ? String(uri).trim() : '';
      validFallback = uriStr ? { uri: uriStr } : undefined;
    }
  }
  
  const [imageSource, setImageSource] = useState(validSource);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error && validFallback && validFallback.uri) {
      console.log('⚠️ Primary image failed, trying fallback:', validFallback.uri);
      setError(true);
      setImageSource(validFallback);
    } else if (!error && !validFallback) {
      console.log('❌ Image failed to load and no fallback available:', validSource.uri);
      setError(true);
    }
  };

  // Don't render if no valid source
  if (!imageSource || !imageSource.uri || imageSource.uri === '') {
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
