// Firebase Configuration
// Replace these with your actual Firebase project credentials from Firebase Console

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Google Sign-In Configuration
export const googleSignInConfig = {
  scopes: ['profile', 'email'],
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Get from Google Cloud Console
  iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID', // For iOS
  androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID', // For Android
};

// Facebook App Configuration
export const facebookConfig = {
  appId: 'YOUR_FACEBOOK_APP_ID', // Get from Facebook Developer Console
  appName: '90sKalyanam',
  displayName: '90sKalyanam',
};

// Apple Sign-In Configuration
export const appleSignInConfig = {
  teamId: 'YOUR_APPLE_TEAM_ID', // Get from Apple Developer Account
  keyId: 'YOUR_APPLE_KEY_ID', // Get from Apple Developer Account
  bundleId: 'com.ninetykalyanam.app', // Your app bundle ID
};

// FCM Configuration
export const fcmConfig = {
  serverKey: 'YOUR_FCM_SERVER_KEY', // Get from Firebase Console
  senderId: 'YOUR_FCM_SENDER_ID', // Same as messagingSenderId
};
