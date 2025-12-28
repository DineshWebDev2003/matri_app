import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Image, SafeAreaView, StatusBar, ScrollView, Modal, RefreshControl, Platform, ToastAndroid } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService, premiumUtils } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import { Animated } from 'react-native';
import HeartIcon from '../../components/HeartIcon';
import UniversalHeader from '../../components/UniversalHeader';
import WithSwipe from '../../components/WithSwipe';
import MenuModal from '../../components/MenuModal';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { debounce } from '../../utils/debounce'; // STEP 3: Import debounce

const { width: screenWidth } = Dimensions.get('window');

// Replace LinearGradient with a styled View for now
const MembershipTag = ({ color, children }: { color: string, children: React.ReactNode }) => (
  <View 
    style={[
      styles.membershipTag,
      { backgroundColor: color }
    ]}
  >
    {children}
  </View>
);

// Calculate age from date of birth
const calculateAge = (dateString: string) => {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Modern ProfileCard component - EXACT UI DESIGN
const ProfileCard = ({ item, onPress, onHeartPress, interestingProfiles, isHorizontal = false }: { 
  item: any, 
  onPress: () => void, 
  onHeartPress: (item: any) => void, 
  interestingProfiles: Set<string>,
  isHorizontal?: boolean 
}) => {
  // Safe access to profile properties
  const profileName = item?.name || `${item?.firstname || 'Unknown'} ${item?.lastname || ''}`.trim();
  const isInterested = interestingProfiles.has(item.id?.toString()) || item?.isInterested || false;
  const age = calculateAge(item?.dateOfBirth || item?.dob) || item?.age;
  // Backend returns 'location' field which contains city
  const location = item?.location || item?.city || item?.state || item?.district || item?.address || 'Location N/A';
  
  // Get gender and set default image
  const userGender = item?.gender?.toLowerCase();
  const defaultImage = userGender === 'female' 
    ? require('../../assets/images/default-female.jpg')
    : require('../../assets/images/default-male.jpg');
  
  // Get profile image from API if available
  // API returns full URLs from formatProfileResponse, use them directly
  let profileImage = null;
  
  if (item?.image) {
    // If image is already a full URL (from API), use it directly
    if (item.image.startsWith('http')) {
      profileImage = item.image;
    } else {
      // If it's just a filename, build the URL using env variable
      const cleanImageName = item.image.replace(/[}\])]$/g, '');
      const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
      profileImage = `${imageBaseUrl}/${cleanImageName}`;
    }
  }
  
  // Get package info
  const packageName = item?.packageName || item?.package_name || 'FREE MATCH';
  const packageId = item?.packageId || item?.package_id || 1;
  // Map package name to tag colours
  const getPackageTagColors = (id: number) => {
    switch(id){
      case 2: // PREMIUM MATCH
        return { bg: '#DDD6FE', text: '#6D28D9' };
      case 3: // ELITE / PLATINUM
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 1: // BASIC / GOLD-ish
        return { bg: '#FEF9C3', text: '#D97706' };
      default: // FREE or unknown
        return { bg: '#E5E7EB', text: '#374151' };
    }
  };
  
  // Get gradient colors based on package type
  const getGradientColors = () => {
    if (packageName.includes('PREMIUM') || packageName.includes('PRO')) {
      return ['#8B5CF6', '#DC2626']; // Purple to Red
    } else if (packageName.includes('GOLD')) {
      return ['#F59E0B', '#DC2626']; // Orange to Red
    } else if (packageName.includes('SILVER')) {
      return ['#9CA3AF', '#6B7280']; // Gray
    } else if (packageName.includes('PLATINUM')) {
      return ['#3B82F6', '#1E40AF']; // Blue
    }
    return ['#6366F1', '#4F46E5']; // Indigo - Default
  };
  
  const getCardBorderColor = () => {
    if (packageName.includes('PREMIUM') || packageName.includes('PRO')) {
      return '#8B5CF6'; // Purple
    } else if (packageName.includes('GOLD')) {
      return '#F59E0B'; // Orange
    } else if (packageName.includes('SILVER')) {
      return '#9CA3AF'; // Gray
    } else if (packageName.includes('PLATINUM')) {
      return '#3B82F6'; // Blue
    }
    return '#E5E7EB'; // Light gray - Default
  };
  
  const getCrownColor = () => {
    if (packageName.includes('PREMIUM') || packageName.includes('PRO')) {
      return '#8B5CF6'; // Purple
    } else if (packageName.includes('GOLD')) {
      return '#FFD700'; // Gold
    } else if (packageName.includes('SILVER')) {
      return '#C0C0C0'; // Silver
    } else if (packageName.includes('PLATINUM')) {
      return '#3B82F6'; // Blue
    }
    return '#6366F1'; // Indigo - Default
  };
  
  const getCrownBackgroundColor = () => {
    if (packageName.includes('PREMIUM') || packageName.includes('PRO')) {
      return 'rgba(139, 92, 246, 0.15)';
    } else if (packageName.includes('GOLD')) {
      return 'rgba(255, 215, 0, 0.15)';
    } else if (packageName.includes('SILVER')) {
      return 'rgba(156, 163, 175, 0.15)';
    } else if (packageName.includes('PLATINUM')) {
      return 'rgba(59, 130, 246, 0.15)';
    }
    return 'rgba(99, 102, 241, 0.15)';
  };
  
  const cardWidth = isHorizontal ? 200 : (screenWidth - 48) / 2;
  const cardStyle = isHorizontal ? styles.horizontalCard : styles.gridCard;
  const gradientColors = getGradientColors();
  const cardBorderColor = getCardBorderColor();
  
  return (
    <TouchableOpacity 
      style={[cardStyle, { width: cardWidth, borderColor: cardBorderColor }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {/* Profile Image - Use API URL or default image */}
        <Image 
          source={profileImage ? { uri: profileImage } : defaultImage}
          style={styles.profileImageGrid}
          resizeMode="cover"
          defaultSource={defaultImage}
        />
        
        {/* Package Tag */}
        <View style={[styles.packageTag, { backgroundColor: getPackageTagColors(packageId).bg }]}> 
          <Text style={[styles.packageTagText, { color: getPackageTagColors(packageId).text }]} numberOfLines={1}>{packageName}</Text>
        </View>
        
        {/* Gradient Overlay - Bottom Red */}
        <LinearGradient
          colors={['transparent', 'rgba(220,38,38,0.4)', 'rgba(220,38,38,0.8)']}
          style={styles.gradientOverlay}
        />
        
        {/* Profile Info - Bottom Left */}
        <View style={styles.profileInfoOverlay}>
          <View style={styles.nameAgeRow}>
            <Text style={styles.profileNameText} numberOfLines={1}>
              {profileName}
            </Text>
            <Text style={styles.profileAgeText}>,{age}</Text>
          </View>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.profileLocationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
        
        {/* Heart Icon - Bottom Right */}
        <TouchableOpacity 
          style={styles.heartIconExact} 
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onHeartPress(item);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather 
            name={isInterested ? 'heart' : 'heart'} 
            size={18} 
            color={isInterested ? '#DC2626' : '#FFC5C5'}
            fill={isInterested ? '#DC2626' : '#FFC5C5'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function ProfilesScreen() {
  const toastSlideAnim = useRef(new Animated.Value(500)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    Animated.parallel([
      Animated.timing(toastSlideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastSlideAnim, { toValue: 500, duration: 400, useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => setShowToast(false));
      }, 3000);
    });
  };
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initialTab } = params;
  const { theme } = useTheme();
  const auth = useAuth();
  const isGuest = auth?.isGuest || false;

  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState<any[]>([]);
  const [newMatchesProfiles, setNewMatchesProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interestingProfiles, setInterestingProfiles] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const filterIconTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Pagination state for each tab
  const [tabPages, setTabPages] = useState({
    all: 1,
    recommended: 1,
    'new matches': 1
  });
  const [tabHasMore, setTabHasMore] = useState({
    all: true,
    recommended: true,
    'new matches': true
  });
  const [filters, setFilters] = useState({
    memberId: '',
    minHeight: 140,
    maxHeight: 200,
    minAge: 18,
    maxAge: 60,
    religion: 'All',
    caste: '',
    location: '',
    gender: 'All'
  });

  const [religions, setReligions] = useState<string[]>(['All', 'Hindu', 'Muslim', 'Christian', 'Buddhist', 'Jain', 'Other']);
  const [castes, setCastes] = useState<string[]>([]);
  const [genderOptions] = useState<string[]>(['All', 'Male', 'Female', 'Other']);
  const [showCasteModal, setShowCasteModal] = useState(false);
  const [showReligionModal, setShowReligionModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Filter tabs - Only 3 tabs
  const filterTabs = ['All', 'Recommended', 'New Matches'];

  // STEP 3: Create debounced search function (500ms delay to prevent API overload)
  const debouncedSearch = React.useRef(
    debounce((query: string) => {
      if (query.trim()) {
        handleSearch();
      }
    }, 500)
  ).current;

  useEffect(() => {
    // For guest users, skip authenticated calls
    if (isGuest) {
      fetchAllProfilesForGuest();
      fetchReligionsAndCastes();
    } else {
      // Wait for auth to be fully loaded before fetching profiles
      if (auth?.isLoading) {
        console.log('⏳ Auth context still loading, waiting...');
        return;
      }
      
      // Check if we have a token
      if (!auth?.token) {
        console.log('❌ No auth token available');
        return;
      }
      
      // Fetch user info first to check profile_complete status
      const initializeProfiles = async () => {
        try {
          const userInfoResponse = await apiService.getUserInfo();
          console.log('👤 User Info:', userInfoResponse?.data?.user);
          console.log('✅ Profile Complete:', userInfoResponse?.data?.user?.profile_complete);
          setUserInfo(userInfoResponse?.data?.user);
        } catch (err) {
          console.error('❌ Error fetching user info:', err);
        }
        
        // Then fetch profiles
        fetchUserData();
        loadInterestedProfiles();
        fetchReligionsAndCastes();
      };
      
      initializeProfiles();
    }
    
    return () => {
      if (filterIconTimeoutRef.current) {
        clearTimeout(filterIconTimeoutRef.current);
      }
    };
  }, [initialTab, isGuest, auth?.isLoading, auth?.token]);

  const fetchAllProfilesForGuest = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles without authentication filters
      const allResponse = await apiService.getProfiles({
        type: 'all',
        limit: 1000,
        page: 1
      });
      
      
      // Handle both response formats (success and error)
      if (allResponse) {
        // Check for success status
        const isSuccess = allResponse.status === 'success' || allResponse.remark === 'members_list';
        
        // Get members from either data.members or data.profiles
        const members = allResponse.data?.members || allResponse.data?.profiles || [];
        
        if (isSuccess && members && members.length > 0) {
          
          // Set all profiles to all three sections for guest users
          setRecommendedProfiles(members.slice(0, 10));
          setNewMatchesProfiles(members.slice(0, 20));
          setAllProfiles(members);
          setPage(1);
          setHasMore(members.length >= 1000);
        } else {
          
          // Show error toast
          triggerToast('No Profiles Found');
          
          setRecommendedProfiles([]);
          setNewMatchesProfiles([]);
          setAllProfiles([]);
        }
      } else {
        // Show error toast
        triggerToast('Connection Error');
        
        setRecommendedProfiles([]);
        setNewMatchesProfiles([]);
        setAllProfiles([]);
      }
    } catch (error: any) {
      
      // Show error toast
      triggerToast('Connection Error');
      
      setRecommendedProfiles([]);
      setNewMatchesProfiles([]);
      setAllProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInterestedProfiles = async () => {
    try {
      const response = await apiService.getHeartedProfiles();
      if (response.status === 'success' && response.data?.profiles) {
        const interestedIds = new Set(
          response.data.profiles?.map((p: any) => p.id?.toString()).filter(Boolean) || []
        );
        setInterestingProfiles(interestedIds);
      }
    } catch (error) {
    }
  };

  const fetchReligionsAndCastes = async () => {
    try {
      // Fetch all profiles to get unique religions and castes
      const response = await apiService.getProfiles(1, 100);
      
      if (response.status === 'success' && response.data?.profiles) {
        const profiles = response.data.profiles;
        
        // Extract unique religions
        const uniqueReligions = new Set(['All']);
        profiles.forEach((profile: any) => {
          if (profile.religion) {
            uniqueReligions.add(profile.religion);
          }
        });
        setReligions(Array.from(uniqueReligions));
        
        // Extract all castes (will be filtered by religion when selected)
        const uniqueCastes = new Set();
        profiles.forEach((profile: any) => {
          if (profile.caste) {
            uniqueCastes.add(profile.caste);
          }
        });
        setCastes(Array.from(uniqueCastes));
        
      }
    } catch (error) {
    }
  };

  // Get castes filtered by selected religion
  const getCastesByReligion = () => {
    if (filters.religion === 'All' || !filters.religion) {
      return castes;
    }
    
    // Filter profiles by selected religion and get their castes
    try {
      const response = apiService.getProfiles(1, 100);
      // This would need to be async, so we'll use the castes array for now
      // In production, you'd want to cache this data
      return castes;
    } catch (error) {
      return castes;
    }
  };

  const handleProfilePress = (profileId: string) => {
    // Guest users cannot view profile details
    if (isGuest) {
      // Show toast
      triggerToast('Please login or register to view full profile details.');
      return;
    }
    router.push(`/profile/${profileId || '1'}`);
  };

  const handleHeartPress = async (profile: any) => {
    // Guest users cannot express interest
    if (isGuest) {
      // Show toast
      triggerToast('Please login or register to express interest in profiles.');
      return;
    }

    const profileId = profile.id?.toString();
    if (!profileId) return;

    try {
      const isCurrentlyInterested = interestingProfiles.has(profileId);
      
      if (isCurrentlyInterested) {
        // Already expressed - show info toast
        triggerToast('Already expressed');
        return;
      } else {
        // Express interest
        await apiService.expressHeart(profileId);
        // Notify user
        triggerToast('Heart sent successfully');
        setInterestingProfiles(prev => new Set(prev).add(profileId));
      }

      // Update the profile in the list
      setAllProfiles(prev => prev.map(p => 
        p.id?.toString() === profileId 
          ? { ...p, isInterested: !isCurrentlyInterested }
          : p
      ));

    } catch (error) {
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUserData();
      return;
    }
    
    try {
      setSearchLoading(true);
      
      // First, get current user info to determine their gender
      const userResponse = await apiService.getUserInfo();
      let currentUserGender = 'male'; // default
      
      if (userResponse && userResponse.status === 'success' && userResponse.data) {
        currentUserGender = userResponse.data.gender?.toLowerCase() || 'male';
      }
      
      // Parse search query to detect name, caste, age, or profile ID
      const query = searchQuery.toLowerCase().trim();
      let searchParams: any = { limit: 20 };
      
      // Check if it's a profile ID (starts with USR or is numeric)
      if (query.startsWith('usr') || /^\d+$/.test(query)) {
        searchParams.query = searchQuery;
      }
      // Check if it contains age pattern (number + years/yr/age)
      else if (/\d+\s*(years?|yrs?|age)/.test(query)) {
        const ageMatch = query.match(/(\d+)/);
        if (ageMatch) {
          searchParams.age = parseInt(ageMatch[1]);
          searchParams.minAge = parseInt(ageMatch[1]) - 2;
          searchParams.maxAge = parseInt(ageMatch[1]) + 2;
        }
      }
      // Check if it might be a caste (common caste names) - more flexible matching
      else if (/(brahmin|kshatriya|vaishya|shudra|reddy|naidu|chettiar|mudaliar|pillai|nair|menon|iyer|iyengar|gounder|thevar|vanniyar|yadav|jat|rajput|baniya|kayastha|bhumihar|kurmi|koeri|teli|mali|sonar|kumhar|chamar|dhobi|barber|washerman)/i.test(query)) {
        searchParams.caste = searchQuery;
      }
      // Otherwise treat as name search - be more flexible
      else {
        searchParams.name = searchQuery;
        // Also try with query parameter as fallback for broader search
        searchParams.query = searchQuery;
      }
      
      
      // Try multiple search approaches
      let searchResults: any[] = [];
      
      // First try the dedicated search endpoint
      try {
        const searchResponse = await apiService.searchMembers(searchParams);
        if (searchResponse && searchResponse.status === 'success' && searchResponse.data?.profiles) {
          searchResults = searchResponse.data.profiles;
        } else if (searchResponse && searchResponse.status === 'error') {
          // Don't show error alert here, just continue to fallback
        }
      } catch (searchError) {
      }
      
      // If no results from search endpoint, try getProfiles with search parameter
      if (searchResults.length === 0) {
        try {
          // Try with the search parameter in getProfiles
          const fallbackResponse = await apiService.getProfiles({
            type: 'all',
            limit: 50, // Get more profiles to filter through
            search: searchQuery // Use search parameter
          });
          
          if (fallbackResponse && fallbackResponse.status === 'success' && fallbackResponse.data?.profiles) {
            // Filter results based on search query
            const allProfiles = fallbackResponse.data.profiles;
            searchResults = allProfiles.filter((profile: any) => {
              const profileName = `${profile.firstname || ''} ${profile.lastname || ''}`.toLowerCase();
              const profileId = profile.profile_id || profile.id || '';
              const profileCaste = profile.caste || '';
              const profileAge = profile.age || '';
              const profileLocation = profile.location || profile.city || '';
              
              // More flexible matching - partial matches allowed
              return profileName.includes(query) || 
                     profileId.toString().toLowerCase().includes(query) ||
                     profileCaste.toLowerCase().includes(query) ||
                     profileAge.toString().includes(query) ||
                     profileLocation.toLowerCase().includes(query);
            });
          }
        } catch (fallbackError) {
          
          // Final fallback: get all profiles and filter client-side
          try {
            const broadResponse = await apiService.getProfiles({
              type: 'all',
              limit: 100 // Get even more profiles to search through
            });
            
            if (broadResponse && broadResponse.status === 'success' && broadResponse.data?.profiles) {
              const allProfiles = broadResponse.data.profiles;
              searchResults = allProfiles.filter((profile: any) => {
                const profileName = `${profile.firstname || ''} ${profile.lastname || ''}`.toLowerCase();
                const profileId = profile.profile_id || profile.id || '';
                const profileCaste = profile.caste || '';
                const profileAge = profile.age || '';
                const profileLocation = profile.location || profile.city || '';
                
                return profileName.includes(query) || 
                       profileId.toString().toLowerCase().includes(query) ||
                       profileCaste.toLowerCase().includes(query) ||
                       profileAge.toString().includes(query) ||
                       profileLocation.toLowerCase().includes(query);
              });
            }
          } catch (broadError) {
          }
        }
      }
      
      // Filter search results to show only opposite gender
      const oppositeGender = currentUserGender === 'male' ? 'female' : 'male';
      const filteredProfiles = searchResults.filter((profile: any) => {
        // Check gender from basicInfo or gender field
        const profileGender = (profile.basicInfo?.gender || profile.gender || 'male').toLowerCase();
        return profileGender === oppositeGender;
      });
      
      setAllProfiles(filteredProfiles);
      
      if (filteredProfiles.length === 0) {
        // Show a subtle message instead of alert - let the empty state handle it
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search profiles. Please try again.');
      setAllProfiles([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Fetch profiles from new members endpoint with gender and age
   */
  const fetchProfilesByType = async (type: 'all' | 'recommended' | 'newly_joined', pageNum: number = 1) => {
    try {
      console.log(`🔄 Fetching ${type} profiles (page ${pageNum})...`);
      
      // Get token directly from auth context
      const authToken = auth?.token;
      if (!authToken) {
        console.error('❌ No authentication token available. Auth token:', authToken);
        return { profiles: [], hasMore: false, total: 0, lastPage: 1 };
      }

      console.log(`🔑 Using token: ${authToken.substring(0, 20)}...`);

      // Build URL for new-members endpoint with type parameter
      const apiHost = process.env.EXPO_PUBLIC_API_HOST || '172.16.200.139';
      const apiPort = process.env.EXPO_PUBLIC_API_PORT || '8000';
      const apiBaseUrl = `http://${apiHost}:${apiPort}`;
      const url = `${apiBaseUrl}/api/new-members?type=${type}&page=${pageNum}&per_page=12`;
      
      console.log(`📡 Fetching from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log(`📡 Response status for ${type}:`, response.status);
      console.log(`📡 Response for ${type}:`, JSON.stringify(data, null, 2).substring(0, 500));

      if (data?.status === 'success' && data?.data?.profiles) {
        const profiles = data.data.profiles;
        const pagination = data.data.pagination || {
          has_more: false,
          total: profiles.length,
          last_page: 1,
          current_page: pageNum
        };
        
        console.log(`✅ ${type} profiles fetched:`, profiles.length, 'Total:', pagination.total, 'Has More:', pagination.has_more);
        if (profiles.length > 0) {
          console.log('📋 Sample profile:', JSON.stringify(profiles[0], null, 2).substring(0, 300));
        }
        
        return {
          profiles: profiles,
          hasMore: pagination.has_more || false,
          total: pagination.total || profiles.length,
          lastPage: pagination.last_page || 1
        };
      }
      
      console.log(`⚠️ No profiles found for ${type}. Response:`, data);
      return { profiles: [], hasMore: false, total: 0, lastPage: 1 };
    } catch (error) {
      console.error(`❌ Error fetching ${type} profiles:`, error);
      return { profiles: [], hasMore: false, total: 0, lastPage: 1 };
    }
  };

  /**
   * Initial load - fetch all three profile types
   */
  const fetchUserData = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('📊 Fetching profiles data...');
      console.log('👤 Current user:', userInfo?.id, 'Profile Complete:', userInfo?.profile_complete);
      console.log('🔑 Auth token available:', !!auth?.token, 'Auth loading:', auth?.isLoading);
      
      // Wait for auth to be fully loaded if still loading
      if (auth?.isLoading) {
        console.log('⏳ Waiting for auth context to load...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check if token is available now
      if (!auth?.token) {
        console.error('❌ Auth token still not available after wait');
        throw new Error('Authentication token not available');
      }
      
      // Load interested profiles first
      await loadInterestedProfiles();
      
      // Fetch all three types in parallel
      const [recommendedData, newlyJoinedData, allData] = await Promise.all([
        fetchProfilesByType('recommended', 1),
        fetchProfilesByType('newly_joined', 1),
        fetchProfilesByType('all', 1)
      ]);

      // Update state with fetched data
      console.log('📝 Setting recommended profiles:', recommendedData.profiles?.length || 0);
      console.log('📝 Setting newly joined profiles:', newlyJoinedData.profiles?.length || 0);
      console.log('📝 Setting all profiles:', allData.profiles?.length || 0);
      
      if (allData.profiles && allData.profiles.length > 0) {
        console.log('✅ First profile data:', JSON.stringify(allData.profiles[0], null, 2).substring(0, 300));
      }
      
      setRecommendedProfiles(recommendedData.profiles || []);
      setNewMatchesProfiles(newlyJoinedData.profiles || []);
      setAllProfiles(allData.profiles || []);
      
      // Update pagination state
      setTabPages({
        all: 1,
        recommended: 1,
        'new matches': 1
      });
      
      setTabHasMore({
        all: allData.hasMore || false,
        recommended: recommendedData.hasMore || false,
        'new matches': newlyJoinedData.hasMore || false
      });

      console.log('✅ All profiles loaded successfully');
      console.log('📊 Final state - All:', allData.profiles?.length, 'Recommended:', recommendedData.profiles?.length, 'New:', newlyJoinedData.profiles?.length);
    } catch (error) {
      console.error('💥 Error fetching profiles:', error);
      setRecommendedProfiles([]);
      setNewMatchesProfiles([]);
      setAllProfiles([]);
      
      if (retryCount === 0) {
        Alert.alert(
          'Connection Error',
          'Failed to load profiles. Check your internet connection and try again.',
          [
            {
              text: 'Retry',
              onPress: () => fetchUserData()
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pull to refresh handler
   */
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing profiles...');
      
      // Reset pagination
      setTabPages({
        all: 1,
        recommended: 1,
        'new matches': 1
      });
      
      // Reload interested profiles
      await loadInterestedProfiles();
      
      // Fetch fresh data
      const [recommendedData, newlyJoinedData, allData] = await Promise.all([
        fetchProfilesByType('recommended', 1),
        fetchProfilesByType('newly_joined', 1),
        fetchProfilesByType('all', 1)
      ]);

      setRecommendedProfiles(recommendedData.profiles);
      setNewMatchesProfiles(newlyJoinedData.profiles);
      setAllProfiles(allData.profiles);
      
      setTabHasMore({
        all: allData.hasMore,
        recommended: recommendedData.hasMore,
        'new matches': newlyJoinedData.hasMore
      });

      console.log('✅ Profiles refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing profiles:', error);
      Alert.alert('Refresh Error', 'Failed to refresh profiles. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };


  const handleTabPress = (tabName: string) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    
    // Check if it's a double tap (within 500ms and same tab)
    if (lastTappedTab === tabName && timeDiff < 500 && timeDiff > 100) {
      // Double tap on active tab detected - navigate to fullscreen
      console.log('🔄 Double tap detected on:', tabName);
      let routeType = 'all';
      if (tabName === 'Recommended') routeType = 'recommended';
      else if (tabName === 'Newly joined') routeType = 'newly_joined';
      
      // Only navigate if the route exists
      try {
        router.push(`/fullscreen-tab/${routeType}`);
      } catch (error) {
        console.log('⚠️ Fullscreen route not available');
      }
    } else {
      // Handle navigation if needed
      console.log('🎯 Navigation:', tabName);
    }
    
    setLastTapTime(currentTime);
    setLastTappedTab(tabName);
  };

  /**
   * Load more profiles for current tab
   */
  const loadMoreProfiles = async () => {
    if (loadingMore || !tabHasMore[activeTab as keyof typeof tabHasMore]) return;
    
    try {
      setLoadingMore(true);
      const currentPage = tabPages[activeTab as keyof typeof tabPages];
      const nextPage = currentPage + 1;
      
      console.log(`📄 Loading page ${nextPage} for ${activeTab}...`);
      
      // Fetch next page for current tab
      const data = await fetchProfilesByType(activeTab as 'all' | 'recommended' | 'newly_joined', nextPage);
      
      if (data.profiles.length > 0) {
        // Append new profiles to existing ones
        if (activeTab === 'all') {
          setAllProfiles(prev => [...prev, ...data.profiles]);
        } else if (activeTab === 'recommended') {
          setRecommendedProfiles(prev => [...prev, ...data.profiles]);
        } else if (activeTab === 'new matches') {
          setNewMatchesProfiles(prev => [...prev, ...data.profiles]);
        }
        
        // Update pagination state
        setTabPages(prev => ({
          ...prev,
          [activeTab]: nextPage
        }));
        
        setTabHasMore(prev => ({
          ...prev,
          [activeTab]: data.hasMore
        }));
        
        console.log(`✅ Added ${data.profiles.length} new profiles for ${activeTab}`);
      } else {
        console.log(`🔚 No more profiles available for ${activeTab}`);
        setTabHasMore(prev => ({
          ...prev,
          [activeTab]: false
        }));
      }
    } catch (error) {
      console.error('Error loading more profiles:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const applyFilters = async () => {
    try {
      setSearchLoading(true);
      console.log('🔍 Applying filters:', filters);
      
      // Get current user gender for filtering
      const userResponse = await apiService.getUserInfo();
      let currentUserGender = 'male';
      
      if (userResponse && userResponse.status === 'success' && userResponse.data) {
        currentUserGender = userResponse.data.gender?.toLowerCase() || 'male';
      }
      
      // Build search parameters from filters
      const searchParams: any = { limit: 50 }; // Higher limit for better filtering
      
      if (filters.memberId) {
        searchParams.query = filters.memberId;
      }
      if (filters.minAge || filters.maxAge) {
        if (filters.minAge) searchParams.minAge = parseInt(filters.minAge);
        if (filters.maxAge) searchParams.maxAge = parseInt(filters.maxAge);
      }
      if (filters.caste) {
        searchParams.caste = filters.caste;
      }
      if (filters.location) {
        searchParams.location = filters.location;
      }
      if (filters.gender && filters.gender !== 'All') {
        searchParams.gender = filters.gender;
      }
      
      let filteredProfiles: any[] = [];
      
      // Try dedicated search first
      try {
        const searchResponse = await apiService.searchMembers(searchParams);
        if (searchResponse && searchResponse.status === 'success' && searchResponse.data) {
          filteredProfiles = searchResponse.data.profiles || [];
          console.log(`✅ Dedicated search found ${filteredProfiles.length} profiles`);
        }
      } catch (searchError) {
        console.log('⚠️ Dedicated search failed, trying fallback:', searchError);
      }
      
      // If no results from dedicated search, try getProfiles with search
      if (filteredProfiles.length === 0) {
        try {
          const profileResponse = await apiService.getProfiles({
            search: filters.memberId || filters.caste || filters.location || '',
            limit: 50
          });
          
          if (profileResponse && profileResponse.status === 'success' && profileResponse.data) {
            filteredProfiles = profileResponse.data.profiles || [];
            console.log(`✅ Fallback search found ${filteredProfiles.length} profiles`);
          }
        } catch (fallbackError) {
          console.log('⚠️ Fallback search also failed:', fallbackError);
        }
      }
      
      // Apply client-side filtering for height if specified
      if (filteredProfiles.length > 0 && (filters.minHeight || filters.maxHeight)) {
        const minHeight = filters.minHeight ? parseInt(filters.minHeight) : 0;
        const maxHeight = filters.maxHeight ? parseInt(filters.maxHeight) : 999;
        
        filteredProfiles = filteredProfiles.filter((profile: any) => {
          const profileHeight = profile.height ? parseInt(profile.height.toString().replace(/[^0-9]/g, '')) : 0;
          return profileHeight >= minHeight && profileHeight <= maxHeight;
        });
        console.log(`📏 Height filtering applied, ${filteredProfiles.length} profiles remaining`);
      }
      
      // Apply religion filtering
      if (filters.religion !== 'All' && filteredProfiles.length > 0) {
        filteredProfiles = filteredProfiles.filter((profile: any) => {
          const profileReligion = profile.religion || profile.religious_preference || '';
          return profileReligion.toLowerCase().includes(filters.religion.toLowerCase());
        });
        console.log(`🛕 Religion filtering applied, ${filteredProfiles.length} profiles remaining`);
      }
      
      // Apply gender filtering (opposite gender)
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        // Check gender from basicInfo or gender field
        const profileGender = (profile.basicInfo?.gender || profile.gender || 'male').toLowerCase();
        return profileGender !== currentUserGender;
      });
      console.log(`👫 Gender filtering applied, ${filteredProfiles.length} profiles remaining`);
      
      // Process and set profiles
      const processedProfiles = filteredProfiles.map((profile: any) => ({
        ...profile,
        isInterested: interestingProfiles.has(profile.id?.toString())
      }));
      
      setAllProfiles(processedProfiles);
      console.log('🎯 Final filtered profiles count:', processedProfiles.length);
      
      if (processedProfiles.length === 0) {
        console.log('⚠️ No profiles found with current filters');
      }
      
    } catch (error) {
      console.error('💥 Error applying filters:', error);
      setAllProfiles([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      memberId: '',
      minHeight: 140,
      maxHeight: 200,
      minAge: 18,
      maxAge: 60,
      religion: 'All',
      caste: '',
      location: '',
      gender: 'All'
    });
    console.log('🧹 Filters cleared');
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    headerBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F8F9FA' },
  };

  return (
    <WithSwipe toRight="/(tabs)/saved" toLeft="/(tabs)/index">
      <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />
      
      {/* Universal Header with Filter Tabs - Hide on scroll down */}
      {showHeader && (
      <View style={[styles.headerWithTabs, themeStyles.container]}>
        <UniversalHeader 
          title="Profiles"
          showProfileImage={true}
          userImage={auth?.user?.image}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
          leftIcon="menu"
        />
        
        {/* Filter Tabs - Below Header */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabsContainer}
          contentContainerStyle={styles.filterTabsContent}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                activeTab === tab.toLowerCase() && styles.filterTabActive
              ]}
              onPress={() => setActiveTab(tab.toLowerCase())}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeTab === tab.toLowerCase() && styles.filterTabTextActive
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      )}

      {/* Premium Upgrade Banner - Only show for free/basic users (package_id 4 or undefined) */}
      {auth?.user && auth.user.package_id === 4 && (
        <LinearGradient
          colors={['#FCA5A5', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumBannerContent}>
            <View style={styles.premiumBannerText}>
              <Feather name="lock" size={18} color="white" />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumBannerTitle}>Limited Profile Access</Text>
                <Text style={styles.premiumBannerSubtitle}>Upgrade to Premium for unlimited browsing</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.premiumBannerButton}
              onPress={() => router.push('/plans')}
            >
              <Text style={styles.premiumBannerButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>
            Loading profiles...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>

          {/* Main Grid - Show profiles based on active tab */}
          <ScrollView 
            style={[styles.mainContainer, themeStyles.container]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onMomentumScrollEnd={() => loadMoreProfiles()}
            onScroll={(event) => {
              const currentScrollY = event.nativeEvent.contentOffset.y;
              if (currentScrollY < lastScrollY) {
                setShowHeader(true);
              } else if (currentScrollY > lastScrollY + 50) {
                setShowHeader(false);
              }
              setLastScrollY(currentScrollY);
            }}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.light.tint}
                title="Pull to refresh"
                titleColor={theme === 'dark' ? '#FFFFFF' : '#1A1A2E'}
              />
            }
          >
            {(() => {
              let displayProfiles = [];
              
              if (activeTab === 'all') {
                displayProfiles = allProfiles;
              } else if (activeTab === 'recommended') {
                displayProfiles = recommendedProfiles;
              } else if (activeTab === 'new matches') {
                displayProfiles = newMatchesProfiles;
              }
              
              console.log(`🎨 Rendering ${activeTab} tab with ${displayProfiles.length} profiles`);
              console.log('📋 All profiles state:', allProfiles.length);
              console.log('📋 Recommended profiles state:', recommendedProfiles.length);
              console.log('📋 New matches profiles state:', newMatchesProfiles.length);
              
              return displayProfiles.length > 0 ? (
                <View style={styles.gridContainer}>
                  {displayProfiles.map((item, idx) => (
                    <View key={`profile-${item?.id}-${item?.email}-${idx}`} style={styles.gridItem}>
                      <ProfileCard 
                        item={{
                          ...item,
                          isInterested: interestingProfiles.has(item?.id?.toString())
                        }}
                        onPress={() => handleProfilePress(item?.id || '1')} 
                        onHeartPress={handleHeartPress}
                        interestingProfiles={interestingProfiles}
                        isHorizontal={false}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Feather name="search" size={48} color={Colors.light.icon} />
                  <Text style={[styles.loadingText, themeStyles.text]}>
                    No {activeTab} profiles found
                  </Text>
                </View>
              );
            })()}
            
            {loadingMore && (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.light.tint} />
              </View>
            )}
          </ScrollView>
        </View>
      )}
      
      {/* Enhanced Filter Modal */}
      {showFilterModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Filter Profiles</Text>
              <TouchableOpacity 
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Member ID */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>👤 Member ID</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter Member ID"
                  value={filters.memberId}
                  onChangeText={(text) => setFilters({...filters, memberId: text})}
                  keyboardType="default"
                />
              </View>
              
              {/* Height Range with Slider */}
              <View style={styles.filterSection}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.filterLabel}>📏 Height (cm)</Text>
                  <Text style={styles.sliderValue}>{filters.minHeight} - {filters.maxHeight}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Min: {filters.minHeight}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={140}
                    maximumValue={200}
                    value={filters.minHeight}
                    onValueChange={(value) => setFilters({...filters, minHeight: Math.round(value)})}
                    step={1}
                    minimumTrackTintColor={Colors.light.tint}
                    maximumTrackTintColor="#E5E7EB"
                  />
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Max: {filters.maxHeight}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={140}
                    maximumValue={200}
                    value={filters.maxHeight}
                    onValueChange={(value) => setFilters({...filters, maxHeight: Math.round(value)})}
                    step={1}
                    minimumTrackTintColor={Colors.light.tint}
                    maximumTrackTintColor="#E5E7EB"
                  />
                </View>
              </View>
              
              {/* Age Range with Slider */}
              <View style={styles.filterSection}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.filterLabel}>🎂 Age</Text>
                  <Text style={styles.sliderValue}>{filters.minAge} - {filters.maxAge}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Min: {filters.minAge}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={70}
                    value={filters.minAge}
                    onValueChange={(value) => setFilters({...filters, minAge: Math.round(value)})}
                    step={1}
                    minimumTrackTintColor={Colors.light.tint}
                    maximumTrackTintColor="#E5E7EB"
                  />
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Max: {filters.maxAge}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={70}
                    value={filters.maxAge}
                    onValueChange={(value) => setFilters({...filters, maxAge: Math.round(value)})}
                    step={1}
                    minimumTrackTintColor={Colors.light.tint}
                    maximumTrackTintColor="#E5E7EB"
                  />
                </View>
              </View>
              
              {/* Religion Dropdown */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>🙏 Religion</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowReligionModal(true)}
                >
                  <Text style={styles.dropdownButtonText}>{filters.religion || 'Select Religion'}</Text>
                  <Feather name="chevron-down" size={20} color={Colors.light.tint} />
                </TouchableOpacity>
              </View>

              {/* Gender Dropdown */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>👫 Gender</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowGenderModal(true)}
                >
                  <Text style={styles.dropdownButtonText}>{filters.gender || 'Select Gender'}</Text>
                  <Feather name="chevron-down" size={20} color={Colors.light.tint} />
                </TouchableOpacity>
              </View>

              {/* Caste Dropdown */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>👥 Caste</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowCasteModal(true)}
                >
                  <Text style={styles.dropdownButtonText}>{filters.caste || 'Select Caste'}</Text>
                  <Feather name="chevron-down" size={20} color={Colors.light.tint} />
                </TouchableOpacity>
              </View>
              
              {/* Location */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>📍 Location</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter City or State"
                  value={filters.location}
                  onChangeText={(text) => setFilters({...filters, location: text})}
                  keyboardType="default"
                />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => {
                  applyFilters();
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Religion Modal */}
      <Modal
        visible={showReligionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReligionModal(false)}
      >
        <View style={styles.dropdownModalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>🙏 Select Religion</Text>
              <TouchableOpacity onPress={() => setShowReligionModal(false)}>
                <Text style={styles.closeEmoji}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={religions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    filters.religion === item && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    setFilters({...filters, religion: item});
                    setShowReligionModal(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    filters.religion === item && styles.dropdownOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {filters.religion === item && (
                    <Text style={styles.checkEmoji}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Caste Modal */}
      <Modal
        visible={showCasteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCasteModal(false)}
      >
        <View style={styles.dropdownModalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>👥 Select Caste</Text>
              <TouchableOpacity onPress={() => setShowCasteModal(false)}>
                <Text style={styles.closeEmoji}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={castes.length > 0 ? castes : ['No castes available']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    filters.caste === item && styles.dropdownOptionSelected,
                    item === 'No castes available' && styles.dropdownOptionDisabled
                  ]}
                  onPress={() => {
                    if (item !== 'No castes available') {
                      setFilters({...filters, caste: item});
                      setShowCasteModal(false);
                    }
                  }}
                  disabled={item === 'No castes available'}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    filters.caste === item && styles.dropdownOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {filters.caste === item && (
                    <Text style={styles.checkEmoji}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.dropdownModalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>👫 Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Text style={styles.closeEmoji}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    filters.gender === item && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    setFilters({...filters, gender: item});
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    filters.gender === item && styles.dropdownOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {filters.gender === item && (
                    <Text style={styles.checkEmoji}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
    marginTop: 0,
  },
  headerWithTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Clean Header Styles
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 16, // Add margin bottom to header
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16,
    color: '#374151',
  },
  searchLoader: {
    marginLeft: 10,
  },
  closeSearchButton: {
    padding: 5,
  },
  // Main Layout Styles
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop:20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  // Grid Styles
  allMatchGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  // Horizontal Layout Styles
  horizontalScrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  horizontalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 10,
    height: 280,
  },
  gridCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 0,
    height: 240,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  profileImageHorizontal: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  profileImageGrid: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  avatarTextGrid: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  // Crown Badge Styles
  crownBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  crownBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
  // Gradient Overlay Styles - Red Gradient
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  // Profile Info Overlay
  profileInfoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 5,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 3,
  },
  profileNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
  profileAgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  profileLocationText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  overlayContent: {
    flexDirection: 'column',
  },
  overlayName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  overlayAge: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    flex: 1,
    textAlign: 'right',
  },
  // Legacy Profile Info Styles (kept for compatibility)
  profileInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileAge: {
    fontSize: 13,
    fontWeight: '500',
  },
  profileLocation: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  // Premium Badge Styles
  premiumBadgeCard: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  
  // Package Tag Styles
  packageTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 9,
  },
  packageTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  // Heart Icon Styles - EXACT POSITION
  heartIconExact: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  heartBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  heartBackgroundActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  // Loading and Footer Styles
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.light.icon },
  emptyStateSubtext: { marginTop: 8, fontSize: 14, color: Colors.light.icon, opacity: 0.7, textAlign: 'center' },
  filterButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, marginLeft: 8 },
  modalOverlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 1000
  },
  modalContainer: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    width: '90%', 
    maxWidth: 400,
    maxHeight: '85%', 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.light.text },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: '#F3F4F6' },
  modalContent: { maxHeight: '70%', paddingVertical: 10 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  filterSection: { marginBottom: 20 },
  filterLabel: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 8 },
  filterInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
  rangeContainer: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: { flex: 1, marginHorizontal: 5 },
  rangeSeparator: { marginHorizontal: 10, color: Colors.light.icon },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  religionOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9F9F9' },
  religionOptionSelected: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  religionOptionText: { color: Colors.light.text, fontSize: 14 },
  religionOptionTextSelected: { color: 'white', fontWeight: '600' },
  clearButton: { backgroundColor: '#E5E7EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  clearButtonText: { color: Colors.light.text, fontWeight: '600' },
  applyButton: { backgroundColor: Colors.light.tint, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  applyButtonText: { color: 'white', fontWeight: '600' },
  // Filter Tabs Styles
  filterTabsContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingVertical: 0,
    height: 45,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 2,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#DC2626',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: 'white',
  },
  
  // Grid Layout Styles - 2 Equal Columns
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: 16,
    paddingTop: 8,
    minHeight: 'auto',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    marginBottom: 0,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  // New Matches Section Styles
  newMatchesScrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  newMatchCard: {
    alignItems: 'center',
    width: 80,
  },
  newMatchImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newMatchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMatchAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  newMatchInfo: {
    alignItems: 'center',
  },
  newMatchName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  newMatchAge: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  newMatchLocation: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  // Slider Styles
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.tint,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  
  // Dropdown Button Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  
  // Dropdown Modal Styles
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  dropdownOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: Colors.light.tint,
    fontWeight: '700',
  },
  dropdownOptionDisabled: {
    opacity: 0.5,
  },
  
  // Emoji Styles
  closeEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  checkEmoji: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
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