import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
}

const toastConfig = {
  success: {
    icon: 'check-circle',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  error: {
    icon: 'x-circle',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  warning: {
    icon: 'alert-triangle',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  info: {
    icon: 'info',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
};

export default function Toast({ 
  visible, 
  message, 
  type, 
  duration = 3000, 
  onHide 
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const config = toastConfig[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });

      const timer = setTimeout(() => {
        translateY.value = withSpring(-100, { damping: 15, stiffness: 100 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onHide)();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Feather name={config.icon as any} size={20} color="white" />
        </View>
        <Text style={[styles.message, { color: config.color }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
