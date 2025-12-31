import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonBox({ 
  width: boxWidth = 100, 
  height = 20, 
  borderRadius = 4, 
  style 
}: SkeletonLoaderProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-boxWidth, boxWidth]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: boxWidth,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

export function ProfileCardSkeleton() {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <SkeletonBox width={60} height={60} borderRadius={30} />
        <View style={styles.profileInfo}>
          <SkeletonBox width={120} height={16} />
          <SkeletonBox width={80} height={12} style={{ marginTop: 8 }} />
          <SkeletonBox width={100} height={12} style={{ marginTop: 4 }} />
        </View>
        <SkeletonBox width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function GalleryImageSkeleton() {
  const imageSize = (width - 60) / 3;
  
  return (
    <SkeletonBox 
      width={imageSize} 
      height={imageSize} 
      borderRadius={10}
      style={styles.galleryImage}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <SkeletonBox width={24} height={24} borderRadius={12} />
      <SkeletonBox width={40} height={20} style={{ marginTop: 8 }} />
      <SkeletonBox width={60} height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  galleryImage: {
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#E1E9EE',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
});
