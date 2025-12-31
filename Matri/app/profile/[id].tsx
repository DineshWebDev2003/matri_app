import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator, FlatList, Modal, PanResponder, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import FallbackImage from '../../components/FallbackImage';
import UniversalHeader from '../../components/UniversalHeader';
import { getImageUrl, getGalleryImageUrl } from '../../utils/imageUtils';

const { width: screenWidth } = Dimensions.get('window');

const DetailRow = ({ label, value, theme }: { label: string; value: string; theme?: string }) => {
  // Show all fields including N/A
  return (
    <View style={[styles.detailRow, theme === 'dark' && { backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 6, marginVertical: 2, borderRadius: 6 }]}>
      <Text style={[styles.detailLabel, theme === 'dark' && { color: '#9CA3AF' }]}>{label}</Text>
      <Text style={[styles.detailValue, theme === 'dark' && { color: value === 'N/A' ? '#6B7280' : (theme === 'dark' ? '#FFFFFF' : '#1F2937') }]}>{value}</Text>
    </View>
  );
};

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const auth = useAuth();
  const updateLimitation = auth?.updateLimitation;
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preferences' | 'photos'>('details');
  const [fullScreenPhoto, setFullScreenPhoto] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  // Remaining contact-view credits from limitation data
  const [remainingCredits, setRemainingCredits] = useState<number>(() => {
    const lim = auth?.limitation?.contact_view_limit;
    if (lim === -1) return Infinity; // unlimited
    return lim ?? 0;
  });
  // keep credits up-to-date whenever popup shown or auth.user updates
  useEffect(() => {
    const fetchCredits = async () => {
      if (!showCreditPopup) return;
      try {
        // get latest limitation counts from dashboard
        const dash = await apiService.getDashboard();
        const lim = dash?.data?.limitation || auth?.limitation;
        const current = lim?.contact_view_limit;
        if (current !== undefined) {
          setRemainingCredits(current === -1 ? Infinity : current);
        }
      } catch (e) {
        // fallback to existing value
      }
    };
    fetchCredits();
  }, [showCreditPopup]);
  const [contactDetailsUnlocked, setContactDetailsUnlocked] = useState(false);

  // Persist contact unlock status per profile
  useEffect(() => {
    if (!profile?.id) return;
    const key = `contact_unlocked_${profile.id}`;
    AsyncStorage.getItem(key).then((val) => {
      if (val === 'true') setContactDetailsUnlocked(true);
    });
  }, [profile?.id]);
  const [isInIgnoredList, setIsInIgnoredList] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showInterestAnimation, setShowInterestAnimation] = useState(false);
  const slideUpAnim = useState(new Animated.Value(500))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    family: true,
    education: true,
    career: true,
    contact: false,
  });

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching profile for ID:', id);
      const response = await apiService.getProfile(id as string);
      
      console.log('📥 Profile API Response:', response);
      
      if (response.status === 'success') {
        // API returns data in response.data.profile (from transformMemberToProfile)
        const memberData = response.data?.profile || response.data?.member || response.data;
        console.log('📊 Member Data:', memberData);
        
        // Log full JSON for debugging
        console.log('📋 ===== FULL PROFILE JSON =====');
        console.log(JSON.stringify(memberData, null, 2));
        console.log('📋 ===== END PROFILE JSON =====');
        
        const processedProfile = {
          id: memberData.id,
          name: `${memberData.firstname || ''} ${memberData.lastname || ''}`.trim(),
          age: memberData.age || 'N/A',
          location: memberData.location || memberData.city || 'N/A',
          profession: memberData.profession || memberData.job || 'N/A',
          education: memberData.education || 'N/A',
          religion: memberData.religion || 'N/A',
          caste: memberData.caste || 'N/A',
          height: memberData.height || memberData.physical_attributes?.height || 'N/A',
          weight: memberData.weight || memberData.physical_attributes?.weight || 'N/A',
          mobile: memberData.mobile || 'N/A',
          email: memberData.email || 'N/A',
          is_premium: (memberData.package_id && memberData.package_id !== 4) || false,
          packageId: memberData.package_id || 4,
          image: memberData.image ? (memberData.image.startsWith('http') ? memberData.image : `https://90skalyanam.com/assets/images/user/profile/${memberData.image}`) : null,
          bloodGroup: memberData.bloodGroup || 'N/A',
          maritalStatus: memberData.maritalStatus || 'N/A',
          birthPlace: memberData.birthPlace || 'N/A',
          lookingFor: memberData.lookingFor || 'N/A',
          ageRange: (memberData.partnerAgeMin && memberData.partnerAgeMax) ? `${memberData.partnerAgeMin}-${memberData.partnerAgeMax}` : (memberData.ageRange || 'N/A'),
          heightRange: (memberData.partnerHeightMin && memberData.partnerHeightMax) ? `${memberData.partnerHeightMin}-${memberData.partnerHeightMax}` : (memberData.heightRange || 'N/A'),
          preferredReligion: memberData.preferredReligion || 'N/A',
          preferredCaste: memberData.preferredCaste || 'N/A',
          preferredEducation: memberData.preferredEducation || 'N/A',
          preferredProfession: memberData.preferredProfession || 'N/A',
          preferredLocation: memberData.preferredLocation || 'N/A',
          preferredMaritalStatus: memberData.preferredMaritalStatus || 'N/A',
          gender: memberData.gender || (memberData.genderIdentity) || null,
          galleries: (memberData.galleries && memberData.galleries.length>0) ? memberData.galleries : (Array.isArray(memberData.images) ? memberData.images.map((url:string)=>({ image: url })) : []),
          complexion: memberData.complexion || memberData.faceColour || 'N/A',
          faceColour: memberData.faceColour || memberData.faceColor || memberData.complexion || 'N/A',
          eyeColor: memberData.eye_color || memberData.eyeColor || 'N/A',
          hairColor: memberData.hair_color || memberData.hairColor || 'N/A',
          disability: memberData.disability || 'N/A',
          languages: Array.isArray(memberData.language) ? memberData.language.join(', ') : (memberData.languages || 'N/A'),
          presentAddress: memberData.present_address || memberData.presentAddress || 'N/A',
          permanentAddress: memberData.permanent_address || memberData.permanentAddress || 'N/A',
          fatherName: (memberData.family?.father_name || memberData.fatherName || 'N/A'),
          fatherProfession: (memberData.family?.father_profession || memberData.family?.father_occupation || memberData.fatherProfession || 'N/A'),
          fatherContact: (memberData.family?.father_contact || memberData.fatherContact || 'N/A'),
          motherName: (memberData.family?.mother_name || memberData.motherName || 'N/A'),
          motherProfession: (memberData.family?.mother_profession || memberData.family?.mother_occupation || memberData.motherProfession || 'N/A'),
          motherContact: (memberData.family?.mother_contact || memberData.motherContact || 'N/A'),
          numberOfBrothers: (memberData.family?.number_of_brothers || memberData.family?.brothers || memberData.numberOfBrothers || memberData.brothers || 'N/A'),
          numberOfSisters: (memberData.family?.number_of_sisters || memberData.family?.sisters || memberData.numberOfSisters || memberData.sisters || 'N/A'),
          careerStartYear: (memberData.careers?.[0]?.start || memberData.careerStartYear || 'N/A'),
          careerEndYear: (memberData.careers?.[0]?.end || memberData.careerEndYear || 'N/A'),
          degree: (memberData.educations?.[0]?.degree || memberData.degree || 'N/A'),
          fieldOfStudy: (memberData.educations?.[0]?.field_of_study || memberData.fieldOfStudy || 'N/A'),
          institute: (memberData.educations?.[0]?.institute || memberData.institute || 'N/A'),
          educationStartYear: (memberData.educations?.[0]?.start || memberData.educationStartYear || 'N/A'),
          educationEndYear: (memberData.educations?.[0]?.end || memberData.educationEndYear || 'N/A'),
        };
        
        console.log('✅ Processed Profile:', processedProfile);
        setProfile(processedProfile);

        // Check if already hearted
        try {
          const hRes = await apiService.getHeartedProfiles();
          if (hRes.status === 'success') {
            const idsArr = (hRes.data?.profiles || hRes.data || []).map((p: any) => p.id?.toString());
            setIsInterested(idsArr.includes(memberData.id?.toString()));
          }
        } catch(e) { /* ignore */ }
      } else {
        console.error('❌ API returned error status:', response.status);
        const alertMsg = typeof response.message === 'string' ? response.message : JSON.stringify(response.message);
        Alert.alert('Error', alertMsg || 'Failed to load profile');
      }
    } catch (error: any) {
      console.error('💥 Error fetching profile:', error);
      console.error('Error message:', error.message);
      Alert.alert('Error', error.message || 'Failed to load profile');
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
    
    // Use full image URL from API (already includes full URL)
    const chatImageUrl = profile?.image || 'https://via.placeholder.com/40';
    
    console.log('💬 Opening chat with profile:', {
      id: profile?.id,
      name: profile?.name,
      rawImage: profile?.image,
      chatImageUrl: chatImageUrl
    });
    
    router.push({
      pathname: '/chat/[id]',
      params: {
        userId: profile?.id?.toString(),
        id: profile?.id?.toString(),
        name: profile?.name || 'User',
        image: chatImageUrl
      }
    });
  };

  // Unlock contact – calls backend and refreshes user credits
  const handleViewContact = async () => {
    console.log('🔓 Attempting to unlock contact for profile:', profile?.id);
    console.log('🔢 Credits before unlock:', remainingCredits===Infinity ? 'Unlimited' : remainingCredits);
    try {
      const resp = await apiService.viewContact(profile?.id?.toString());
      console.log('📡 viewContact API response:', resp);
      if (resp?.status === 'success' && (resp?.data?.mobile || resp?.data?.contact || resp?.data?.remaining_credits !== undefined || resp?.data?.remaining_contact_view !== undefined)) {
        setContactDetailsUnlocked(true);
        await AsyncStorage.setItem(`contact_unlocked_${profile?.id}`, 'true');
        // Set credits from backend if provided, otherwise fallback to local decrement
        const newCredits = resp?.data?.remaining_credits ?? resp?.data?.remaining_contact_view ?? resp?.data?.contact_view_limit;
        if (newCredits !== undefined) {
          setRemainingCredits(newCredits === -1 ? Infinity : newCredits);
          if (updateLimitation) {
            const updatedLim = { ...(auth?.limitation || {}), contact_view_limit: newCredits };
            updateLimitation(updatedLim);
          }
        } else {
          // fallback: subtract 1
          const fallbackNew = (prev: number) => (prev === Infinity ? prev : Math.max(0, prev - 1));
          setRemainingCredits(fallbackNew);
          if (updateLimitation) {
            const updatedLim = { ...(auth?.limitation || {}), contact_view_limit: fallbackNew(remainingCredits) };
            updateLimitation(updatedLim);
          }
        }
        // refresh limitation quietly
        // Optionally refresh limitation from dashboard in background
        apiService.getDashboard().then((dash) => {
          const lim = dash?.data?.limitation;
          if (lim?.contact_view_limit !== undefined) {
            setRemainingCredits(lim.contact_view_limit === -1 ? Infinity : lim.contact_view_limit);
          }
        }).catch((err) => console.warn('⚠️ Failed to refresh dashboard after unlock:', err));
      } else {
        // failure: keep locked and clear stored flag
        setContactDetailsUnlocked(false);
        await AsyncStorage.removeItem(`contact_unlocked_${profile?.id}`);
        Alert.alert('Error', resp?.message || 'Failed to unlock contact');
        return;
      }
    } catch (error: any) {
      console.error('❌ viewContact error:', error);
      Alert.alert('Error', error.message || 'Failed to unlock contact');
    } finally {
      setShowCreditPopup(false);
    }
  };

  const handleInterest = async () => {
    if (auth?.isGuest) {
      Alert.alert('Login Required', 'Please login to send interest', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    try {
      if (isInterested) {
        Alert.alert('Already Expressed', 'You have already sent a heart to this profile.');
        return;
      }
      // Sending interest - call API
      const response = await apiService.expressHeart(profile?.id);
      if (response.status === 'success') {
        setIsInterested(true);
        // Show animation
        setShowInterestAnimation(true);
        Animated.parallel([
          Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowInterestAnimation(true);
          Animated.parallel([
            Animated.timing(slideUpAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(slideUpAnim, {
                toValue: 500,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]).start(() => setShowInterestAnimation(false));
          }, 3000);
        }, 3000);
      } else {
        Alert.alert('Error', 'Failed to send interest. Please try again.');
      }
    } catch (error) {
      console.error('Error sending interest:', error);
      Alert.alert('Error', 'Failed to send interest. Please try again.');
    }
  };

  const handleIgnore = () => {
    Alert.alert(
      'Ignore Member',
      'Are you sure you want to ignore this member?',
      [
        { text: 'Cancel' },
        { 
          text: 'Ignore', 
          onPress: () => {
            setIsBlocked(true);
            Alert.alert('Success', 'Member blocked successfully');
            setTimeout(() => router.back(), 1500);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CollapsibleSection = ({ 
    title, 
    icon, 
    section, 
    children 
  }: { 
    title: string; 
    icon: string; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode 
  }) => (
    <View style={[styles.collapsibleSection, theme === 'dark' && { borderColor: '#3A3A3A', backgroundColor: '#2A2A2A' }]}>
      <TouchableOpacity 
        style={[styles.sectionHeader, theme === 'dark' && { backgroundColor: '#1A1A1A', borderBottomColor: '#3A3A3A' }]}
        onPress={() => toggleSection(section)}
      >
        <View style={styles.sectionHeaderLeft}>
          <Feather name={icon as any} size={20} color="#DC2626" />
          <Text style={[styles.sectionHeaderTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
            {title}
          </Text>
        </View>
        <Feather 
          name={expandedSections[section] ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
        />
      </TouchableOpacity>
      
      {expandedSections[section] && (
        <View style={[styles.sectionContent, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
          {children}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
        <ActivityIndicator size="large" color="#DC2626" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // Use image directly from API (already includes full URL from formatProfileResponse)
    const profileImagePrimary = profile?.image || 'https://via.placeholder.com/400x600';
  const genderLower = (profile?.gender || profile?.looking_for_gender || '').toLowerCase();
  const profileImageFallback = genderLower === 'female'
    ? require('../../assets/images/default-female.jpg')
    : require('../../assets/images/default-male.jpg');
  console.log('👤 Profile Detail Screen - Main Image:', {
    profileId: profile?.id,
    profileName: profile?.name,
    rawImage: profile?.image,
    primaryUrl: profileImagePrimary,
    fallbackUrl: profileImageFallback,
    hasImage: !!profile?.image,
  });
  const age = profile?.age || 'N/A';
  const location = profile?.location || 'Location N/A';
  const name = profile?.name || 'User';

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    cardBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#FFFFFF' },
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Universal Header - Prevents overlap */}
      <UniversalHeader 
        title="Profile"
        showProfileImage={false}
        leftIcon="back"
        onLeftIconPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollContent, themeStyles.container]}>
        {/* Main Profile Card */}
        <View style={[styles.mainCard, themeStyles.cardBg]}>
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
              
              {/* Black Overlay for Blocked Users */}
              {isBlocked && (
                <View style={styles.blockedOverlay}>
                  <Text style={styles.blockedText}>User Blocked</Text>
                </View>
              )}
              
              {/* Profile Info Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                style={styles.infoOverlay}
              >
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{name}</Text>
                  <Text style={styles.profileDetails}>Age: {age}  • {location}</Text>
                </View>
              </LinearGradient>

              {/* Premium Badge */}
              {(profile?.packageId && profile.packageId !== 4) && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Action Buttons - Bottom of Card */}
          <View style={[styles.cardActionButtons, theme === 'dark' && styles.cardActionButtonsDark]}>
            {/* Chat Button - X Icon - Small */}
            <TouchableOpacity 
              style={[styles.cardActionButton, styles.cardActionButtonSmall, theme === 'dark' ? styles.chatButtonDark : styles.chatButton]}
              onPress={handleChat}
            >
              <Feather name="message-circle" size={22} color="white" />
            </TouchableOpacity>

            {/* Heart Button - Interest - Large Center */}
            <TouchableOpacity 
              style={[
                styles.cardActionButton, 
                styles.cardActionButtonLarge,
                theme === 'dark' ? styles.interestCardButtonDark : styles.interestCardButton,
                isInterested && (theme === 'dark' ? styles.interestCardButtonActiveDark : styles.interestCardButtonActive)
              ]}
              onPress={handleInterest}
              disabled={isBlocked}
            >
              <Feather 
                name="heart" 
                size={36} 
                color={isInterested ? '#DC2626' : '#FFC5C5'}
                fill={isInterested ? '#DC2626' : 'none'}
              />
            </TouchableOpacity>

            {/* Ignore Button - X Icon - Small */}
            <TouchableOpacity 
              style={[styles.cardActionButton, styles.cardActionButtonSmall, theme === 'dark' ? styles.ignoreButtonDark : styles.ignoreButton, isBlocked && (theme === 'dark' ? styles.ignoreButtonActiveDark : styles.ignoreButtonActive)]}
              onPress={handleIgnore}
              disabled={isBlocked}
            >
              <Feather name="x-circle" size={22} color={isBlocked ? '#6B7280' : 'white'} />
            </TouchableOpacity>
          </View>

          {/* Tabs Section */}
          <View style={[styles.tabsContainer, themeStyles.container]}>
          {/* Tab Buttons */}
          <View style={styles.tabButtons}>
            {['details', 'preferences', 'photos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab as any)}
              >
                {/* Icon centered at top */}
                <View style={styles.tabIconContainer}>
                  <Feather 
                    name={tab === 'details' ? 'info' : tab === 'preferences' ? 'heart' : 'image'} 
                    size={24} 
                    color={activeTab === tab ? '#DC2626' : '#9CA3AF'}
                  />
                </View>
                {/* Text below icon */}
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab === 'details' ? 'Details' : tab === 'preferences' ? 'Preferences' : 'Photos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={[styles.tabContent, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <ScrollView showsVerticalScrollIndicator={false} style={[theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
                {/* Basic Information Section */}
                <CollapsibleSection title="Basic Information" icon="user" section="basic">
                  {profile?.age && (
                    <DetailRow label="Age" value={`${profile.age} years`} theme={theme} />
                  )}
                  {profile?.religion && (
                    <DetailRow label="Religion" value={profile.religion} theme={theme} />
                  )}
                  {profile?.caste && (
                    <DetailRow label="Caste" value={profile.caste} theme={theme} />
                  )}
                  {profile?.maritalStatus && (
                    <DetailRow label="Marital Status" value={profile.maritalStatus} theme={theme} />
                  )}
                  {profile?.height && (
                    <DetailRow label="Height" value={profile.height} theme={theme} />
                  )}
                  {profile?.weight && (
                    <DetailRow label="Weight" value={profile.weight} theme={theme} />
                  )}
                  {profile?.bloodGroup && (
                    <DetailRow label="Blood Group" value={profile.bloodGroup} theme={theme} />
                  )}
                                    {profile?.eyeColor && (
                    <DetailRow label="Eye Color" value={profile.eyeColor} theme={theme} />
                  )}
                  {profile?.hairColor && (
                    <DetailRow label="Hair Color" value={profile.hairColor} theme={theme} />
                  )}
                  {profile?.faceColour && (
                    <DetailRow label="Face Colour" value={profile.faceColour} theme={theme} />
                  )}
                  {profile?.disability && (
                    <DetailRow label="Disability" value={profile.disability} theme={theme} />
                  )}
                  {profile?.languages && (
                    <DetailRow label="Languages" value={profile.languages} theme={theme} />
                  )}
                  {profile?.location && (
                    <DetailRow label="Location" value={profile.location} theme={theme} />
                  )}
                  {profile?.presentAddress && (
                    <DetailRow label="Present Address" value={profile.presentAddress} theme={theme} />
                  )}
                  {profile?.permanentAddress && (
                    <DetailRow label="Permanent Address" value={profile.permanentAddress} theme={theme} />
                  )}
                </CollapsibleSection>

                {/* Education Section */}
                <CollapsibleSection title="Education" icon="book" section="education">
                  <DetailRow label="Education" value={profile?.education || 'N/A'} theme={theme} />
                  <DetailRow label="Degree" value={profile?.degree || 'N/A'} theme={theme} />
                  <DetailRow label="Field of Study" value={profile?.fieldOfStudy || 'N/A'} theme={theme} />
                  <DetailRow label="Institute" value={profile?.institute || 'N/A'} theme={theme} />
                  <DetailRow label="Education Start Year" value={profile?.educationStartYear || 'N/A'} theme={theme} />
                  <DetailRow label="Education End Year" value={profile?.educationEndYear || 'N/A'} theme={theme} />
                </CollapsibleSection>

                {/* Career Section */}
                <CollapsibleSection title="Career" icon="briefcase" section="career">
                  <DetailRow label="Profession" value={profile?.profession || 'N/A'} theme={theme} />
                  <DetailRow label="Company" value={profile?.company || 'N/A'} theme={theme} />
                  <DetailRow label="Designation" value={profile?.designation || 'N/A'} theme={theme} />
                  <DetailRow label="Career Start Year" value={profile?.careerStartYear || 'N/A'} theme={theme} />
                  <DetailRow label="Career End Year" value={profile?.careerEndYear || 'N/A'} theme={theme} />
                </CollapsibleSection>

                {/* Family Section */}
                <CollapsibleSection title="Family" icon="home" section="family">
                  <DetailRow label="Father's Name" value={profile?.fatherName || 'N/A'} theme={theme} />
                  <DetailRow label="Father's Profession" value={profile?.fatherProfession || 'N/A'} theme={theme} />
                  <DetailRow label="Father's Contact" value={profile?.fatherContact || 'N/A'} theme={theme} />
                  <DetailRow label="Mother's Name" value={profile?.motherName || 'N/A'} theme={theme} />
                  <DetailRow label="Mother's Profession" value={profile?.motherProfession || 'N/A'} theme={theme} />
                  <DetailRow label="Mother's Contact" value={profile?.motherContact || 'N/A'} theme={theme} />
                  <DetailRow label="Number of Brothers" value={profile?.numberOfBrothers || 'N/A'} theme={theme} />
                  <DetailRow label="Number of Sisters" value={profile?.numberOfSisters || 'N/A'} theme={theme} />
                </CollapsibleSection>
                
                {/* Contact Information - Locked Initially */}
                <TouchableOpacity 
                  style={[styles.contactSection, themeStyles.cardBg]}
                  onPress={() => {
                    if (!contactDetailsUnlocked) {
                      // Show attractive credit popup
                      setShowCreditPopup(true);
                    }
                  }}
                >
                  <View style={styles.contactHeader}>
                    <Text style={[styles.contactTitle, theme === 'dark' && { color: '#FFFFFF' }]}>📞 Contact Info</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {contactDetailsUnlocked && (
                        <Text style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>Already opened</Text>
                      )}
                      <Feather 
                        name={contactDetailsUnlocked ? 'unlock' : 'lock'} 
                        size={16} 
                        color={contactDetailsUnlocked ? '#10B981' : '#DC2626'} 
                      />
                    </View>
                  </View>
                  
                  {contactDetailsUnlocked ? (
                    <>
                      <View style={styles.contactRow}>
                        <Feather name="phone" size={18} color="#3B82F6" />
                        <Text style={[styles.contactValue, theme === 'dark' && { color: '#E5E7EB' }]}>
                          {profile?.mobile || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.contactRow}>
                        <Feather name="mail" size={18} color="#3B82F6" />
                        <Text style={[styles.contactValue, theme === 'dark' && { color: '#E5E7EB' }]}>
                          {profile?.email || 'N/A'}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={[styles.lockedText, theme === 'dark' && { color: '#9CA3AF' }]}>
                      🔒 Tap to view contact details
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Credit Popup Modal */}
                {showCreditPopup && (
                  <Modal
                    visible={showCreditPopup}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowCreditPopup(false)}
                  >
                    <View style={styles.creditPopupOverlay}>
                      <View style={[styles.creditPopupContainer, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                        {/* Header */}
                        <View style={styles.creditPopupHeader}>
                          <Feather name="star" size={32} color="#FCD34D" />
                          <Text style={[styles.creditPopupTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
                            View Contact Details
                          </Text>
                        </View>

                        {/* Credit Info */}
                        <View style={styles.creditInfoBox}>
                          <View style={styles.creditItem}>
                            <Text style={styles.creditLabel}>Your Credits</Text>
                            <Text style={styles.creditValue}>{remainingCredits===Infinity ? 'Unlimited' : remainingCredits}</Text>
                          </View>
                          <Feather name="arrow-right" size={24} color="#DC2626" />
                          <View style={styles.creditItem}>
                            <Text style={styles.creditLabel}>After View</Text>
                            <Text style={styles.creditValue}>{remainingCredits===Infinity ? 'Unlimited' : Math.max(0, remainingCredits - 1)}</Text>
                          </View>
                        </View>

                        {/* Cost Info */}
                        <View style={[styles.costBox, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
                          <Feather name="info" size={20} color="#3B82F6" />
                          <Text style={[styles.costText, theme === 'dark' && { color: '#E5E7EB' }]}>
                            Viewing this contact costs <Text style={{ fontWeight: '700', color: '#DC2626' }}>1 credit</Text>
                          </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.creditPopupButtons}>
                          <TouchableOpacity 
                            style={[styles.creditButton, styles.cancelButton, theme === 'dark' && { backgroundColor: '#3A3A3A' }]}
                            onPress={() => setShowCreditPopup(false)}
                          >
                            <Text style={[styles.buttonText, { color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.creditButton, styles.viewButton]}
                            onPress={handleViewContact}
                          >
                            <Feather name="unlock" size={18} color="white" />
                            <Text style={[styles.buttonText, { color: 'white', marginLeft: 8 }]}>View Contact</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
              </ScrollView>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <ScrollView showsVerticalScrollIndicator={false} style={[theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
                {/* Partner Preferences Section - Only Important Fields */}
                <View style={[styles.collapsibleSection, theme === 'dark' && { borderColor: '#3A3A3A', backgroundColor: '#2A2A2A' }]}>
                  <View style={[styles.sectionHeader, theme === 'dark' && { backgroundColor: '#1A1A1A', borderBottomColor: '#3A3A3A' }]}>
                    <View style={styles.sectionHeaderLeft}>
                      <Feather name="heart" size={20} color="#DC2626" />
                      <Text style={[styles.sectionHeaderTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
                        Partner Preferences
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.sectionContent, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                    <DetailRow label="Religion" value={profile?.preferredReligion || 'N/A'} theme={theme} />
                    <DetailRow label="Caste" value={profile?.preferredCaste || 'N/A'} theme={theme} />
                    <DetailRow label="Marital Status" value={profile?.preferredMaritalStatus || 'N/A'} theme={theme} />
                    <DetailRow label="Age Range" value={profile?.ageRange || 'N/A'} theme={theme} />
                    <DetailRow label="Height Range" value={profile?.heightRange || 'N/A'} theme={theme} />
                    <DetailRow label="Education" value={profile?.preferredEducation || 'N/A'} theme={theme} />
                    <DetailRow label="Profession" value={profile?.preferredProfession || 'N/A'} theme={theme} />
                    <DetailRow label="Smoking Habits" value={profile?.preferredSmokingHabits || 'N/A'} theme={theme} />
                    <DetailRow label="Drinking Status" value={profile?.preferredDrinkingStatus || 'N/A'} theme={theme} />
                    <DetailRow label="General Requirement" value={profile?.generalRequirement || 'N/A'} theme={theme} />
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <View style={styles.photosGrid}>
                {profile?.galleries && profile.galleries.length > 0 ? (
                  <FlatList
                    data={profile.galleries}
                    numColumns={3}
                    renderItem={({ item, index }) => {
                      const galleryImageUrls = getGalleryImageUrl(item.image);
                      console.log(`🖼️ Profile Gallery Image ${index + 1}:`, {
                        profileId: profile?.id,
                        galleryIndex: index,
                        rawImage: item.image,
                        primaryUrl: galleryImageUrls.primary,
                        fallbackUrl: galleryImageUrls.fallback,
                        hasImage: !!galleryImageUrls.primary,
                      });
                      return (
                        <TouchableOpacity
                          style={styles.photoGridItem}
                          onPress={() => {
                            setFullScreenPhoto(profile.galleries);
                            setPhotoIndex(index);
                          }}
                        >
                          {galleryImageUrls.primary ? (
                            <FallbackImage
                              source={{ uri: galleryImageUrls.primary }}
                              fallbackSource={galleryImageUrls.fallback ? { uri: galleryImageUrls.fallback } : undefined}
                              style={styles.photoGridImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.photoGridImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                              <Feather name="image" size={24} color="#9CA3AF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    keyExtractor={(item, index) => `photo-${index}`}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={[styles.noPhotosText, theme === 'dark' && { color: '#9CA3AF' }]}>
                    No photos uploaded yet
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Full Screen Photo Viewer Modal */}
      {fullScreenPhoto && (
        <Modal
          visible={!!fullScreenPhoto}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFullScreenPhoto(null)}
        >
          <SafeAreaView style={styles.fullScreenPhotoContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closePhotoButton}
              onPress={() => setFullScreenPhoto(null)}
            >
              <Feather name="x" size={28} color="white" />
            </TouchableOpacity>

            {/* Photo Counter */}
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {photoIndex + 1} / {fullScreenPhoto.length}
              </Text>
            </View>

            {/* Main Photo */}
            <View style={styles.fullScreenPhotoContent}>
              <Image
                source={{ uri: fullScreenPhoto[photoIndex]?.image }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </View>

            {/* Navigation Buttons */}
            <View style={styles.photoNavigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setPhotoIndex(photoIndex > 0 ? photoIndex - 1 : fullScreenPhoto.length - 1)}
              >
                <Feather name="chevron-left" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setPhotoIndex(photoIndex < fullScreenPhoto.length - 1 ? photoIndex + 1 : 0)}
              >
                <Feather name="chevron-right" size={32} color="white" />
              </TouchableOpacity>
            </View>

            {/* Thumbnail Strip */}
            <View style={styles.thumbnailStrip}>
              <FlatList
                data={fullScreenPhoto}
                horizontal
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.thumbnail,
                      photoIndex === index && styles.thumbnailActive
                    ]}
                    onPress={() => setPhotoIndex(index)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => `thumb-${index}`}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* Interest Animation Container */}
      {showInterestAnimation && (
        <Animated.View
          style={[
            styles.interestAnimationContainer,
            {
              transform: [{ translateY: slideUpAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.interestAnimationGradient}
          >
            <View style={styles.interestAnimationContent}>
              <Feather name="heart" size={28} color="white" fill="white" />
              <View style={styles.interestAnimationText}>
                <Text style={styles.interestAnimationTitle}>Interest Sent!</Text>
                <Text style={styles.interestAnimationSubtitle}>
                  {profile?.name} will see your interest
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  profileDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  blockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  blockedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    marginHorizontal: 10,
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
    color: '#DC2626',
    marginVertical: 12,
    marginHorizontal: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontWeight: '500',
    color: '#1F2937',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  blockButtonActive: {
    backgroundColor: '#1F2937',
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  // Main Card Styles
  mainCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Card Action Buttons Styles
  cardActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardActionButtonsDark: {
    backgroundColor: '#2A2A2A',
    borderTopColor: '#3A3A3A',
  },
  cardActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 26,
  },
  cardActionButtonSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  cardActionButtonLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  rejectButtonDark: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  interestCardButton: {
    backgroundColor: '#DC2626',
  },
  interestCardButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  interestCardButtonDark: {
    backgroundColor: '#DC2626',
  },
  interestCardButtonActiveDark: {
    backgroundColor: '#7F1D1D',
  },
  blockCardButton: {
    backgroundColor: '#9CA3AF',
  },
  blockCardButtonActive: {
    backgroundColor: '#6B7280',
    opacity: 0.8,
  },
  chatButton: {
    backgroundColor: '#3B82F6',
  },
  chatButtonDark: {
    backgroundColor: '#1E40AF',
  },
  ignoreButton: {
    backgroundColor: '#EF4444',
  },
  ignoreButtonDark: {
    backgroundColor: '#DC2626',
  },
  ignoreButtonActive: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  ignoreButtonActiveDark: {
    backgroundColor: '#6B7280',
    opacity: 0.7,
  },
  // Tabs Styles
  tabsContainer: {
    marginHorizontal: 10,
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButtons: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#DC2626',
  },
  tabIconContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  tabContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 300,
  },
  // Contact Section Styles
  contactSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
  // Photos Grid Styles
  photosGrid: {
    paddingVertical: 8,
  },
  photoGridItem: {
    flex: 1,
    margin: 6,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  noPhotosText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 40,
  },
  // Full Screen Photo Viewer Styles
  fullScreenPhotoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  closePhotoButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCounter: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
  },
  photoCounterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullScreenPhotoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullScreenPhoto: {
    width: '100%',
    height: '100%',
  },
  photoNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailStrip: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#DC2626',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  // Collapsible Section Styles
  collapsibleSection: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  // Credit Popup Styles
  creditPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  creditPopupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  creditPopupHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  creditPopupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  creditInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
  },
  creditItem: {
    alignItems: 'center',
    flex: 1,
  },
  creditLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  creditValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#DC2626',
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  costText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  creditPopupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  creditButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  viewButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Interest Animation Styles
  interestAnimationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  interestAnimationGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  interestAnimationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  interestAnimationText: {
    flex: 1,
  },
  interestAnimationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  interestAnimationSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
