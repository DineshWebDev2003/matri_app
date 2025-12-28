import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, SafeAreaView } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { theme } = useTheme();
  
  // Check if current route is login or register page
  const isAuthPage = segments[0] === '(auth)';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Dynamic StatusBar: Dark icons in light mode, Light icons in dark mode */}
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent={true}
      />
      <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { marginTop: 0 },
        animationEnabled: true 
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="shortlisted" />
        <Stack.Screen name="viewed-profile" />
        <Stack.Screen name="interest-sent" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="interest-received" />
        <Stack.Screen name="profile-setting" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
});


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <RootLayoutNav />
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
