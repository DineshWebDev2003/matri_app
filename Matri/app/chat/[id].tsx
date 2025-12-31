import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Modal, Animated, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import FallbackImage from '../../components/FallbackImage';

import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Note: Using simple in-memory storage for conversation IDs
// In production, consider using @react-native-async-storage/async-storage
import { apiService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

// Wave Animation Component
const WaveAnimation = ({ isRecording }: { isRecording: boolean }) => {
  const [waveAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  const scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  if (!isRecording) return null;

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.wave, { transform: [{ scale }] }]} />
      <Animated.View style={[styles.wave, styles.wave2, { transform: [{ scale: scale }] }]} />
      <Animated.View style={[styles.wave, styles.wave3, { transform: [{ scale: scale }] }]} />
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [waitingForReply, setWaitingForReply] = useState(false);
  const [hasReceivedReply, setHasReceivedReply] = useState(false);
  const [chatTitle, setChatTitle] = useState('Chat');
  const [chatImage, setChatImage] = useState('https://via.placeholder.com/40');
  const [otherUserGender, setOtherUserGender] = useState<string | null>(null);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [userHasActed, setUserHasActed] = useState(false);
  const [showCallMenu, setShowCallMenu] = useState(false);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  useEffect(() => {
    console.log('📋 Chat screen params:', params);
    if (params.userId) {
      // Set chat title and image from params or use fallbacks
      setChatTitle(params.name || 'User');

      // Initialize gender from navigation params if provided
      if (params.gender && typeof params.gender === 'string') {
        setOtherUserGender(String(params.gender));
      }
      
      // Handle image URL - construct full URL if needed
      let imageUrl = (params.image as string) || 'https://via.placeholder.com/40';
      if (imageUrl && !imageUrl.startsWith('http')) {
        const urls = getImageUrl(imageUrl);
        imageUrl = urls.primary || 'https://via.placeholder.com/40';
        
      }
      console.log('🖼️ Chat Screen - Image URL Details:', {
        rawImage: params.image,
        constructedUrl: imageUrl,
        isHttp: imageUrl?.startsWith('http'),
        userId: params.userId,
        userName: params.name,
      });
      setChatImage(imageUrl);
      
      fetchOrCreateConversation();
    }
  }, [params.userId]);

  // Refresh messages when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        console.log('🔄 Screen focused, refreshing messages...');
        fetchMessages(conversationId);
      }
    }, [conversationId])
  );

  // Simple in-memory storage for conversation IDs (per session)
  const conversationStorage: { [key: string]: string } = {};

  const getStoredConversationId = async (userId: string): Promise<string | null> => {
    return conversationStorage[`conversation_${userId}`] || null;
  };

  const storeConversationId = async (userId: string, conversationId: string) => {
    conversationStorage[`conversation_${userId}`] = conversationId;
    console.log('📱 Stored conversation ID:', conversationId, 'for user:', userId);
  };

  const removeStoredConversationId = async (userId: string) => {
    delete conversationStorage[`conversation_${userId}`];
    console.log('📱 Removed stored conversation ID for user:', userId);
  };

  const fetchOrCreateConversation = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching conversation for user:', params.userId);
      console.log('📋 Params received:', params);
      
      // First, check if we have a stored conversation ID for this user
      const storedConvId = await getStoredConversationId(params.userId as string);
      if (storedConvId) {
        console.log('📱 Found stored conversation ID:', storedConvId);
        try {
          setConversationId(storedConvId);
          await fetchMessages(storedConvId);
          return; // Exit early if stored conversation works
        } catch (error) {
          console.log('❌ Stored conversation ID invalid, removing:', error);
          await removeStoredConversationId(params.userId as string);
        }
      }
      
      // If no stored ID or it failed, try to get existing conversations from API
      console.log('🌐 Calling getConversations API...');
      const conversationsResponse = await apiService.getConversations();
      console.log('✅ Conversations API response:', conversationsResponse);
      
      if (conversationsResponse.status === 'success') {
        console.log('📋 All conversations:', conversationsResponse.data.conversations);
        
        // Try different possible structures for finding the conversation
        const existingConversation = conversationsResponse.data.conversations.find(
          (conv: any) => {
            // Check various possible user ID fields - handle flattened API structure
            const otherUserId = conv.other_user?.id || conv.other_user_id || conv.user_id || conv.receiver_id || conv.sender_id;
            const participantIds = conv.participants?.map((p: any) => p.id) || [];
            
            // Check direct ID match
            if (otherUserId?.toString() === params.userId?.toString()) {
              return true;
            }
            
            // Check if user is in participants
            if (participantIds.includes(parseInt(params.userId as string))) {
              return true;
            }
            
            // Check both sender and receiver IDs
            if (conv.sender_id?.toString() === params.userId?.toString() || 
                conv.receiver_id?.toString() === params.userId?.toString()) {
              return true;
            }
            
            return false;
          }
        );
        
        if (existingConversation) {
          console.log('✅ Found existing conversation:', existingConversation.id);
          console.log('📋 Conversation details:', existingConversation);
          setConversationId(existingConversation.id.toString());
          
          // Update chat image from conversation data if available
          if (existingConversation.other_user_image) {
            setChatImage(existingConversation.other_user_image);
          }
          
          // Extract gender information if available
          if (existingConversation.other_user_gender) {
            setOtherUserGender(existingConversation.other_user_gender);
          } else if (existingConversation.other_user?.gender) {
            setOtherUserGender(existingConversation.other_user.gender);
          }
          
          // Store the conversation ID for future use
          await storeConversationId(params.userId as string, existingConversation.id.toString());
          await fetchMessages(existingConversation.id.toString());
        } else {
          console.log('📝 No existing conversation found in list, trying direct lookup...');
          console.log('🔍 Looking for userId:', params.userId);
          console.log('📋 Available conversations:', conversationsResponse.data.conversations.map((conv: any) => ({
            id: conv.id,
            other_user_id: conv.other_user_id,
            other_user_name: conv.other_user_name,
            other_user: conv.other_user
          })));
          
          // Try to find conversation by checking if messages exist between users
          await tryDirectConversationLookup();
        }
      }
    } catch (error) {
      console.error('💥 Error fetching conversation:', error);
      setMessages([]); // Fallback to empty messages
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
    } finally {
      setLoading(false);
    }
  };

  const tryDirectConversationLookup = async () => {
    try {
      console.log('🔍 Attempting direct conversation lookup...');
      
      // Check if we have any conversations for this user
      const response = await apiService.getConversations();
      if (response.status === 'success' && response.data.conversations.length > 0) {
        console.log('📋 Found conversations in direct lookup:', response.data.conversations);
        console.log('🔍 Direct lookup - searching for userId:', params.userId);
        
        const foundConversation = response.data.conversations.find(
          (conv: any) => {
            const otherUserId = conv.other_user?.id || conv.other_user_id || conv.user_id || conv.receiver_id || conv.sender_id;
            console.log('🔍 Checking conversation:', conv.id, 'otherUserId:', otherUserId, 'params.userId:', params.userId);
            return otherUserId?.toString() === params.userId?.toString();
          }
        );
        
        if (foundConversation) {
          console.log('✅ Found existing conversation in direct lookup:', foundConversation.id);
          setConversationId(foundConversation.id.toString());
          
          // Update chat image from conversation data if available
          if (foundConversation.other_user_image) {
            setChatImage(foundConversation.other_user_image);
          }
          
          // Extract gender information if available
          if (foundConversation.other_user_gender) {
            setOtherUserGender(foundConversation.other_user_gender);
          } else if (foundConversation.other_user?.gender) {
            setOtherUserGender(foundConversation.other_user.gender);
          }
          
          // Store the conversation ID for future use
          await storeConversationId(params.userId as string, foundConversation.id.toString());
          await fetchMessages(foundConversation.id.toString());
          return;
        } else {
          console.log('❌ No matching conversation found in direct lookup');
        }
      }
      
      // No existing conversation found, set up for new conversation creation
      console.log('📝 No conversation found, will create on first message');
      setMessages([]);
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
      
    } catch (error) {
      console.error('💥 Direct conversation lookup failed:', error);
      // Fallback to new conversation state
      setMessages([]);
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      console.log('📨 Fetching messages for conversation:', convId);
      console.log('🔗 API endpoint: /conversations/' + convId + '/messages');
      
      const response = await apiService.getMessages(convId);
      console.log('📨 Full API response:', response);
      
      if (response.status === 'success' || response.status === 'error') {
        const apiMessages = response.data?.messages || [];
        console.log('📨 Raw API messages:', apiMessages);
        console.log('📊 Message count:', apiMessages.length);
        
        if (apiMessages.length === 0) {
          console.log('⚠️ No messages found for conversation:', convId);
          console.log('ℹ️ This is normal for a new conversation');
          setMessages([]);
          // Set up for new conversation if no messages
          setCanSendMessage(true);
          setWaitingForReply(false);
          setHasReceivedReply(false);
          return;
        }
        
        // Transform API messages to match our UI format
        const transformedMessages = apiMessages.map((msg: any) => {
          console.log('🔍 Processing message:', msg);
          const isMyMessage = msg.is_mine || msg.sender_id === currentUser?.id;
          
          // Determine sender image for other user's messages
          let senderImageUrl = null;
          if (!isMyMessage) {
            // Try multiple sources for the sender image
            const imageFilename = msg.sender_image || msg.image;
            
            if (imageFilename) {
              // If we have an image filename, construct the production URL
              const productionImageUrl = `${process.env.EXPO_PUBLIC_PRODUCTION_PROFILE_IMAGE_URL}/${imageFilename}`;
              senderImageUrl = productionImageUrl;
              console.log('🖼️ Message sender image:', {
                filename: imageFilename,
                productionUrl: productionImageUrl
              });
            } else {
              // Fallback to chat image or gender-based placeholder
              senderImageUrl = chatImage || 
                             (otherUserGender === 'female' ? 'https://via.placeholder.com/40/FF69B4/FFFFFF?text=F' : 'https://via.placeholder.com/40/4169E1/FFFFFF?text=M');
            }
          }
          
          return {
            id: msg.id.toString(),
            text: msg.message || msg.content || msg.text,
            sender: isMyMessage ? 'me' : 'other',
            timestamp: formatMessageTime(msg.created_at || msg.timestamp),
            type: 'text',
            senderImage: senderImageUrl
          };
        });
        
        console.log('✅ Messages loaded:', transformedMessages.length);
        console.log('📨 Transformed messages:', transformedMessages);
        
        // Sort messages by ID or timestamp to ensure correct order
        const sortedMessages = transformedMessages.sort((a: any, b: any) => {
          // Try to sort by timestamp first, then by ID
          const aTime = new Date(a.timestamp || '').getTime();
          const bTime = new Date(b.timestamp || '').getTime();
          
          if (aTime && bTime && aTime !== bTime) {
            return aTime - bTime;
          }
          
          // Fallback to ID sorting
          return parseInt(a.id) - parseInt(b.id);
        });
        
        setMessages(sortedMessages);
        
        // Analyze conversation state for message restrictions
        analyzeConversationState(sortedMessages);
      } else {
        console.log('❌ Failed to fetch messages:', response);
        setMessages([]);
        // Reset to new conversation state on failure
        setCanSendMessage(true);
        setWaitingForReply(false);
        setHasReceivedReply(false);
      }
    } catch (error: any) {
      console.error('💥 Error fetching messages:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Don't fail - allow user to send first message
      console.log('ℹ️ Allowing new conversation creation');
      setMessages([]);
      // Reset to new conversation state on error
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
    }
  };

  const analyzeConversationState = (messages: any[]) => {
    if (messages.length === 0) {
      // No messages - can send first message
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
      return;
    }

    const myMessages = messages.filter(msg => msg.sender === 'me');
    const otherMessages = messages.filter(msg => msg.sender === 'other');

    if (myMessages.length > 0 && otherMessages.length === 0) {
      // I sent message(s) but no reply yet - waiting for reply
      setCanSendMessage(false);
      setWaitingForReply(true);
      setHasReceivedReply(false);
      console.log('🚫 Waiting for reply - cannot send more messages');
    } else if (otherMessages.length > 0) {
      // Received at least one reply - unlimited chat enabled
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(true);
      console.log('✅ Reply received - unlimited chat enabled');
    } else {
      // Default state - can send first message
      setCanSendMessage(true);
      setWaitingForReply(false);
      setHasReceivedReply(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    if (inputText.trim().length > 0 && canSendMessage) {
      const messageText = inputText.trim();
      setInputText(''); // Clear input immediately for better UX
      
      // Mark user as having taken action
      setUserHasActed(true);
      setIsUserOnline(true); // Assume online when user sends message
      
      // Add message to UI optimistically
      const tempMessage = { 
        id: `temp_${Date.now()}`, 
        text: messageText, 
        sender: 'me', 
        timestamp: formatMessageTime(new Date().toISOString()),
        type: 'text'
      };
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      try {
        if (conversationId) {
          // Send message to existing conversation
          console.log('📤 Sending message to conversation:', conversationId);
          const response = await apiService.sendMessage(conversationId, messageText);
          
          if (response.status === 'success') {
            // Replace temp message with real message from API
            const realMessage = {
              id: response.data.message.id.toString(),
              text: response.data.message.message,
              sender: 'me',
              timestamp: formatMessageTime(response.data.message.created_at),
              type: 'text'
            };
            
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === tempMessage.id ? realMessage : msg
              )
            );
            console.log('✅ Message sent successfully');
            
            // Set waiting state if this was the first message
            if (!hasReceivedReply) {
              setCanSendMessage(false);
              setWaitingForReply(true);
            }
            
            // Refresh messages to ensure we have the latest data
            setTimeout(() => {
              fetchMessages(conversationId);
            }, 500);
          }
        } else {
          // Create new conversation with first message
          console.log('📝 Creating new conversation with user:', params.userId);
          const response = await apiService.createConversation(params.userId as string, messageText);
          
          if (response.status === 'success') {
            const newConvId = response.data.conversation_id.toString();
            setConversationId(newConvId);
            
            // Store conversation ID locally for future use
            await storeConversationId(params.userId as string, newConvId);
            
            // Replace temp message with real message
            const realMessage = {
              id: response.data.message_id.toString(),
              text: messageText,
              sender: 'me',
              timestamp: formatMessageTime(new Date().toISOString()),
              type: 'text'
            };
            
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === tempMessage.id ? realMessage : msg
              )
            );
            console.log('✅ Conversation created and message sent');
            
            // Set waiting state after first message
            setCanSendMessage(false);
            setWaitingForReply(true);
            
            // Refresh messages to ensure we have the latest data
            setTimeout(() => {
              fetchMessages(newConvId);
            }, 500);
            
            // Also refresh conversations list to ensure it appears in chat list
            setTimeout(() => {
              console.log('🔄 Refreshing conversations list after message sent');
              apiService.getConversations().then(response => {
                console.log('📋 Updated conversations after send:', response.data);
              });
            }, 1000);
          }
        }
      } catch (error) {
        console.error('💥 Error sending message:', error);
        // Remove the temp message on error
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== tempMessage.id)
        );
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  const onRefresh = async () => {
    if (conversationId) {
      setRefreshing(true);
      await fetchMessages(conversationId);
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newMessage = { id: Date.now().toString(), type: 'image', uri: result.assets[0].uri, sender: 'me', timestamp: '' };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      const newMessage = { id: Date.now().toString(), type: 'image', uri: result.assets[0].uri, sender: 'me', timestamp: '' };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    }
  };

  async function startRecording() {
    try {
      console.log('Starting recording..');
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { 
      id: Date.now().toString(), 
      type: 'audio', 
      uri: uri, 
      sender: 'me', 
      timestamp: timestamp 
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setRecording(undefined);
  }

  const playAudio = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const getAvatarSource = (senderImage: string | null, isMyMessage: boolean) => {
    if (isMyMessage) return null;
    
    // If we have a sender image, use it (construct URL if needed)
    if (senderImage) {
      if (senderImage.startsWith('http')) {
        console.log('💬 Avatar Source - Full URL:', senderImage);
        return senderImage;
      }
      
      // If it's just a filename, construct the production URL
      const productionImageUrl = `${process.env.EXPO_PUBLIC_PRODUCTION_PROFILE_IMAGE_URL}/${senderImage}`;
      console.log('💬 Avatar Source - Production URL:', {
        filename: senderImage,
        productionUrl: productionImageUrl,
      });
      return productionImageUrl;
    }
    
    // If no image but we have gender info, use appropriate gender avatar
    if (otherUserGender) {
      const genderUrl = otherUserGender.toLowerCase() === 'female' 
        ? 'https://via.placeholder.com/40/FF69B4/FFFFFF?text=F'  // Pink background for female
        : 'https://via.placeholder.com/40/4169E1/FFFFFF?text=M'; // Blue background for male
      console.log('💬 Avatar Source - Gender Avatar:', { gender: otherUserGender, url: genderUrl });
      return genderUrl;
    }
    
    // Fallback to neutral placeholder with user initial
    const placeholderUrl = `https://via.placeholder.com/40/808080/FFFFFF?text=${chatTitle.charAt(0).toUpperCase()}`;
    console.log('💬 Avatar Source - Placeholder:', { chatTitle, url: placeholderUrl });
    return placeholderUrl;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.sender === 'me';
    switch (item.type) {
      case 'date':
        return <Text style={styles.dateSeparator}>{item.text}</Text>;
      case 'image':
        return (
          <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
            {!isMyMessage && (
              <FallbackImage 
              source={{ uri: getAvatarSource(item.senderImage, isMyMessage) }} 
              fallbackSource={otherUserGender?.toLowerCase()==='female' ? require('../../assets/images/default-female.jpg') : require('../../assets/images/default-male.jpg')} 
              style={styles.messageAvatar} />
            )}
            <TouchableOpacity onPress={() => { setSelectedImage(item.uri); setModalVisible(true); }}>
              <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
                <Image source={{ uri: item.uri }} style={styles.chatImage} />
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'audio':
        return (
          <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
            {!isMyMessage && (
              <FallbackImage 
              source={{ uri: getAvatarSource(item.senderImage, isMyMessage) }} 
              fallbackSource={otherUserGender?.toLowerCase()==='female' ? require('../../assets/images/default-female.jpg') : require('../../assets/images/default-male.jpg')} 
              style={styles.messageAvatar} />
            )}
            <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
              <TouchableOpacity onPress={() => playAudio(item.uri)} style={styles.audioBubble}>
                <Feather name="play" size={24} color={isMyMessage ? 'black' : 'black'} />
                <Text style={{marginLeft: 10}}>Voice Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return (
          <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
            {!isMyMessage && (
              <FallbackImage 
              source={{ uri: getAvatarSource(item.senderImage, isMyMessage) }} 
              fallbackSource={otherUserGender?.toLowerCase()==='female' ? require('../../assets/images/default-female.jpg') : require('../../assets/images/default-male.jpg')} 
              style={styles.messageAvatar} />
            )}
            <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
              <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
              {item.timestamp && (
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              )}
            </View>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
        {/* Header without gradient - Outside SafeAreaView to prevent overlap */}
        <View style={[styles.headerWithoutGradient, theme === 'dark' && styles.headerWithoutGradientDark, { paddingTop: insets.top + 12 }]}>
          {/* User Info Section - Simplified Header */}
          <View style={[styles.userInfoSection, { justifyContent: 'space-between' }]}>
            {/* Left: Back Arrow + Profile */}
            <View style={styles.userInfoLeft}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
                <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
              </TouchableOpacity>
              <FallbackImage
                source={{ uri: chatImage }}
                fallbackSource={otherUserGender?.toLowerCase() === 'female'
                  ? require('../../assets/images/default-female.jpg')
                  : require('../../assets/images/default-male.jpg')}
                style={styles.userInfoAvatar}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.userInfoNameLight, theme === 'dark' && { color: '#FFFFFF' }]}>{chatTitle}</Text>
                <Text style={[styles.userInfoStatusLight, theme === 'dark' && { color: '#9CA3AF' }]}>
                  {isUserOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.loadingContainer, theme === 'dark' && styles.loadingContainerDark]}>
          <ActivityIndicator size="large" color="#C6222F" />
          <Text style={[styles.loadingText, theme === 'dark' && styles.loadingTextDark]}>Loading conversation...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      {/* Header without gradient - Outside SafeAreaView to prevent overlap */}
      <View style={[styles.headerWithoutGradient, theme === 'dark' && styles.headerWithoutGradientDark, { paddingTop: insets.top + 12 }]}>
        {/* User Info Section - Simplified Header */}
        <View style={[styles.userInfoSection, { justifyContent: 'space-between' }]}>
          {/* Left: Back Arrow + Profile */}
          <View style={styles.userInfoLeft}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
              <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
            <FallbackImage
              source={{ uri: chatImage }}
              fallbackSource={otherUserGender?.toLowerCase() === 'female'
                ? require('../../assets/images/default-female.jpg')
                : require('../../assets/images/default-male.jpg')}
              style={styles.userInfoAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.userInfoNameLight, theme === 'dark' && { color: '#FFFFFF' }]}>{chatTitle}</Text>
              <Text style={[styles.userInfoStatusLight, theme === 'dark' && { color: '#9CA3AF' }]}>
                {isUserOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={[styles.messagesList, theme === 'dark' && styles.messagesListDark]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={[styles.emptyContainer, theme === 'dark' && styles.emptyContainerDark]}>
              <Text style={[styles.emptyText, theme === 'dark' && styles.emptyTextDark]}>No messages yet. Start the conversation!</Text>
            </View>
          )}
        />
        {waitingForReply ? (
          <View style={[styles.waitingContainer, theme === 'dark' && styles.waitingContainerDark]}>
            <View style={styles.waitingContent}>
              <Feather name="clock" size={24} color="#F59E0B" />
              <Text style={[styles.waitingText, theme === 'dark' && styles.waitingTextDark]}>
                Message sent! Waiting for {chatTitle} to reply before you can send more messages.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.inputContainer, theme === 'dark' && styles.inputContainerDark]}>
            <TouchableOpacity 
              style={[styles.inputButton, !canSendMessage && styles.disabledButton]} 
              onPress={canSendMessage ? takePhoto : undefined}
              disabled={!canSendMessage}
            >
              <Feather name="camera" size={24} color={canSendMessage ? (theme === 'dark' ? '#B0B0B0' : '#6B7280') : "#D1D5DB"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.inputButton, !canSendMessage && styles.disabledButton]} 
              onPress={canSendMessage ? pickImage : undefined}
              disabled={!canSendMessage}
            >
              <Feather name="image" size={24} color={canSendMessage ? (theme === 'dark' ? '#B0B0B0' : '#6B7280') : "#D1D5DB"} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, !canSendMessage && styles.disabledInput, theme === 'dark' && styles.inputDark]}
              placeholder={canSendMessage ? "Say Something nice..." : "Waiting for reply..."}
              placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
              value={inputText}
              onChangeText={setInputText}
              editable={canSendMessage}
            />
            <View style={styles.micContainer}>
              <TouchableOpacity 
                style={[styles.inputButton, !canSendMessage && styles.disabledButton]} 
                onPress={canSendMessage ? (recording ? stopRecording : startRecording) : undefined}
                disabled={!canSendMessage}
              >
                <Feather name="mic" size={24} color={isRecording ? 'red' : (canSendMessage ? (theme === 'dark' ? '#B0B0B0' : '#6B7280') : '#D1D5DB')} />
              </TouchableOpacity>
              <WaveAnimation isRecording={isRecording} />
            </View>
            <TouchableOpacity 
              style={[styles.inputButton, !canSendMessage && styles.disabledButton]} 
              onPress={canSendMessage ? handleSend : undefined}
              disabled={!canSendMessage}
            >
              <Feather name="send" size={24} color={canSendMessage ? (theme === 'dark' ? '#B0B0B0' : '#6B7280') : "#D1D5DB"} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Image Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Feather name="x" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  containerDark: { backgroundColor: '#1A1A1A' },
  
  // Light Header (without gradient)
  headerWithoutGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerWithoutGradientDark: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#2A2A2A',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTopTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  userInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfoNameLight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  userInfoStatusLight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  userInfoActionsLight: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonLightDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerWithMargin: { marginTop: 8 },
  headerDark: { backgroundColor: '#2A2A2A', borderBottomColor: '#3A3A3A' },
  headerAvatarContainer: { position: 'relative', marginHorizontal: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerOnlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF' },
  onlineActive: { backgroundColor: '#10B981' },
  offlineActive: { backgroundColor: '#9CA3AF' },
  headerName: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  headerNameDark: { color: '#FFFFFF' },
  headerSubtitle: { color: 'gray', fontSize: 12 },
  headerSubtitleDark: { color: '#B0B0B0' },
  messagesContainer: { padding: 10 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5 },
  myMessageContainer: { justifyContent: 'flex-end' },
  otherMessageContainer: { justifyContent: 'flex-start' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, marginBottom: 5 },
  messageAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, marginRight: 8, marginBottom: 5, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  messageBubble: { padding: 10, borderRadius: 20, maxWidth: '75%' },
  myBubble: { backgroundColor: '#facc15', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  myMessageText: { color: 'black' },
  otherMessageText: { color: 'black' },
  timestamp: { fontSize: 10, color: '#666', marginTop: 4, alignSelf: 'flex-end' },
  dateSeparator: { alignSelf: 'center', color: 'gray', marginVertical: 10 },
  chatImage: { width: 150, height: 200, borderRadius: 15 },
  audioBubble: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#FFFFFF' },
  inputContainerDark: { backgroundColor: '#2A2A2A', borderTopColor: '#3A3A3A' },
  input: { flex: 1, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, color: '#000' },
  inputDark: { backgroundColor: '#3A3A3A', color: '#FFFFFF' },
  inputButton: { padding: 5, marginLeft: 5 },
  micContainer: { position: 'relative', alignItems: 'center' },
  waveContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  wave2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  wave3: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  fullScreenImage: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingTextDark: {
    color: '#B0B0B0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: 'white',
  },
  emptyContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#B0B0B0',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  messagesListDark: {
    backgroundColor: '#1A1A1A',
  },
  waitingContainer: {
    backgroundColor: '#FEF3C7',
    borderTopWidth: 1,
    borderTopColor: '#F59E0B',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  waitingContainerDark: {
    backgroundColor: '#3A3A3A',
    borderTopColor: '#6B7280',
  },
  waitingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    flex: 1,
  },
  waitingTextDark: {
    color: '#B0B0B0',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  // Call Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingRight: 16,
  },
  callMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginLeft: 'auto',
    marginRight: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callMenuContainerDark: {
    backgroundColor: '#2A2A2A',
  },
  callMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  callMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  callMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 0,
  },
  callMenuDividerDark: {
    backgroundColor: '#3A3A3A',
  },
});
