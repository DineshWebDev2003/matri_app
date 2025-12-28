import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import FemaleAvatar from './FemaleAvatar';
import MaleAvatar from './MaleAvatar';

interface ProfileImageProps {
  imageUrl?: string;
  name: string;
  size?: number;
  isVerified?: boolean;
  showBadge?: boolean;
  gender?: 'male' | 'female' | string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  imageUrl, 
  name, 
  size = 80, 
  isVerified = false, 
  showBadge = true,
  gender = 'male'
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate attractive background color based on name
  const getBackgroundColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // Get first letter of name
  const getInitial = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  const backgroundColor = getBackgroundColor(name);
  const initial = getInitial(name);
  
  // Check if we should show image or fallback
  const shouldShowImage = imageUrl && !imageError && imageUrl.length > 0 && !imageUrl.includes('randomuser.me');

  return (
    <View style={[styles.container, { width: size, height: size * 1.25 }]}>
      {shouldShowImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size * 1.25, borderRadius: size * 0.15 }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[
          styles.fallbackContainer, 
          { 
            width: size, 
            height: size * 1.25, 
            backgroundColor: gender === 'female' ? '#F3E8FF' : gender === 'male' ? '#F1F5F9' : backgroundColor,
            borderRadius: size * 0.15
          }
        ]}>
          {gender === 'female' ? (
            <FemaleAvatar size={size * 0.8} color="#a196a6" />
          ) : gender === 'male' ? (
            <MaleAvatar size={size * 0.8} color="#c2c2c2" />
          ) : (
            <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
              {initial}
            </Text>
          )}
        </View>
      )}
      
      {/* Verification Badge */}
      {showBadge && isVerified && (
        <View style={[styles.verificationBadge, { 
          width: size * 0.25, 
          height: size * 0.25,
          borderRadius: size * 0.125,
          bottom: size * 0.05,
          right: size * 0.05
        }]}>
          <Feather name="check" size={size * 0.15} color="white" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fallbackText: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  verificationBadge: {
    position: 'absolute',
    backgroundColor: '#007AFF', // Instagram-like blue
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default ProfileImage;
