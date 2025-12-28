import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface HeartIconProps {
  isInterested: boolean;
  isBlocked?: boolean;
  size?: number;
  onPress?: () => void;
}

export default function HeartIcon({ isInterested, isBlocked = false, size = 20, onPress }: HeartIconProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  if (isBlocked) {
    // Broken heart for blocked/ignored users - use broken heart icon
    return (
      <TouchableOpacity onPress={handlePress}>
        <Feather 
          name="heart" 
          size={size} 
          color="#666666"
          style={{ opacity: 0.5 }}
        />
      </TouchableOpacity>
    );
  } else if (isInterested) {
    // Red filled heart for interested
    return (
      <TouchableOpacity onPress={handlePress}>
        <Feather 
          name="heart" 
          size={size} 
          color="#FF0000"
        />
      </TouchableOpacity>
    );
  } else {
    // Empty heart for not interested
    return (
      <TouchableOpacity onPress={handlePress}>
        <Feather 
          name="heart" 
          size={size} 
          color={Colors.light.icon}
        />
      </TouchableOpacity>
    );
  }
}
