import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';
import { SessionManager } from '../utils/sessionManager';

interface AuthContextType {
  updateLimitation: (lim: any) => void;
  login: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  clearAuth: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: any;
  limitation: any;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [limitation, setLimitation] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateLimitation = (lim: any) => {
    setLimitation(lim);
    SecureStore.setItemAsync('limitation', JSON.stringify(lim)).catch(()=>{});
  };

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      console.log('🔍 Checking stored authentication...');
      
      // Check for guest mode first
      const guestMode = await SecureStore.getItemAsync('guestMode');
      if (guestMode === 'true') {
        console.log('👤 Guest mode detected');
        setIsGuest(true);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Quick check: get stored data first (fast)
      const storedUser = await SecureStore.getItemAsync('user');
      const storedToken = await SecureStore.getItemAsync('token');
      
      if (!storedUser || !storedToken) {
        console.log('ℹ️ No stored auth data found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Validate session in background (non-blocking)
      const isSessionValid = await SessionManager.isSessionValid();
      
      if (!isSessionValid) {
        console.log('❌ Session invalid or expired');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Found valid stored auth data, restoring session...');
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // Restore limitation data if available
      const storedLimitation = await SecureStore.getItemAsync('limitation');
      if (storedLimitation) {
        try {
          const parsedLimitation = JSON.parse(storedLimitation);
          setLimitation(parsedLimitation);
          console.log('📊 Limitation data restored:', parsedLimitation);
        } catch (err) {
          console.warn('⚠️ Failed to parse stored limitation:', err);
        }
      }
      
      // Update session timestamp to extend session (background)
      SessionManager.updateSessionTimestamp().catch(err => 
        console.error('⚠️ Failed to update session timestamp:', err)
      );
      
      console.log('🚀 Session restored for user:', parsedUser.email || parsedUser.username);
      
    } catch (error) {
      console.error('❌ Error checking stored auth:', error);
      // Clear potentially corrupted data
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username?: string, password?: string) => {
    try {
      console.log('🔐 Attempting login with:', username);
      const response = await apiService.login(username!, password!);
      console.log('📡 Login API response:', response);

      if (response.status === 'success') {
        const { user, access_token, limitation } = response.data;
        console.log('✅ Login successful! User:', user);
        console.log('🔑 Access token:', access_token);
        console.log('📋 Profile complete:', user.profile_complete);
        
        setUser(user);
        setToken(access_token);
        setIsAuthenticated(true);

        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('token', access_token);
        
        // Add session timestamp for future session management
        await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString());

        // Use limitation from login response if available, otherwise fetch from dashboard
        if (limitation) {
          console.log('📊 Limitation data from login:', limitation);
          setLimitation(limitation);
          await SecureStore.setItemAsync('limitation', JSON.stringify(limitation));
        } else {
          // Fallback: Fetch limitation data from dashboard
          try {
            const dashboardResponse = await apiService.getDashboard();
            if (dashboardResponse.data?.limitation) {
              console.log('📊 Limitation data from dashboard:', dashboardResponse.data.limitation);
              setLimitation(dashboardResponse.data.limitation);
              await SecureStore.setItemAsync('limitation', JSON.stringify(dashboardResponse.data.limitation));
            }
          } catch (err) {
            console.warn('⚠️ Failed to fetch limitation data:', err);
          }
        }

        // Check if profile is complete
        if (user.profile_complete === 0 || user.profile_complete === false) {
          console.log('⚠️ Profile incomplete, redirecting to profile completion...');
          router.replace('/(auth)/profile-completion');
        } else {
          console.log('🚀 Profile complete, redirecting to tabs...');
          router.replace('/(tabs)');
        }
      } else {
        console.log('❌ Login failed:', response);
        throw new Error(response.message?.error?.join(', ') || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      const errorMessage = error.response?.data?.message?.error?.join(', ') || error.message || 'An unexpected error occurred.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    mobile: string;
    mobile_code: string;
    country_code: string;
    country: string;
    agree?: boolean;
    reference?: string;
  }) => {
    try {
      console.log('🔐 AuthContext: Starting registration process...');
      console.log('📝 AuthContext: Registration data received:', userData);
      console.log('📧 AuthContext: Email:', userData.email);
      console.log('👤 AuthContext: Username:', userData.username);
      console.log('📱 AuthContext: Mobile:', userData.mobile);
      
      console.log('🌐 AuthContext: Calling apiService.register()...');
      const response = await apiService.register(userData);
      console.log('📡 AuthContext: Registration API response received:', response);
      console.log('📊 AuthContext: Response status:', response?.status);
      console.log('📊 AuthContext: Response data:', response?.data);
      
      if (response.status === 'success') {
        const { user, access_token } = response.data;
        setUser(user);
        setToken(access_token);
        setIsAuthenticated(true);
        
        // Store user data and token securely
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('token', access_token);
        
        // Add session timestamp for future session management
        await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString());
        
        console.log('✅ Registration successful');
        console.log('📋 Profile complete:', user.profile_complete);
        
        // Check if profile is complete
        if (user.profile_complete === 0 || user.profile_complete === false) {
          console.log('⚠️ Profile incomplete, redirecting to profile completion...');
          router.replace('/(auth)/profile-completion');
        } else {
          console.log('🚀 Profile complete, redirecting to tabs...');
          router.replace('/(tabs)');
        }
      } else {
        console.error('❌ AuthContext: Registration response indicates failure');
        console.error('📊 AuthContext: Response status:', response?.status);
        console.error('📊 AuthContext: Response message:', response?.message);
        throw new Error(response.message?.error?.join(', ') || 'Registration failed');
      }
    } catch (error: any) {
      console.error('💥 AuthContext: Registration error caught:');
      console.error('🔴 AuthContext: Error type:', typeof error);
      console.error('🔴 AuthContext: Error message:', error?.message);
      console.error('🔴 AuthContext: Full error object:', error);
      
      if (error?.response) {
        console.error('🔴 AuthContext: HTTP Response Error:');
        console.error('  - Status:', error.response.status);
        console.error('  - Data:', error.response.data);
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  };

  const loginAsGuest = async () => {
    try {
      console.log('👤 Logging in as guest...');
      
      // Set guest mode
      setIsGuest(true);
      setIsAuthenticated(false);
      
      // Store guest mode flag
      await SecureStore.setItemAsync('guestMode', 'true');
      
      console.log('✅ Guest mode enabled');
      console.log('🚀 Redirecting to profiles...');
      
      // Redirect to profiles tab (only option for guests)
      router.replace('/(tabs)/profiles');
    } catch (error) {
      console.error('💥 Guest login error:', error);
      throw new Error('Failed to login as guest');
    }
  };

  const logout = async () => {
    console.log('🔓 Logging out user...');
    
    // Clear guest mode
    setIsGuest(false);
    
    if (token) {
      try {
        await apiService.logout();
        console.log('✅ Server logout successful');
      } catch (error) {
        console.error('⚠️ Server logout failed:', error);
        // Continue with local logout even if server logout fails
      }
    }
    
    // Clear all auth state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear all stored auth data
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('sessionTimestamp');
      await SecureStore.deleteItemAsync('guestMode');
      console.log('🧹 Auth data cleared successfully');
    } catch (error) {
      console.error('⚠️ Error clearing stored auth:', error);
    }
    
    console.log('🚪 Redirecting to login...');
    router.replace('/(auth)/login');
  };


  const clearAuth = async () => {
    console.log('🧹 Clearing auth data...');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsGuest(false);
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('sessionTimestamp');
      await SecureStore.deleteItemAsync('guestMode');
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth:', error);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const response = await apiService.getUserInfo();
      
      if (response?.status === 'success' && response?.data) {
        // Extract user object - API returns { data: { user: {...} } }
        const updatedUser = response.data?.user || response.data;
        console.log('✅ User data refreshed:', {
          id: updatedUser.id,
          package_id: updatedUser.package_id,
          package_name: updatedUser.package_name,
          isPremium: updatedUser.isPremium
        });
        
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ updateLimitation, login, logout, register, clearAuth, loginAsGuest, refreshUser, isAuthenticated, isGuest, user, limitation, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
