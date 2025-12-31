import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface VerificationBadgeProps {
  size?: number;
  style?: any;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  size = 16, 
  style 
}) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 18 18"
        style={{ backgroundColor: 'transparent' }}
      >
        <Rect
          x="4.1"
          y="4.7"
          width="9.5"
          height="8.6"
          fill="#FFFFFF"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <Path
          d="M9,1.4L6.6,0L5.2,2.3H2.4v2.9L0,6.6L1.4,9L0,11.4l2.4,1.4v2.7h2.7L6.6,18L9,16.6l2.4,1.4l1.5-2.5h2.8v-2.7
          l2.4-1.4L16.6,9L18,6.6l-2.4-1.4V2.3h-2.9L11.4,0L9,1.4z M12.3,6.4l1,1l-5.1,5.2L5.1,9.5l1-1l2.1,2.1L12.3,6.4z"
          fill="#0095F6"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </Svg>
    </View>
  );
};

export default VerificationBadge;
