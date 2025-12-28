import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, RefreshControl, Image, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '@/constants/Colors';
import { apiService, premiumUtils } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import UniversalHeader from '../../components/UniversalHeader';
import MenuModal from '../../components/MenuModal';
import { LinearGradient } from 'expo-linear-gradient';
import WithSwipe from '../../components/WithSwipe';
import { getImageUrl } from '../../utils/imageUtils';

export default function ChatsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { user } = auth;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserGender, setCurrentUserGender] = useState<string>('male');
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    // Initialize gender from user or fetch from API
    const initializeGender = async () => {
      // First, refresh user data to ensure we have latest package_id and other info (non-blocking)
      if (auth?.refreshUser) {
        console.log('🔄 Refreshing user data on chat screen load...');
        // Don't await this - let it happen in background
        auth.refreshUser().catch(err => console.log('⚠️ Error refreshing user:', err));
      }
      
      // Prefer gender from user object, fallback to nested basic_info, else API
      let gender = (user?.gender || user?.basic_info?.gender || user?.basicInfo?.gender || '')?.toLowerCase() || 'male';
      console.log('👤 User object:', { gender: user?.gender, username: user?.username, id: user?.id, package_id: user?.package_id });
      
      // If gender not in user object, fetch from API
      if (!user?.gender) {
        try {
          const userInfo = await apiService.getUserInfo();
          if (userInfo?.data?.gender) {
            gender = userInfo.data.gender.toLowerCase();
            console.log('📡 Fetched gender from API:', gender);
          }
        } catch (error) {
          console.log('⚠️ Could not fetch gender from API, using default');
        }
      }
      
      setCurrentUserGender(gender);
      console.log('✅ Current user gender set to:', gender);
    };
    
    initializeGender();
    fetchConversations();
    fetchActiveChats();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Update premium status when user data changes
  useEffect(() => {
    if (user) {
      const packageId = user?.package_id || 4; // Default to FREE MATCH (4) if not set
      const isPremium = premiumUtils.isPremiumUser(packageId);
      setIsPremiumUser(isPremium);
      console.log('💎 Premium Status Updated:', {
        packageId,
        isPremium,
        package_name: user?.package_name,
        user_id: user?.id
      });
    }
  }, [user?.id, user?.package_id, user?.package_name]);

  // Debug logging for conversations data
  useEffect(() => {
    if (conversations.length > 0) {
      console.log('📋 Conversations data structure:');
      conversations.forEach((conv, index) => {
        console.log(`Conversation ${index}:`, {
          id: conv.id,
          other_user: conv.other_user,
          hasOtherUser: !!conv.other_user,
          hasOtherUserName: !!conv.other_user?.name,
          last_message_time: conv.last_message_time,
          unread_count: conv.unread_count
        });
      });
    }
  }, [conversations]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('💬 Fetching conversations...');
      console.log('🔍 Using gender from state:', currentUserGender);
      
      const response = await apiService.getConversations();
      
      if (response.status === 'success') {
        console.log('✅ Conversations loaded:', response.data.conversations?.length || 0);
        console.log('📋 Raw conversation data:', JSON.stringify(response.data.conversations, null, 2));
        
        // Transform conversation data to expected structure
        let validConversations = (response.data.conversations || []).map((conv: any) => {
          // Handle the API response structure where other_user data is flattened
          if (!conv.other_user && conv.other_user_name) {
            conv.other_user = {
              id: conv.other_user_id,
              name: conv.other_user_name,
              image: conv.other_user_image,
              gender: conv.other_user_gender
            };
          }
          
          // Ensure other_user object exists with fallback values
          if (!conv.other_user) {
            console.warn('⚠️ Conversation missing other_user data:', conv);
            conv.other_user = {
              id: conv.other_user_id || conv.id,
              name: conv.other_user_name || 'User',
              image: conv.other_user_image || null,
              gender: conv.other_user_gender
            };
          }
          
          return conv;
        }).filter((conv: any) => {
          // Validate conversation has user data
          if (!conv.other_user || !conv.other_user.name) return false;
          
          // Apply gender filter - show only opposite gender
          const targetGender = currentUserGender === 'male' ? 'female' : 'male';
          const otherUserGender = conv.other_user?.gender?.toLowerCase();
          
          if (otherUserGender && otherUserGender !== targetGender) {
            console.log(`🚫 Filtering out ${otherUserGender} user (looking for ${targetGender})`);
            return false;
          }
          
          return true;
        });
        
        // Fetch user profiles to enrich conversations with latest profile images
        console.log('📸 Fetching user profiles to get latest images for conversations...');
        try {
          const profilesResponse = await apiService.getProfiles({ type: 'all', limit: 100 });
          if (profilesResponse.status === 'success') {
            const profiles = profilesResponse.data.profiles || [];
            console.log('📸 Fetched profiles:', profiles.length);
            
            // Enrich conversations with profile images (always update to get latest)
            validConversations = validConversations.map((conv: any) => {
              const userProfile = profiles.find((p: any) => p.id?.toString() === conv.other_user?.id?.toString());
              if (userProfile) {
                console.log(`📸 Found profile for user ${conv.other_user?.name}:`, {
                  conversationImage: conv.other_user?.image,
                  profileImage: userProfile.image
                });
                // Use profile image (more up-to-date than conversation image)
                if (userProfile.image) {
                  conv.other_user.image = userProfile.image;
                }
                conv.other_user.gender = userProfile.gender || conv.other_user?.gender;
              }
              return conv;
            });
          }
        } catch (profileError) {
          console.log('⚠️ Could not fetch profiles for images:', profileError);
        }
        
        console.log('✅ Valid conversations after filtering:', validConversations.length);
        console.log(`🔍 Gender filter applied: User is ${currentUserGender}, showing opposite gender`);
        setConversations(validConversations);
      } else {
        console.error('❌ Conversations API error:', response);
        setConversations([]);
        Alert.alert('Error', 'Failed to load conversations');
      }
    } catch (error) {
      console.error('💥 Failed to fetch conversations:', error);
      setConversations([]);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentUserGender]);

  const fetchActiveChats = useCallback(async () => {
    try {
      console.log('🔍 Using gender from state:', currentUserGender);
      
      // Get recent active profiles for the top horizontal list
      const response = await apiService.getProfiles({
        type: 'all',
        limit: 20, // Fetch more to allow for filtering
        filters: {
          active_profiles: true,
          sort_by: 'last_active',
          sort_order: 'desc'
        }
      });
      
      if (response && response.status === 'success' && response.data?.profiles) {
        let filteredProfiles = response.data.profiles;
        
        // Apply gender filtering - show opposite gender profiles
        const targetGender = currentUserGender === 'male' ? 'female' : 'male';
        
        filteredProfiles = response.data.profiles.filter((profile: any) => {
          const profileGender = profile?.gender?.toLowerCase();
          const matches = profileGender === targetGender;
          if (!matches) {
            console.log(`🚫 Filtering out ${profileGender} user (looking for ${targetGender})`);
          }
          return matches;
        });
        
        console.log(`🔍 Gender filter: User is ${currentUserGender}, showing ${targetGender} profiles`);
        console.log(`✅ Filtered active chats: ${filteredProfiles.length} profiles`);
        
        setActiveChats(filteredProfiles.slice(0, 8)); // Limit to 8 for horizontal scroll
      }
    } catch (error) {
      console.error('Failed to fetch active chats:', error);
    }
  }, [currentUserGender]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
    fetchActiveChats();
    setRefreshing(false);
  }, [fetchConversations, fetchActiveChats]);

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      const minutes = Math.floor((diffInHours - hours) * 60);
      return `${hours}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'pm' : 'am'}`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };


  const handleChatPress = (conversation: any) => {
    // Allow all users to access chat
    console.log('💬 Chat Press - Opening conversation:', {
      isPremiumUser,
      userPackageId: user?.package_id,
      userPremium: user?.premium,
      packageName: user?.package_name
    });

    // Get the correct image from multiple possible sources
    let chatImage = conversation.other_user?.image || 
                    conversation.other_user_image || 
                    conversation.other_user?.images?.[0] || 
                    '';
    
    // If image is just a filename (no http), construct full production URL
    if (chatImage && !chatImage.startsWith('http')) {
      chatImage = `https://90skalyanam.com/assets/images/user/profile/${chatImage}`;
    }
    
    console.log('💬 Opening chat with image:', {
      id: conversation.id,
      name: conversation.other_user?.name || conversation.other_user_name,
      rawImage: chatImage,
      userId: conversation.other_user?.id || conversation.other_user_id
    });
    
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: conversation.id,
        name: conversation.other_user?.name || conversation.other_user_name || 'User',
        image: chatImage || '',
        userId: (conversation.other_user?.id || conversation.other_user_id || conversation.id).toString()
      }
    });
  };

  const renderActiveChat = ({ item }: { item: any }) => {
    const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile';
    const profileImage = item?.images?.[0] || (item?.image ? getImageUrl(item.image).primary : null);
    const profileName = item?.name || `${item?.firstname || ''} ${item?.lastname || ''}`.trim() || 'User';
    const isOnline = item?.is_online === true || item?.is_online === 1 || item?.online_status === true || item?.online_status === 1 || item?.online_status === 'online'; // Check if user is online
    const userGender = item?.gender?.toLowerCase();
    const defaultImage = userGender === 'female' ? require('../../assets/images/default-female.jpg') :
      userGender === 'male' ? require('../../assets/images/default-male.jpg') :
      (currentUserGender === 'male' ? require('../../assets/images/default-female.jpg') : require('../../assets/images/default-male.jpg'));
    
    return (
      <TouchableOpacity style={styles.storyItem} onPress={() => {
        router.push({ pathname: '/chat/[id]', params: { id: item.id?.toString(), name: profileName, image: profileImage || '', userId: item.id?.toString() } });
      }}>
        <View style={styles.storyImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.storyImage} resizeMode="cover" />
          ) : (
            <Image source={defaultImage} style={styles.storyImage} resizeMode="cover" />
          )}
          {isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        <Text style={[styles.storyName, theme==='dark' && { color:'#FFFFFF' }]} numberOfLines={1}>{profileName}</Text>
      </TouchableOpacity>
    );
  };

  const renderConversationItem = ({ item }: { item: any }) => {
    // Try multiple sources for the image
    let profileImage = null;
    
    // First try: other_user.image (full URL from API)
    if (item.other_user?.image) {
      profileImage = item.other_user.image;
    }
    // Second try: other_user_image (flattened structure)
    else if (item.other_user_image) {
      profileImage = item.other_user_image;
    }
    // Third try: images array
    else if (item.other_user?.images?.[0]) {
      profileImage = item.other_user.images[0];
    }
    // Fourth try: use getImageUrl helper if we have a filename
    else if (item.other_user?.image) {
      const imageUrls = getImageUrl(item.other_user.image);
      profileImage = imageUrls.primary;
    }
    
    const profileName = item.other_user?.name || item.other_user_name || 'User';
    const userGender = item.other_user?.gender || item.other_user_gender;
    const hasUnread = item.unread_count > 0;
    const messageItemBg = theme === 'dark' ? '#2A2A2A' : '#FFFFFF';
    const messageNameColor = theme === 'dark' ? '#FFFFFF' : '#1F2937';
    const messageTimeColor = theme === 'dark' ? '#9CA3AF' : '#9CA3AF';
    const messageTextColor = theme === 'dark' ? '#B0B0B0' : '#6B7280';
    const messageBorderColor = theme === 'dark' ? '#3A3A3A' : '#F3F4F6';
    const defaultImage = userGender?.toLowerCase() === 'female' ? require('../../assets/images/default-female.jpg') :
      userGender?.toLowerCase() === 'male' ? require('../../assets/images/default-male.jpg') :
      (currentUserGender === 'male' ? require('../../assets/images/default-female.jpg') : require('../../assets/images/default-male.jpg'));
    
    // Console log profile image details
    console.log('📱 Chat List - Conversation Item:', {
      userId: item.other_user?.id || item.other_user_id,
      userName: profileName,
      rawImage: item.other_user?.image || item.other_user_image,
      images: item.other_user?.images,
      finalProfileImage: profileImage,
      unreadCount: item.unread_count,
      allOtherUserData: item.other_user,
      flattenedData: {
        other_user_image: item.other_user_image,
        other_user_name: item.other_user_name,
      }
    });
    
    return (
      <TouchableOpacity 
        style={[
          styles.messageCard, 
          { backgroundColor: messageItemBg, borderColor: messageBorderColor },
          hasUnread && styles.messageCardUnread
        ]} 
        onPress={() => handleChatPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.messageAvatar}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.messageAvatarImage} resizeMode="cover" />
          ) : (
            <Image source={defaultImage} style={styles.messageAvatarImage} resizeMode="cover" />
          )}
          {hasUnread && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={[styles.messageName, { color: messageNameColor }, hasUnread && styles.messageNameUnread]} numberOfLines={1}>
              {profileName}
            </Text>
            <Text style={[styles.messageTime, { color: messageTimeColor }]}>{formatMessageTime(item.last_message_time)}</Text>
          </View>
          
          <View style={styles.messageTextRow}>
            <Feather name="message-circle" size={14} color={messageTextColor} />
            <Text style={[styles.messageText, { color: messageTextColor }, hasUnread && styles.messageTextUnread]} numberOfLines={1}>
              {item.last_message || 'Start conversation'}
            </Text>
          </View>
        </View>
        
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    headerBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F8F9FA' },
  };

  if (loading) {
    return (
      <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
        <StatusBar 
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
          translucent={false}
        />
        <UniversalHeader 
          title="Chats"
          showProfileImage={true}
          userImage={user?.image}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  return (
    <WithSwipe toLeft="/(tabs)/saved" toRight="/(tabs)/account">
    <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <UniversalHeader
        title="Messages"
        showProfileImage={true}
        userImage={user?.image}
        onProfilePress={() => router.push('/(tabs)/account')}
        leftIcon="menu"
      />

      {/* Premium banner removed - all users can now access chat */}

      {/* Active Chats Horizontal Scroll */}
      <View style={[styles.activeChatsContainer, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}>
        <FlatList
          data={activeChats}
          renderItem={renderActiveChat}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeChatsContent}
          ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        />
      </View>

      {/* Messages List */}
      {conversations.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}>
          <Feather name="message-circle" size={64} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No conversations yet</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            Start connecting with profiles you're interested in to begin conversations.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.messagesContent, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}
          style={{ backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF' }}
        />
      )}

      {/* Menu Modal */}
      <MenuModal 
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />
    </View>
    </WithSwipe>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    marginTop: 0
  },
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginTop:'auto'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChatsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  activeChatsContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  storyItem: {
    alignItems: 'center',
    width: 90,
  },
  storyImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineStatusContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  onlineStatusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  storyName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#6B7280',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  // Message Card Styles
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  messageCardUnread: {
    borderColor: '#DC2626',
  },
  messageAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  messageAvatarImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  messageContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  messageNameUnread: {
    fontWeight: '700',
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 10,
  },
  messageTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageText: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1,
  },
  messageTextUnread: {
    color: '#666',
    fontWeight: '500',
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.icon,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F5F5F5',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 24,
  },
  premiumBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  premiumBannerText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  premiumBannerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  premiumBannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  premiumBannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
});