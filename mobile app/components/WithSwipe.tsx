import React from 'react';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useRouter } from 'expo-router';

interface Props {
  children: React.ReactNode;
  /** Route path to navigate when user swipes left */
  toLeft?: string;
  /** Route path to navigate when user swipes right */
  toRight?: string;
}

/**
 * Wrap any screen with this component to enable simple left / right swipe
 * navigation. It uses expo-router's `router.replace` so the tab bar state
 * remains in sync. Adjust threshold or animation as needed.
 */
export default function WithSwipe({ children, toLeft, toRight }: Props) {
  const router = useRouter();

  return (
    <GestureRecognizer
      style={{ flex: 1 }}
      config={{ velocityThreshold: 0.2, directionalOffsetThreshold: 20, gestureIsClickThreshold: 5 }}
      onSwipeLeft={() => {
        if (toLeft) router.replace(toLeft);
      }}
      onSwipeRight={() => {
        if (toRight) router.replace(toRight);
      }}
    >
      {children}
    </GestureRecognizer>
  );
}
