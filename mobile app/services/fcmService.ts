import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { apiService } from './api';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('📬 Notification received:', notification);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Initialize FCM
export const initializeFCM = async () => {
  try {
    console.log('🔔 Initializing FCM...');

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Notification permissions not granted');
      return null;
    }

    // Get FCM token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('✅ FCM Token obtained:', token.data);

    // Store token locally
    await SecureStore.setItemAsync('fcm_token', token.data);

    // Send token to backend
    await sendFCMTokenToBackend(token.data);

    // Set up notification listeners
    setupNotificationListeners();

    return token.data;
  } catch (error) {
    console.error('❌ FCM initialization error:', error);
    return null;
  }
};

// Send FCM token to backend
export const sendFCMTokenToBackend = async (token: string) => {
  try {
    console.log('📤 Sending FCM token to backend...');

    const response = await apiService.post('/user/fcm-token', {
      fcm_token: token,
      platform: Platform.OS,
      device_id: await getDeviceId(),
    });

    if (response.status === 'success') {
      console.log('✅ FCM token saved to backend');
    } else {
      console.warn('⚠️ Failed to save FCM token:', response.message);
    }
  } catch (error) {
    console.error('❌ Error sending FCM token to backend:', error);
  }
};

// Get device ID (unique identifier)
export const getDeviceId = async () => {
  try {
    let deviceId = await SecureStore.getItemAsync('device_id');
    
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('❌ Error getting device ID:', error);
    return 'unknown';
  }
};

// Set up notification listeners
export const setupNotificationListeners = () => {
  try {
    console.log('👂 Setting up notification listeners...');

    // Listen for notifications when app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Foreground notification:', notification);
        handleNotification(notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        handleNotificationResponse(response);
      }
    );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.error('❌ Error setting up notification listeners:', error);
  }
};

// Handle notification
export const handleNotification = (notification: Notifications.Notification) => {
  try {
    const { data, trigger } = notification.request.content;
    
    console.log('📨 Handling notification:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data,
    });

    // Handle different notification types
    if (data?.type === 'message') {
      console.log('💬 Message notification');
    } else if (data?.type === 'interest') {
      console.log('❤️ Interest notification');
    } else if (data?.type === 'match') {
      console.log('💕 Match notification');
    } else if (data?.type === 'promotion') {
      console.log('🎉 Promotion notification');
    }
  } catch (error) {
    console.error('❌ Error handling notification:', error);
  }
};

// Handle notification response (when user taps notification)
export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  try {
    const { data } = response.notification.request.content;
    
    console.log('🔗 Handling notification response:', data);

    // Navigate based on notification type
    if (data?.type === 'message' && data?.chatId) {
      // Navigate to chat screen
      console.log('Navigating to chat:', data.chatId);
    } else if (data?.type === 'interest' && data?.profileId) {
      // Navigate to profile screen
      console.log('Navigating to profile:', data.profileId);
    } else if (data?.type === 'match' && data?.profileId) {
      // Navigate to profile screen
      console.log('Navigating to match:', data.profileId);
    }
  } catch (error) {
    console.error('❌ Error handling notification response:', error);
  }
};

// Send test notification (for development)
export const sendTestNotification = async () => {
  try {
    console.log('📤 Sending test notification...');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Test Notification',
        body: 'This is a test notification from 90sKalyanam',
        data: {
          type: 'test',
          message: 'Test notification',
        },
      },
      trigger: {
        seconds: 2,
      },
    });

    console.log('✅ Test notification scheduled');
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
  }
};

// Update FCM token (call periodically or when token changes)
export const updateFCMToken = async () => {
  try {
    console.log('🔄 Updating FCM token...');

    const token = await Notifications.getExpoPushTokenAsync();
    const storedToken = await SecureStore.getItemAsync('fcm_token');

    if (token.data !== storedToken) {
      console.log('🆕 New FCM token detected');
      await SecureStore.setItemAsync('fcm_token', token.data);
      await sendFCMTokenToBackend(token.data);
    } else {
      console.log('✅ FCM token is up to date');
    }
  } catch (error) {
    console.error('❌ Error updating FCM token:', error);
  }
};

// Get current FCM token
export const getFCMToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('fcm_token');
    return token || null;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

// Clear FCM token (on logout)
export const clearFCMToken = async () => {
  try {
    console.log('🗑️ Clearing FCM token...');
    await SecureStore.deleteItemAsync('fcm_token');
    console.log('✅ FCM token cleared');
  } catch (error) {
    console.error('❌ Error clearing FCM token:', error);
  }
};
