import * as GoogleSignIn from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { googleSignInConfig, appleSignInConfig, facebookConfig } from '../config/firebase';
import { apiService } from './api';

// Initialize Google Sign-In
export const initializeGoogleSignIn = () => {
  try {
    GoogleSignIn.configure({
      scopes: googleSignInConfig.scopes,
      webClientId: googleSignInConfig.webClientId,
      iosClientId: googleSignInConfig.iosClientId,
      androidClientId: googleSignInConfig.androidClientId,
    });
    console.log('✅ Google Sign-In initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Google Sign-In:', error);
  }
};

// Google Sign-In
export const googleSignIn = async () => {
  try {
    console.log('🔐 Starting Google Sign-In...');
    
    // Check if device has Google Play Services
    await GoogleSignIn.hasPlayServices();
    
    // Sign in
    const userInfo = await GoogleSignIn.signInSilently();
    
    if (!userInfo) {
      throw new Error('No user info returned from Google Sign-In');
    }

    console.log('✅ Google Sign-In successful:', userInfo.user.email);

    // Get ID token
    const tokens = await GoogleSignIn.getTokens();
    
    return {
      provider: 'google',
      token: tokens.idToken || tokens.accessToken,
      email: userInfo.user.email,
      name: userInfo.user.name,
      profileImage: userInfo.user.photo,
      id: userInfo.user.id,
    };
  } catch (error: any) {
    console.error('❌ Google Sign-In error:', error.message);
    throw error;
  }
};

// Google Sign-Out
export const googleSignOut = async () => {
  try {
    await GoogleSignIn.signOut();
    console.log('✅ Google Sign-Out successful');
  } catch (error) {
    console.error('❌ Google Sign-Out error:', error);
  }
};

// Facebook Sign-In
export const facebookSignIn = async () => {
  try {
    console.log('🔐 Starting Facebook Sign-In...');
    
    // This requires react-native-facebook-sdk to be properly configured
    // For now, we'll use a placeholder that needs to be implemented with actual Facebook SDK
    
    // Placeholder - implement with actual Facebook SDK
    throw new Error('Facebook Sign-In requires additional setup with Facebook SDK');
    
    // When implemented:
    // const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    // const data = await AccessToken.getCurrentAccessToken();
    // return {
    //   provider: 'facebook',
    //   token: data.accessToken.toString(),
    //   ...
    // };
  } catch (error: any) {
    console.error('❌ Facebook Sign-In error:', error.message);
    throw error;
  }
};

// Apple Sign-In
export const appleSignIn = async () => {
  try {
    console.log('🔐 Starting Apple Sign-In...');
    
    // Check if Apple Sign-In is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('✅ Apple Sign-In successful:', credential.email);

    return {
      provider: 'apple',
      token: credential.identityToken || '',
      email: credential.email || '',
      name: credential.fullName?.givenName || 'User',
      id: credential.user,
    };
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      console.log('ℹ️ Apple Sign-In cancelled by user');
    } else {
      console.error('❌ Apple Sign-In error:', error.message);
    }
    throw error;
  }
};

// Social Login Handler
export const handleSocialLogin = async (socialData: any) => {
  try {
    console.log(`📱 Logging in with ${socialData.provider}...`);

    // Call backend API to authenticate with social provider
    const response = await apiService.post('/auth/social-login', {
      provider: socialData.provider,
      token: socialData.token,
      email: socialData.email,
      name: socialData.name,
      profileImage: socialData.profileImage,
      id: socialData.id,
    });

    if (response.status === 'success') {
      const { user, access_token } = response.data;
      
      console.log(`✅ ${socialData.provider} login successful!`);

      // Store user and token
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      await SecureStore.setItemAsync('token', access_token);
      await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString());

      return {
        success: true,
        user,
        token: access_token,
      };
    } else {
      throw new Error(response.message || 'Social login failed');
    }
  } catch (error: any) {
    console.error(`❌ ${socialData.provider} login error:`, error.message);
    throw error;
  }
};

// Sign Out from all providers
export const signOutFromAllProviders = async () => {
  try {
    // Sign out from Google
    try {
      await googleSignOut();
    } catch (e) {
      console.warn('Google sign-out warning:', e);
    }

    // Sign out from Apple (if needed)
    // Apple doesn't have a sign-out method, but we clear local data

    // Sign out from Facebook
    // await LoginManager.logOut();

    console.log('✅ Signed out from all providers');
  } catch (error) {
    console.error('❌ Error signing out:', error);
  }
};
