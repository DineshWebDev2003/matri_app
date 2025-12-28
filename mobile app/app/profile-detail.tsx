import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import UniversalHeader from '../components/UniversalHeader';
import { getImageUrl } from '../utils/imageUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profileId } = params;
  const { theme } = useTheme();
  const auth = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interestingProfiles, setInterestingProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfileDetail();
    fetchAllProfiles();
    fetchInterestingProfiles();
  }, [profileId]);

  const fetchInterestingProfiles = async () => {
    try {
      const response = await apiService.getInterestedProfiles();
      if (response.status === 'success') {
        const profiles = response.data?.profiles || [];
        const profileIds = new Set(profiles.map((p: any) => p.id?.toString() || p.user_id?.toString()));
        setInterestingProfiles(profileIds);
        
        // Check if current profile is in interested list
        if (profileIds.has(profileId?.toString())) {
          setIsInterested(true);
        }
      }
    } catch (error) {
      console.error('Error fetching interesting profiles:', error);
    }
  };

  const fetchProfileDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile(profileId as string);
      if (response.status === 'success') {
        setProfile(response.data?.member || response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      console.log('📋 Fetching all profiles for navigation...');
      const response = await apiService.getProfiles({ limit: 100 });
      
      if (response?.status === 'success' && response?.data?.profiles) {
        const profiles = response.data.profiles;
        setAllProfiles(profiles);
        
        // Find current profile index
        const index = profiles.findIndex((p: any) => p.id?.toString() === profileId?.toString());
        setCurrentIndex(index >= 0 ? index : 0);
        console.log(`✅ Loaded ${profiles.length} profiles, current index: ${index}`);
      }
    } catch (error) {
      console.error('❌ Error fetching all profiles:', error);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollPosition = event.nativeEvent.contentOffset.y;

    // Check if scrolled to bottom (within 100 pixels)
    if (scrollPosition + scrollViewHeight >= contentHeight - 100) {
      handleNavigateToMatches();
    }
  };

  const handleNavigateToMatches = () => {
    console.log('🔄 Scroll end detected, navigating to all matches...');
    if (allProfiles.length > 0) {
      router.push({
        pathname: '/all-matches',
        params: { profiles: JSON.stringify(allProfiles), currentIndex }
      });
    } else {
      Alert.alert('Info', 'No more profiles available');
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

    // Check if profile is complete
    if (!auth?.user?.profile_complete) {
      Alert.alert('Complete Your Profile', 'Please complete your profile to chat with members', [
        { text: 'Cancel' },
        { text: 'Complete Profile', onPress: () => router.push('/profile-setting') }
      ]);
      return;
    }

    // Check if user is premium
    if (!(auth?.user?.premium === 1 || auth?.user?.premium === true || auth?.user?.package_id > 1)) {
      Alert.alert('Premium Feature', 'Upgrade to premium to chat with members', [
        { text: 'Cancel' },
        { text: 'Upgrade', onPress: () => router.push('/plans') }
      ]);
      return;
    }

    // Navigate to chat screen
    router.push(`/chat/${profileId}`);
  };

  const handleInterest = async () => {
    if (auth?.isGuest) {
      Alert.alert('Login Required', 'Please login to send interest', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    // Check if profile is complete
    if (!auth?.user?.profile_complete) {
      Alert.alert('Complete Your Profile', 'Please complete your profile to send interests', [
        { text: 'Cancel' },
        { text: 'Complete Profile', onPress: () => router.push('/profile-setting') }
      ]);
      return;
    }

    if (!(auth?.user?.premium === 1 || auth?.user?.premium === true || auth?.user?.package_id > 1)) {
      Alert.alert('Premium Feature', 'Upgrade to premium to send interests', [
        { text: 'Cancel' },
        { text: 'Upgrade', onPress: () => router.push('/plans') }
      ]);
      return;
    }

    try {
      if (isInterested) {
        // Remove interest
        await apiService.removeInterest(profileId as string);
        setIsInterested(false);
        setInterestingProfiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId?.toString() || '');
          return newSet;
        });
        Alert.alert('Success', 'Interest removed');
      } else {
        // Send interest
        await apiService.sendInterest(profileId as string);
        setIsInterested(true);
        setInterestingProfiles(prev => new Set([...prev, profileId?.toString() || '']));
        Alert.alert('Success', 'Interest sent successfully!');
      }
    } catch (error) {
      console.error('Error handling interest:', error);
      Alert.alert('Error', 'Failed to process interest. Please try again.');
    }
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

  const getProfileImage = () => {
    if (profile?.image) {
      if (profile.image.startsWith('http')) {
        return profile.image;
      }
      const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.177.237.139:8000/Final%20Code/assets/assets/images/user/profile';
      return `${imageBaseUrl}/${profile.image}`;
    }
    // Return gender-wise default image
    const userGender = profile?.gender?.toLowerCase();
    return userGender === 'female' 
      ? require('../assets/images/default-female.jpg')
      : require('../assets/images/default-male.jpg');
  };

  const profileImage = getProfileImage();

  const age = profile?.age || 'N/A';
  const location = profile?.location || profile?.city || 'Location N/A';
  const name = `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim();

  return (
    <View style={[styles.container, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
      {/* Universal Header - Outside SafeAreaView to prevent overlap */}
      <UniversalHeader 
        title="Profile"
        showProfileImage={false}
        leftIcon="back"
        onLeftIconPress={() => router.back()}
      />

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        style={styles.scrollContent}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {/* Profile Image Card - No Circle Container */}
        <View style={styles.imageCardContainer}>
          <Image
            source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
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
              <Text style={styles.profileDetails}>{age} yrs • {location}</Text>
            </View>
          </LinearGradient>

          {/* Premium Badge */}
          {profile?.is_premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
            </View>
          )}
        </View>

        {/* Basic Information Section */}
        <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Basic Information</Text>
          <DetailRow label="Age" value={`${profile?.age || 'N/A'} Years`} theme={theme} />
          <DetailRow label="Blood Group" value={profile?.blood_group || 'N/A'} theme={theme} />
          <DetailRow label="Height" value={profile?.height || 'N/A'} theme={theme} />
          <DetailRow label="Religion" value={profile?.religion || 'N/A'} theme={theme} />
          <DetailRow label="Caste" value={profile?.caste || 'N/A'} theme={theme} />
          <DetailRow label="Languages" value={profile?.languages || 'N/A'} theme={theme} />
          <DetailRow label="Eye Color" value={profile?.eye_color || 'N/A'} theme={theme} />
          <DetailRow label="Hair Color" value={profile?.hair_color || 'N/A'} theme={theme} />
          <DetailRow label="Disability" value={profile?.disability || 'N/A'} theme={theme} />
          <DetailRow label="Profession" value={profile?.profession || 'N/A'} theme={theme} />
          <DetailRow label="Face Colour" value={profile?.face_colour || 'N/A'} theme={theme} />
        </View>

        {/* Address Section */}
        <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Address</Text>
          <DetailRow label="Present Address" value={profile?.present_address || location || 'N/A'} theme={theme} />
          <DetailRow label="Permanent Address" value={profile?.permanent_address || 'N/A'} theme={theme} />
        </View>

        {/* Family Information Section */}
        <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Family Information</Text>
          <DetailRow label="Father's Name" value={profile?.father_name || 'N/A'} theme={theme} />
          <DetailRow label="Father's Profession" value={profile?.father_profession || 'N/A'} theme={theme} />
          <DetailRow label="Mother's Name" value={profile?.mother_name || 'N/A'} theme={theme} />
          <DetailRow label="Mother's Profession" value={profile?.mother_profession || 'N/A'} theme={theme} />
        </View>

        {/* Career Section */}
        {(profile?.career || profile?.education || profile?.company) && (
          <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Career</Text>
            <DetailRow label="Education" value={profile?.education || 'N/A'} theme={theme} />
            <DetailRow label="Company" value={profile?.company || 'N/A'} theme={theme} />
            <DetailRow label="Career Details" value={profile?.career || 'N/A'} theme={theme} />
          </View>
        )}

        {/* Contact Details Section */}
        {(profile?.phone || profile?.email || profile?.contact) && (
          <View style={[styles.detailsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Contact Details</Text>
            {profile?.phone && <DetailRow label="Phone" value={profile.phone} theme={theme} />}
            {profile?.email && <DetailRow label="Email" value={profile.email} theme={theme} />}
            {profile?.contact && <DetailRow label="Contact" value={profile.contact} theme={theme} />}
          </View>
        )}

        {/* About Section */}
        {profile?.about && (
          <View style={[styles.aboutSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>About</Text>
            <Text style={[styles.aboutText, theme === 'dark' && { color: '#E5E7EB' }]}>
              {profile.about}
            </Text>
          </View>
        )}

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
    </View>
  );
}

const DetailRow = ({ label, value, theme }: { label: string; value: string; theme?: string }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, theme === 'dark' && { color: '#9CA3AF' }]}>{label}</Text>
    <Text style={[styles.detailValue, theme === 'dark' && { color: '#FFFFFF' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  imageCardContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  aboutSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 22,
  },
  infoSection: {
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
