import React from 'react';
import Svg, { G, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';

interface BrokenHeartProps {
  size?: number;
}

const BrokenHeart: React.FC<BrokenHeartProps> = ({ size = 24 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Defs>
        <RadialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <Stop offset="0.2479" stopColor="#FF0000" />
          <Stop offset="0.8639" stopColor="#C20000" />
        </RadialGradient>
        <LinearGradient id="paint1_linear" x1="4.63165" y1="17.2403" x2="19.4318" y2="17.2403" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#860805" />
          <Stop offset="1" stopColor="#BD2719" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id="paint10_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <Stop offset="0.2479" stopColor="#FF0000" />
          <Stop offset="0.8639" stopColor="#C20000" />
        </RadialGradient>
      </Defs>
      
      {/* Left broken piece */}
      <Path 
        d="M11.5428 20.3201L9.8399 16.7886L11.3713 13.0515L8.88562 9.28578L11.3999 5.70293C10.4913 4.49721 9.0399 3.71436 7.41133 3.71436C4.64562 3.71436 2.3999 5.96007 2.3999 8.72578C2.3999 14.8286 11.5428 20.3201 11.5428 20.3201Z" 
        fill="url(#paint0_radial)"
      />
      
      {/* Right broken piece */}
      <Path 
        d="M16.5314 3.71436C15.5656 3.71436 14.6628 3.98864 13.9028 4.46293C13.8628 4.4915 13.8171 4.51436 13.7771 4.54293C13.3999 4.78864 13.0628 5.08578 12.7656 5.42293C12.6342 5.5715 12.5142 5.7315 12.3999 5.8915L10.8914 9.28007L13.6628 13.0458L11.5599 16.7829L12.4056 20.3144C12.4056 20.3144 21.5485 14.8229 21.5485 8.71436C21.5428 5.96007 19.2971 3.71436 16.5314 3.71436Z" 
        fill="url(#paint10_radial)"
      />
      
      {/* Crack lines and details */}
      <Path 
        opacity="0.32" 
        d="M11.5426 20.32L9.83977 16.7886L9.90263 16.6286C8.4112 16.2514 6.74263 15.4 4.54834 14.1543C7.2512 17.7429 11.5426 20.32 11.5426 20.32Z" 
        fill="url(#paint1_linear)"
      />
      
      {/* Highlight on left piece */}
      <Path 
        opacity="0.24" 
        d="M10.2913 5.74883C10.7941 6.93169 9.67986 8.5374 7.79986 9.33169C5.91986 10.126 3.99415 9.8174 3.49129 8.64026C2.98844 7.46312 4.10272 5.85169 5.98272 5.0574C7.86272 4.26312 9.78843 4.56597 10.2913 5.74883Z" 
        fill="white"
        fillOpacity="0.6"
      />
      
      {/* Highlight on right piece */}
      <Path 
        opacity="0.24" 
        d="M17.2744 4.79422C17.9886 5.58279 17.5486 7.14279 16.2972 8.27422C15.0458 9.40565 13.4515 9.68565 12.7372 8.89708C12.0229 8.10851 12.4572 6.54851 13.7144 5.41708C14.9715 4.28565 16.5601 4.00565 17.2744 4.79422Z" 
        fill="white"
        fillOpacity="0.6"
      />
    </Svg>
  );
};

export default BrokenHeart;
