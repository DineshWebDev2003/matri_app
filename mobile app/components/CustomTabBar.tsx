import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, useWindowDimensions, Platform, Animated } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '@/constants/Colors';

// Modern matrimony-themed icons with red/black theme
const ICONS = {
  index: { name: 'home', type: 'FontAwesome' },
  profiles: { name: 'users', type: 'FontAwesome' },
  chats: { name: 'comments', type: 'FontAwesome' },
  saved: { name: 'heart', type: 'FontAwesome' },
  account: { name: 'user', type: 'FontAwesome' }, // Profile picture will override this
};

// Modern matrimony theme colors matching the design
const THEME_COLORS = {
  primary: '#DC2626',      // Red theme color
  secondary: '#EF4444',    // Lighter red
  background: '#FFFFFF',   // White background
  cardBg: '#F8F9FA',       // Very light gray
  inactive: '#9CA3AF',     // Gray for inactive
  white: '#FFFFFF',
  black: '#1F2937',        // Dark gray instead of pure black
  shadow: 'rgba(0, 0, 0, 0.08)', // Very soft shadow
  redShadow: 'rgba(220, 38, 38, 0.15)', // Red shadow
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const isTablet = width >= 768;
  const iconSize = isTablet ? 22 : 18;
  const iconSizeFocused = isTablet ? 24 : 20;
  
  // Dynamic colors based on theme
  const dynamicColors = {
    background: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    primary: '#DC2626',
    inactive: theme === 'dark' ? '#6B7280' : '#E5E7EB',
    white: theme === 'dark' ? '#FFFFFF' : '#FFFFFF',
    cardBg: theme === 'dark' ? '#2A2A2A' : '#F8F9FA',
  };
  
  // Theme-aware solid colors (not transparent)
  const gradientColors: readonly [string, string, ...string[]] = theme === 'dark' 
    ? ['#1A1A1A', '#1A1A1A']
    : ['#FFFFFF', '#FFFFFF'];

  return (
    <View style={[styles.tabBarWrapper, isTablet && styles.tabBarWrapperTablet]}>
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.tabBarContainer, isTablet && styles.tabBarContainerTablet]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;
          const isLast = route.name === 'account';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconConfig = (ICONS as any)[route.name] || { name: 'circle', type: 'FontAwesome' };

          const renderIcon = () => {
            const IconComponent = iconConfig.type === 'Ionicons' ? Ionicons : 
                                iconConfig.type === 'MaterialIcons' ? MaterialIcons : FontAwesome;
            
            return (
              <IconComponent 
                name={iconConfig.name} 
                size={isFocused ? iconSizeFocused : iconSize} 
                color={isFocused ? dynamicColors.primary : dynamicColors.inactive} 
              />
            );
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[
                styles.tabItem, 
                isFocused ? styles.tabItemFocused : styles.tabItemUnfocused,
                isTablet && styles.tabItemTablet
              ]}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperFocused]}>
                {renderIcon()}
              </View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  tabBarWrapperTablet: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 75,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarContainerTablet: {
    height: Platform.OS === 'ios' ? 80 : 72,
    borderRadius: 28,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 25,
    minHeight: 50,
    minWidth: 50,
  },
  tabItemFocused: {
    backgroundColor: '#FEE2E2',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tabItemUnfocused: {
    backgroundColor: 'transparent',
  },
  tabItemTablet: {
    paddingVertical: 10,
    minHeight: 56,
    minWidth: 56,
  },
  lastTab: {
    // Special styling for last tab (account) if needed
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  iconWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
