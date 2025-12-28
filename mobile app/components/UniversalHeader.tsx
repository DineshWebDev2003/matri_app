import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface UniversalHeaderProps {
  title: string;
  showProfileImage?: boolean;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  userImage?: string;
  leftIcon?: 'menu' | 'heart' | 'back' | 'none' | 'arrow-left' | 'settings' | 'check';
  onLeftIconPress?: () => void;
  rightIcons?: ('menu' | 'heart' | 'settings' | 'bell' | 'plus' | 'more-vertical' | 'check')[];
  onRightPress?: ((icon: string) => void)[];
  leftIcons?: ('menu' | 'heart' | 'back' | 'none' | 'arrow-left' | 'settings' | 'check' | 'sun' | 'moon' | 'translate')[];
  onLeftIconsPress?: ((icon: string) => void)[];
}

const getProfileImageUrl = (image: string | undefined) => {
  if (!image) return 'https://via.placeholder.com/40';
  if (image.startsWith('http')) return image;
  const mainServerUrl = `https://90skalyanam.com/assets/images/user/profile/${image}`;
  return mainServerUrl;
};

export default function UniversalHeader({
  title,
  showProfileImage = true,
  onProfilePress,
  onMenuPress,
  onFilterPress,
  showFilter = false,
  userImage,
  leftIcon = 'menu',
  onLeftIconPress,
}: UniversalHeaderProps) {
  const { theme } = useTheme();
  const auth = useAuth();
  const insets = useSafeAreaInsets();

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
  };

  return (
    <View style={[styles.headerContainer, themeStyles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerTop}>
        {/* Left Side - Dynamic Icon */}
        <TouchableOpacity 
          style={styles.menuDotsButton}
          onPress={onLeftIconPress || onMenuPress}
        >
          {leftIcon === 'menu' && (
            <Image 
              source={theme === 'dark' 
                ? require('../assets/images/logo_1.png')
                : require('../assets/images/logo_0.png')
              }
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
          {leftIcon === 'heart' && (
            <Feather name="heart" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          )}
          {leftIcon === 'back' && (
            <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          )}
        </TouchableOpacity>

        {/* Center - Screen Title */}
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
            ]}
          >
            {title}
          </Text>
        </View>

        {/* Right Side - Profile Icon Button or Filter Icon */}
        {showFilter ? (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <Feather name="sliders" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
        ) : showProfileImage ? (
          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.profileIconButtonPink}
          >
            <Image
              source={{ uri: getProfileImageUrl(userImage) }}
              style={styles.profileIconImage}
              onError={() => console.log('Profile image failed to load')}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.profileIconButtonPink} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  menuDotsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  fourDotsMenu: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileIconButtonPink: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});
