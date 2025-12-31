import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: typeof lightColors;
}

const lightColors = {
  // Background
  background: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  surfaceDark: '#F0F2F5',
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Inputs
  inputBackground: '#F3F4F6',
  inputBorder: '#E5E7EB',
  inputPlaceholder: '#9CA3AF',
  
  // Buttons
  primary: '#FFA500',
  primaryHover: '#FF9500',
  primaryLight: '#FFE5CC',
  
  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Divider
  divider: '#E5E7EB',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
  // Background
  background: '#1A1A2E',
  surfaceLight: '#2D2D44',
  surfaceDark: '#16213E',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  // Inputs
  inputBackground: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(255, 255, 255, 0.15)',
  inputPlaceholder: '#9CA3AF',
  
  // Buttons
  primary: '#FFA500',
  primaryHover: '#FF9500',
  primaryLight: 'rgba(255, 165, 0, 0.2)',
  
  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Divider
  divider: 'rgba(255, 255, 255, 0.15)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await SecureStore.getItemAsync('themeMode');
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setThemeModeState(saved);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine actual theme based on mode and system preference
  const actualTheme: 'light' | 'dark' = 
    themeMode === 'auto' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const colors = actualTheme === 'dark' ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme: actualTheme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
