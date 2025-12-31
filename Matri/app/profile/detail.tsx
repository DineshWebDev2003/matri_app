import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import FallbackImage from '../../components/FallbackImage';
import { getImageUrl } from '../../utils/imageUtils';

const { width: screenWidth } = Dimensions.get('window');

const DetailRow = ({ label, value, theme }: { label: string; value: string; theme?: string }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, theme === 'dark' && { color: '#9CA3AF' }]}>{label}</Text>
    <Text style={[styles.detailValue, theme === 'dark' && { color: '#FFFFFF' }]}>{value}</Text>
  </View>
);

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const auth = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile(id as string);
      
      if (response.status === 'success') {
        const memberData = response.data?.member || response.data;
        const processedProfile = {
          id: memberData.id,
          name: `${memberData.firstname || ''} ${memberData.lastname || ''}`.trim(),
          age: memberData.age || 'N/A',
          location: memberData.location || memberData.city || 'N/A',
          profession: memberData.profession || 'N/A',
          education: memberData.education || 'N/A',
          religion: memberData.religion || 'N/A',
          caste: memberData.caste || 'N/A',
          height: memberData.height || 'N/A',
          weight: memberData.weight || 'N/A',
          mobile: memberData.mobile || 'N/A',
          email: memberData.email || 'N/A',
          is_premium: memberData.is_premium || false,
          image: memberData.image || null,
        };
        
        setProfile(processedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (auth?.isGuest) {
      Alert.alert('Login Required', 'Please login to chat with this member', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    router.push(`/chat/${profile?.id}`);
  };

  const handleInterest = () => {
    if (auth?.isGuest) {
      Alert.alert('Login Required', 'Please login to send interest', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    if (auth?.user?.membership_type !== 'premium') {
      Alert.alert('Premium Feature', 'Upgrade to premium to send interests', [
        { text: 'Cancel' },
        { text: 'Upgrade', onPress: () => router.push('/membership-plans') }
      ]);
      return;
    }

    setIsInterested(!isInterested);
    Alert.alert('Success', isInterested ? 'Interest removed' : 'Interest sent successfully!');
  };

  const handleBlock = () => {
    Alert.alert(
      'Block Member',
      'Are you sure you want to block this member?',
      [
        { text: 'Cancel' },
        { 
          text: 'Block', 
          onPress: () => {
            Alert.alert('Success', 'Member blocked successfully');
            router.back();
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
        <ActivityIndicator size="large" color="#DC2626" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const imageUrls = getImageUrl(profile?.image);
  const profileImagePrimary = imageUrls.primary || 'https://via.placeholder.com/400x600';
  const profileImageFallback = imageUrls.fallback ? { uri: imageUrls.fallback } : undefined;
  console.log('👤 Profile Detail (Detail View) - Main Image:', {
    profileId: profile?.id,
    profileName: profile?.name,
    rawImage: profile?.image,
    primaryUrl: profileImagePrimary,
    fallbackUrl: imageUrls.fallback,
    hasImage: !!profile?.image,
  });
  const age = profile?.age || 'N/A';
  const location = profile?.location || 'Location N/A';
  const name = profile?.name || 'User';

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
      {/* Header */}
      <View style={[styles.header, theme === 'dark' && { backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Profile Image Card */}
        <View style={styles.imageCardContainer}>
          <LinearGradient
            colors={['#DC2626', '#EF4444', '#F87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imageCard}
          >
            <FallbackImage
              source={{ uri: profileImagePrimary }}
              fallbackSource={profileImageFallback}
              style={styles.profileImage}
              resizeMode="cover"
            />
            
            {/* Profile Info Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={styles.infoOverlay}
            >
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileDetails}>Age: {age} • {location}</Text>
              </View>
            </LinearGradient>

            {/* Premium Badge */}
            {profile?.is_premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Profile Details */}
        <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          <DetailRow label="Height" value={profile?.height || 'N/A'} theme={theme} />
          <DetailRow label="Religion" value={profile?.religion || 'N/A'} theme={theme} />
          <DetailRow label="Caste" value={profile?.caste || 'N/A'} theme={theme} />
          <DetailRow label="Education" value={profile?.education || 'N/A'} theme={theme} />
          <DetailRow label="Profession" value={profile?.profession || 'N/A'} theme={theme} />
          <DetailRow label="Location" value={location} theme={theme} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtonsContainer, theme === 'dark' && { backgroundColor: '#0F0F0F', borderTopColor: '#2A2A2A' }]}>
        {/* Chat Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.chatButton]}
          onPress={handleChat}
        >
          <Feather name="message-circle" size={24} color="white" />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>

        {/* Interest Button */}
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.interestButton,
            isInterested && styles.interestButtonActive
          ]}
          onPress={handleInterest}
        >
          <Feather 
            name="heart" 
            size={24} 
            color={isInterested ? '#DC2626' : 'white'}
            fill={isInterested ? '#DC2626' : 'none'}
          />
          <Text style={[styles.actionButtonText, isInterested && { color: '#DC2626' }]}>
            Interest
          </Text>
        </TouchableOpacity>

        {/* Block Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.blockButton]}
          onPress={handleBlock}
        >
          <Feather name="slash-circle" size={24} color="white" />
          <Text style={styles.actionButtonText}>Block</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  scrollContent: {
    flex: 1,
  },
  imageCardContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  imageCard: {
    width: '100%',
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileInfo: {
    gap: 8,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  profileDetails: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButton: {
    backgroundColor: '#3B82F6',
  },
  interestButton: {
    backgroundColor: '#DC2626',
  },
  interestButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  blockButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
});
