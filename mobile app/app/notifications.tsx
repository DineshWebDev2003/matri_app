import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const auth = useAuth();
  const user = auth?.user;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    card: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F8F9FA' },
    border: theme === 'dark' ? { borderColor: '#2A2A2A' } : { borderColor: '#E5E7EB' },
  };

  useEffect(() => {
    fetchNotifications();
    setupPushNotifications();
  }, []);

  const setupPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📱 Push notification permission:', status);
      
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('🔔 Expo Push Token:', token.data);
        
        // Send token to backend
        if (user?.id) {
          await apiService.updatePushToken(token.data);
        }
      }
    } catch (error) {
      console.error('❌ Push notification setup error:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('📬 Fetching notifications...');
      
      const response = await apiService.getNotifications();
      console.log('📬 Notifications response:', response);
      
      if (response?.status === 'success' && response?.data) {
        const notifList = Array.isArray(response.data) ? response.data : response.data.notifications || [];
        setNotifications(notifList);
        
        // Count unread notifications
        const unread = notifList.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
        console.log(`✅ Loaded ${notifList.length} notifications (${unread} unread)`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await apiService.markNotificationAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Navigate based on notification type
      if (notification.click_url) {
        router.push(notification.click_url);
      }
    } catch (error) {
      console.error('❌ Error handling notification:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      Alert.alert('Success', 'Notification deleted');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await apiService.clearAllNotifications();
              setNotifications([]);
              setUnreadCount(0);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              console.error('❌ Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interest_received':
        return { icon: 'heart', color: '#EF4444' };
      case 'profile_viewed':
        return { icon: 'eye', color: '#3B82F6' };
      case 'interest_accepted':
        return { icon: 'check-circle', color: '#10B981' };
      case 'interest_rejected':
        return { icon: 'x-circle', color: '#F97316' };
      case 'message':
        return { icon: 'message-circle', color: '#8B5CF6' };
      case 'shortlist':
        return { icon: 'star', color: '#FBBF24' };
      default:
        return { icon: 'bell', color: '#6B7280' };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const { icon, color } = getNotificationIcon(item.type || 'default');
    const isUnread = !item.is_read;
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationCard,
          themeStyles.card,
          themeStyles.border,
          isUnread && styles.unreadCard
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Feather name={icon as any} size={20} color={color} />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[styles.notificationTitle, themeStyles.text, isUnread && styles.unreadText]}>
            {item.title || 'Notification'}
          </Text>
          <Text style={[styles.notificationMessage, themeStyles.secondaryText]}>
            {item.message || item.text || 'No message'}
          </Text>
          <Text style={[styles.notificationTime, themeStyles.secondaryText]}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
          </Text>
        </View>
        
        {isUnread && <View style={styles.unreadBadge} />}
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Feather name="x" size={18} color={themeStyles.secondaryText.color} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}
        translucent={false}
      />
      
      {/* Header */}
      <View style={[styles.header, themeStyles.border]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={themeStyles.text.color} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, themeStyles.text]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadLabel, themeStyles.secondaryText]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity onPress={handleClearAll}>
          <Feather name="trash-2" size={20} color={themeStyles.secondaryText.color} />
        </TouchableOpacity>
      </View>

      {/* Push Notification Settings */}
      <View style={[styles.settingsCard, themeStyles.card, themeStyles.border]}>
        <View style={styles.settingsContent}>
          <View>
            <Text style={[styles.settingsTitle, themeStyles.text]}>Push Notifications</Text>
            <Text style={[styles.settingsSubtitle, themeStyles.secondaryText]}>
              Receive real-time notifications
            </Text>
          </View>
          <Switch 
            value={pushEnabled} 
            onValueChange={setPushEnabled}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor={pushEnabled ? '#059669' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="inbox" size={64} color={themeStyles.secondaryText.color} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Notifications</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            You're all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#EF4444"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  unreadLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  settingsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 13,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
