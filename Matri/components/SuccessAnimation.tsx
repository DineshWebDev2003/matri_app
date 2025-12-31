import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface SuccessAnimationProps {
  visible: boolean;
  onComplete: () => void;
  icon?: string;
  color?: string;
}

export default function SuccessAnimation({ 
  visible, 
  onComplete, 
  icon = 'check',
  color = Colors.light.tint 
}: SuccessAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        })
      );

      rotation.value = withSpring(360, { damping: 15, stiffness: 100 });
    } else {
      scale.value = 0;
      opacity.value = 0;
      rotation.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <View style={[styles.iconBackground, { backgroundColor: color }]}>
            <Feather name={icon as any} size={40} color="white" />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
