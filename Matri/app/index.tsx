import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function StartPage() {
  const auth = useAuth();

  // Show loading spinner while checking authentication
  if (!auth || auth.isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.light.tint 
      }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ 
          color: 'white', 
          marginTop: 16, 
          fontSize: 16,
          fontWeight: '500'
        }}>
          Checking session...
        </Text>
      </View>
    );
  }

  // Auto-navigate based on authentication status
  console.log('🔄 Auto-navigation: isAuthenticated =', auth.isAuthenticated, 'isGuest =', auth.isGuest);
  
  if (auth.isAuthenticated) {
    console.log('✅ User is authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  } else if (auth.isGuest) {
    console.log('👤 Guest mode detected, redirecting to profiles');
    return <Redirect href="/(tabs)/profiles" />;
  } else {
    console.log('❌ User not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }
}
