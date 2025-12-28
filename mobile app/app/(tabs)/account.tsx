import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ColorValue, SafeAreaView, StatusBar, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import * as ImagePicker from 'expo-image-picker';

type IconName = ComponentProps<typeof Feather>['name'];
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ProfileCard, { ProfileCardRef } from '../../components/ProfileCard';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';
import UniversalHeader from '../../components/UniversalHeader';
import WithSwipe from '../../components/WithSwipe';

// Custom Image component with fallback support
const FallbackImage = ({ 
  source, 
  style, 
  fallbackSource,
  ...props 
}: { 
  source: { uri: string }; 
  style: any; 
  fallbackSource?: { uri: string };
  [key: string]: any;
}) => {
  const [imageSource, setImageSource] = useState(source);
  const [error, setError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback && fallbackSource) {
      setTriedFallback(true);
      setImageSource(fallbackSource);
    } else {
      setError(true);
    }
  };

  return (
    <Image
      source={imageSource}
      style={style}
      onError={handleError}
      onLoad={() => {}}
      {...props}
    />
  );
};

const quickActionItems: { id: string; title: string; icon: IconName; color: string; bgColor: string }[] = [
  { id: '1', title: 'Edit Profile', icon: 'edit-3', color: '#DC2626', bgColor: '#FEE2E2' },
  { id: '2', title: 'Complete Profile', icon: 'check-circle', color: '#8B5CF6', bgColor: '#EDE9FE' },
];

// Crown color helpers
const getCrownColor = (packageName: string | undefined) => {
  switch ((packageName || '').toUpperCase()) {
    case 'PREMIUM':
    case 'GOLD':
      return '#FFD700'; // gold
    case 'SILVER':
      return '#C0C0C0';
    case 'PLATINUM':
      return '#E5E4E2';
    case 'PRO':
      return '#8B5CF6'; // purple
    default:
      return '#6B7280'; // gray
  }
};

const menuItems: { id: string; title: string; icon: IconName }[] = [
  { id: '1', title: 'Plans & Pricing', icon: 'credit-card' },
  { id: '2', title: 'Purchase History', icon: 'settings' },
  { id: '3', title: 'Ignored Lists', icon: 'slash' },
];

// Helper function to construct image URL with fallback
// Primary: Local IP server, Fallback: 90skalyanam.com
const getImageUrl = (image: string | null | undefined): { primary: string | null; fallback: string | null } => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  const trimmedImage = image.trim();
  
  // If already a full URL, use it as primary with production as fallback
  if (trimmedImage.startsWith('http')) {
    // Extract just the filename for fallback
    const filename = trimmedImage.split('/').pop() || trimmedImage;
    const fallbackUrl = `https://90skalyanam.com/assets/images/user/profile/${filename}`;
    return { primary: trimmedImage, fallback: fallbackUrl };
  }
  
  // Primary URL from environment variable (Local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile';
  const primaryUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  // Fallback URL from production server (90skalyanam.com)
  const fallbackUrl = `https://90skalyanam.com/assets/images/user/profile/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

// Helper function to construct gallery image URL with fallback
// Primary: Local IP server, Fallback: 90skalyanam.com
const getGalleryImageUrl = (image: string | null | undefined): { primary: string | null; fallback: string | null } => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  const trimmedImage = image.trim();
  
  // If already a full URL, use it as primary with production as fallback
  if (trimmedImage.startsWith('http')) {
    const filename = trimmedImage.split('/').pop() || trimmedImage;
    const fallbackUrl = `https://90skalyanam.com/assets/images/user/gallery/${filename}`;
    return { primary: trimmedImage, fallback: fallbackUrl };
  }
  
  // Primary URL from environment variable (Local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/gallery';
  const primaryUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  // Fallback URL from production server (90skalyanam.com)
  const fallbackUrl = `https://90skalyanam.com/assets/images/user/gallery/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

export default function AccountScreen() {
  const handlePayNow = async (planId:number) => {
    try {
      setLoadingPayment(true);
      const orderResp = await apiService.createRazorOrder(planId);
      if(orderResp.status!=='success') throw new Error('Order create failed');
      const { order_id, amount, currency, razorpay_key, plan } = orderResp.data;
      const options = {
        key: razorpay_key,
        amount: amount.toString(),
        currency,
        name: '90s Kalyanam',
        description: plan.name,
        order_id,
        prefill: { email: user?.email, contact: user?.mobile },
        theme: { color: '#DC2626' }
      };
      setLoadingPayment(false);
      RazorpayCheckout.open(options).then(async (data:any)=>{
        await apiService.verifyRazorPayment({ ...data, plan_id: plan.id });
        Alert.alert('Success','Plan activated');
        fetchDashboardData();
      }).catch(()=>{});
    } catch(e){
      setLoadingPayment(false);
      Alert.alert('Error','Payment failed');
    }
  };
    const [loadingPayment,setLoadingPayment]=useState(false);
  const router = useRouter();
  const profileCardRef = useRef<ProfileCardRef>(null);
  const auth = useAuth();
  const { theme, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const user = auth?.user;
  const limitation = auth?.limitation;
  const logout = auth?.logout;
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'actions'>('photos');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  // Remaining uploads from dashboardData
  const remainingUploads = dashboardData?.remaining_image_upload ?? 0;

  const handleThemeToggle = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      await setThemeMode(newTheme);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchGalleryImages();
  }, []);

  // Update dashboard counts when limitation changes (e.g., after expressing interest)
  useEffect(() => {
    if (limitation) {
      setDashboardData(prev => ({
        ...prev,
        remaining_interests: limitation.interest_express_limit ?? prev?.remaining_interests,
        remaining_contact_view: limitation.contact_view_limit ?? prev?.remaining_contact_view,
        remaining_image_upload: limitation.image_upload_limit ?? prev?.remaining_image_upload,
      }));
    }
  }, [limitation]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Account Screen - Fetching Dashboard Data');
      console.log('👤 User:', user?.id, user?.firstname);
      console.log('📋 Limitation from AuthContext:', limitation);
      
      // First try to use user data from auth context
      if (user && user.id) {
        const imageUrl = getImageUrl(user.image);
        
        // Get package info from limitation data
        const packageId = limitation?.package_id || user.package_id || 1;
        const packageName = user.package_name || 'FREE MATCH';
        
        // Use limitation data from AuthContext (from login response)
        let remainingInterests = 0;
        let remainingContactView = 0;
        let remainingImageUpload = 0;
        
        if (limitation) {
          console.log('✅ Limitation data found');
          console.log('  - interest_express_limit:', limitation.interest_express_limit);
          console.log('  - contact_view_limit:', limitation.contact_view_limit);
          console.log('  - image_upload_limit:', limitation.image_upload_limit);
          
          // Use the actual limitation counts from login response
          remainingInterests = limitation.interest_express_limit !== undefined ? limitation.interest_express_limit : 0;
          remainingContactView = limitation.contact_view_limit !== undefined ? limitation.contact_view_limit : 0;
          remainingImageUpload = limitation.image_upload_limit !== undefined ? limitation.image_upload_limit : 0;
          
          // Handle unlimited (-1 means unlimited)
          if (remainingInterests === -1) remainingInterests = 'Unlimited';
          if (remainingContactView === -1) remainingContactView = 'Unlimited';
          if (remainingImageUpload === -1) remainingImageUpload = 'Unlimited';
          
          console.log('📊 Processed values:');
          console.log('  - remainingInterests:', remainingInterests);
          console.log('  - remainingContactView:', remainingContactView);
          console.log('  - remainingImageUpload:', remainingImageUpload);
        } else {
          console.log('⚠️ No limitation data in AuthContext');
        }
        
        // Set dashboard data with limitation counts
        setDashboardData({
          remaining_contact_view: remainingContactView,
          remaining_interests: remainingInterests,
          remaining_image_upload: remainingImageUpload,
        });
        
        // Set user profile data from auth context
        setUserProfile({
          firstname: user.firstname,
          lastname: user.lastname,
          profile_id: user.profile_id,
          image: imageUrl,
          id: user.id,
          packageId: packageId,
          packageName: packageName,
          premium: packageId > 1 ? 1 : 0
        });
      }
      
      // Try to get dashboard data for additional info (optional)
      try {
        const dashboardResponse = await apiService.getDashboard();
        
        console.log('📡 Dashboard API Response:', dashboardResponse?.data?.limitation);
        
        // If limitation present and differs, sync to AuthContext and state
        if (auth?.updateLimitation) {
          const lim = dashboardResponse?.data?.limitation ?? {
            interest_express_limit: dashboardResponse?.data?.remaining_interests,
            contact_view_limit: dashboardResponse?.data?.remaining_contact_view,
            image_upload_limit: dashboardResponse?.data?.remaining_image_upload,
          };
          auth.updateLimitation(lim);
          setDashboardData(prev => ({
            ...prev,
            remaining_interests: lim.interest_express_limit ?? prev?.remaining_interests,
            remaining_contact_view: lim.contact_view_limit ?? prev?.remaining_contact_view,
            remaining_image_upload: lim.image_upload_limit ?? prev?.remaining_image_upload,
          }));
        }
        
        // Check if profile is incomplete
        if (dashboardResponse?.status === 'error' && dashboardResponse?.remark === 'profile_incomplete') {
          Alert.alert(
            'Complete Your Profile',
            'Please complete your profile to view dashboard and access all features.',
            [
              {
                text: 'Complete Profile',
                onPress: () => router.push('/profile-setting'),
                style: 'default'
              },
              {
                text: 'Later',
                onPress: () => {},
                style: 'cancel'
              }
            ]
          );
          return;
        }
      } catch (dashboardError) {
        console.log('⚠️ Dashboard API failed:', dashboardError);
        // Dashboard API failed, but we still have user data from auth context with limitation data
      }

      // Fetch package information
      try {
        const packageResponse = await apiService.getPackageInfo();
        console.log('📦 Package info response:', packageResponse);
        
        if (packageResponse?.status === 'success' && packageResponse?.data?.package) {
          const packageName = packageResponse.data.package.name || packageResponse.data.package.title || 'Unknown Plan';
          console.log('📦 Package name:', packageName);
          
          // Update user profile with correct package name
          setUserProfile((prev) => ({
            ...prev,
            packageName: packageName
          }));
        }
      } catch (packageError) {
        console.log('⚠️ Package info fetch failed:', packageError);
        // Continue with existing package name if fetch fails
      }

      // Fetch all available plans with benefits
      try {
        const plansResponse = await apiService.getAllPlans();
        console.log('📋 All plans response:', plansResponse);
        
        if (plansResponse?.status === 'success' && plansResponse?.data?.plans) {
          setPlanDetails(plansResponse.data.plans);
          console.log('📋 Plans loaded:', plansResponse.data.plans.length);
        }
      } catch (plansError) {
        console.log('⚠️ Plans fetch failed:', plansError);
        // Continue without plans if fetch fails
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Fallback to default values if no user data available
      setDashboardData({
        remaining_contact_view: 0,
        remaining_interests: 0,
        remaining_image_upload: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      await fetchGalleryImages();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await apiService.getGalleryImages();
      
      if (response?.status === 'success' && response?.data) {
        const images = Array.isArray(response.data) ? response.data : response.data.galleries || [];
        setGalleryImages(images);
      } else {
        setGalleryImages([]);
      }
    } catch (error) {
      setGalleryImages([]);
    }
  };

  const handleCardPress = () => {
    profileCardRef.current?.flipCard();
  };

  const handleMenuItemPress = async (item: { id: string; title: string; icon: IconName }) => {
    if (item.title === 'Logout') {
      try {
        if (logout) {
          await logout();
        }
        router.replace('/(auth)/login');
      } catch (error) {
      }
    } else if (item.title === 'Plans & Pricing') {
      router.push('/plans');
    } else if (item.title === 'Dashboard') {
      // Already on dashboard
    } else if (item.title === 'Purchase History') {
      // router.push('/purchase-history'); // Route doesn't exist yet
    } else if (item.title === 'Gallery') {
      router.push('/gallery');
    } else if (item.title === 'Interest Request') {
      router.push('/interest-sent');
    } else if (item.title === 'Ignored Lists') {
      // router.push('/ignored-lists'); // Route doesn't exist yet
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Open gallery directly
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImage = async (imageAsset: any) => {
    try {
      setUploadingImage(true);
      console.log('📸 Uploading profile image...');
      
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiService.uploadProfileImage(formData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Profile picture updated successfully!');
        // Update userProfile with new image using the URL from API response
        const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
        const newImageUrl = response.data?.image_url || `${imageBaseUrl}/${response.data?.image || response.image}`;
        console.log('🖼️ New image URL:', newImageUrl);
        setUserProfile((prev: any) => ({ ...prev, image: newImageUrl }));
        // Refresh user data if available
        if (auth && 'refreshUser' in auth && typeof auth.refreshUser === 'function') {
          auth.refreshUser();
        }
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    card: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F8F9FA' },
  };

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Fetch plan details
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setPlanLoading(true);
        const response = await apiService.getDepositMethods();
        
        if (response?.data?.plans) {
          setPlanDetails(response.data.plans);
        } else if (response?.data) {
          setPlanDetails(response.data);
        }
      } catch (error) {
        setPlanDetails(null);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlanDetails();
  }, []);

  const settingsMenuItems = [
    { id: '1', title: 'Personal Information', icon: 'user' },
    { id: '2', title: 'Privacy Centre', icon: 'lock' },
    { id: '3', title: 'Account Status', icon: 'check-circle' },
    { id: '4', title: 'Link History', icon: 'link' },
    { id: '5', title: 'Push Notification', icon: 'bell' },
    { id: '6', title: 'Email Notification', icon: 'mail' },
    { id: '7', title: 'SMS Notification', icon: 'message-square' },
    { id: '8', title: 'Search History', icon: 'search' },
    { id: '9', title: 'Logout', icon: 'log-out' },
  ];

  return (
    <WithSwipe toLeft="/(tabs)/index" toRight="/(tabs)/chats">
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}
        translucent={false}
      />
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#DC2626"
            />
          }
        >
        {/* Universal Header with Settings Icon, Language & Theme Toggles */}
        <View style={[styles.headerWithoutGradient, { paddingTop: insets.top }, theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' }]}>
          {/* Top Header Bar */}
          <View style={styles.headerTopBar}>
            {/* Left: Settings Icon */}
            <TouchableOpacity 
              style={styles.settingsIconButton}
              onPress={() => router.push('/settings')}
            >
              <Feather name="settings" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1A1A2E'} />
            </TouchableOpacity>

            {/* Center: Title */}
            <Text style={[styles.headerTopTitle, theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' }]}>
              My Profile
            </Text>

            {/* Right: Language & Theme Toggles */}
            <View style={styles.headerRightToggleIcons}>
              {/* Language Toggle */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => {
                  const newLanguage = language === 'en' ? 'ta' : 'en';
                  setLanguage(newLanguage);
                }}
              >
                <Text style={styles.languageToggleText}>
                  {language === 'en' ? '🇬🇧' : '🇮🇳'}
                </Text>
              </TouchableOpacity>

              {/* Theme Toggle */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={handleThemeToggle}
              >
                <Feather 
                  name={theme === 'dark' ? 'sun' : 'moon'} 
                  size={20} 
                  color={theme === 'dark' ? '#FFFFFF' : '#1A1A2E'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Premium Upgrade Banner - Only show for non-premium users */}
        {userProfile && !(userProfile.premium === 1 || userProfile.premium === true || userProfile.package_id > 1) && (
          <LinearGradient
            colors={['#FCA5A5', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBannerTop}
          >
            <View style={styles.premiumBannerContent}>
              <View style={styles.premiumBannerText}>
                <Feather name="lock" size={18} color="white" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumBannerTitle}>Unlock Premium Features</Text>
                  <Text style={styles.premiumBannerSubtitle}>Chat, upload photos & more</Text>
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
        {/* Settings Menu - Direct Navigation to Settings Screen */}
        {showSettingsMenu && (
          <TouchableOpacity 
            style={styles.settingsMenuOverlay}
            onPress={() => setShowSettingsMenu(false)}
            activeOpacity={1}
          >
            <View style={[styles.settingsDropdown, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
              <TouchableOpacity 
                style={[styles.settingsMenuItem, theme === 'dark' && { borderBottomColor: '#3A3A3A' }]}
                onPress={() => {
                  setShowSettingsMenu(false);
                  router.push('/settings');
                }}
              >
                <Feather name="settings" size={20} color="#6B7280" />
                <Text style={[styles.settingsMenuItemText, theme === 'dark' && { color: '#E5E7EB' }]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Premium Profile Card with Modern Design */}
        <View style={[styles.profileCardContainer, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          {/* Card Header with Gradient Background */}
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCardHeader}
          >
            {/* Profile Image - Large Circle */}
            <View style={styles.profileImageLarge}>
              {userProfile?.image && typeof userProfile.image === 'object' && userProfile.image.primary ? (
                <>
                <FallbackImage 
                  source={{ uri: userProfile.image.primary }} 
                  fallbackSource={userProfile.image.fallback ? { uri: userProfile.image.fallback } : undefined}
                  style={styles.profileImageLargeImg}
                />
                {/* Crown Icon */}
                {userProfile?.premium && (
                  <View style={[styles.crownOverlay, { backgroundColor: getCrownColor(userProfile.packageName)+'30' }]}> 
                    <MaterialCommunityIcons name="crown" size={18} color={getCrownColor(userProfile.packageName)} />
                  </View>
                )}
              </>
              ) : (
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileImageLargeImg}
                >
                  <Text style={styles.avatarTextXL}>
                    {userProfile?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity 
                style={styles.cameraIconLarge} 
                onPress={handleChangeProfilePicture}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="camera" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Name and Premium Badge */}
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileNameLarge}>
                {userProfile?.firstname} {userProfile?.lastname}
              </Text>
              <View style={styles.premiumBadge}>
                <Feather name="star" size={14} color="#FCD34D" />
                <Text style={styles.premiumBadgeText}>{userProfile?.packageName || 'FREE MATCH'}</Text>
              </View>
              <Text style={styles.profileIdText}>
                Profile ID: {userProfile?.profile_id || userProfile?.id || 'N/A'}
              </Text>
            </View>
          </LinearGradient>

          {/* Stats Section */}
          <View style={[styles.profileStatsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardData?.remaining_interests || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Interest Left</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardData?.remaining_contact_view || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Contact View</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardData?.remaining_image_upload || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Gallery Upload</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.profileCardActions, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={() => router.push('/profile-setting')}
            >
              <Feather name="edit-3" size={18} color="white" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButtonSecondary, theme === 'dark' && { backgroundColor: '#2A2A2A', borderColor: '#3A3A3A' }]}
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel', onPress: () => {} },
                  { text: 'Logout', onPress: () => logout?.(), style: 'destructive' }
                ]);
              }}
            >
              <Feather name="log-out" size={18} color="#DC2626" />
              <Text style={styles.actionButtonTextSecondary}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Tabs Section - Images and My Plan */}
        <View style={[styles.tabsSection, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
          {/* Tab Buttons */}
          <View style={[styles.tabButtonsContainer, theme === 'dark' && { borderBottomColor: '#2A2A2A' }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
              onPress={() => setActiveTab('photos')}
            >
              <Feather name="image" size={20} color={activeTab === 'photos' ? '#DC2626' : '#9CA3AF'} />
              <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive, theme === 'dark' && { color: activeTab === 'photos' ? '#DC2626' : '#9CA3AF' }]}>
                Images
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'plans' && styles.tabButtonActive]}
              onPress={() => setActiveTab('plans')}
            >
              <Feather name="award" size={20} color={activeTab === 'plans' ? '#DC2626' : '#9CA3AF'} />
              <Text style={[styles.tabButtonText, activeTab === 'plans' && styles.tabButtonTextActive, theme === 'dark' && { color: activeTab === 'plans' ? '#DC2626' : '#9CA3AF' }]}>
                My Plan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={[styles.tabContent, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <View style={styles.photosContainer}>
                {/* Gallery Images */}
                <View style={styles.photosGrid}>
                  {galleryImages.length > 0 ? (
                    <FlatList
                      data={remainingUploads > 0 ? [{ addButton: true }, ...galleryImages] : galleryImages}
                      numColumns={3}
                      scrollEnabled={false}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => {
                        if (item.addButton) {
                          return (
                            <TouchableOpacity 
                              style={[styles.photoGridItem, theme === 'dark' && { backgroundColor: '#1A1A1A', justifyContent:'center', alignItems:'center' }]}
                              onPress={handleAddGalleryImage}
                            >
                              <Feather name="plus" size={32} color="#DC2626" />
                            </TouchableOpacity>
                          );
                        }
                        const imageUrls = getGalleryImageUrl(item.image_url || item.image);
                        // skip for addButton index shift
                        const remainingUploadsCount = dashboardData?.remaining_image_upload || 0;
                        const showCount = (index === 1 || (index === 0 && remainingUploads === 0)) && remainingUploadsCount > 0;
                        return (
                          <TouchableOpacity 
                            style={[styles.photoGridItem, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}
                            activeOpacity={0.8}
                          >
                            {imageUrls.primary ? (
                              <>
                                <FallbackImage 
                                  source={{ uri: imageUrls.primary }} 
                                  fallbackSource={imageUrls.fallback ? { uri: imageUrls.fallback } : undefined}
                                  style={styles.photoGridImage}
                                />
                                {showCount && (
                                  <View style={styles.uploadCountBadge}>
                                    <Text style={styles.uploadCountText}>{remainingUploads} left</Text>
                                  </View>
                                )}
                              </>
                            ) : (
                              <View style={[styles.photoGridImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <Feather name="image" size={24} color="#9CA3AF" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                      columnWrapperStyle={styles.photoColumnWrapper}
                    />
                  ) : (
                    <View style={styles.emptyPhotosContainer}>
                      <Feather name="image" size={48} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                      <Text style={[styles.emptyPhotosText, theme === 'dark' && { color: '#9CA3AF' }]}>
                        No photos yet
                      </Text>
                      <Text style={[styles.emptyPhotosSubtext, theme === 'dark' && { color: '#6B7280' }]}>
                        {dashboardData?.remaining_image_upload > 0 
                          ? `You have ${dashboardData.remaining_image_upload} uploads left` 
                          : 'No uploads remaining'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.uploadPhotosButton}
                        onPress={() => {
                          // Check if user is premium
                          const isPremium = userProfile?.premium === 1 || userProfile?.premium === true;
                          if (!isPremium) {
                            console.log('📸 Non-premium user attempting to upload, showing upgrade prompt');
                            Alert.alert(
                              'Premium Feature',
                              'Photo uploads are available for premium members only. Upgrade to Pro to upload photos.',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => {},
                                  style: 'cancel'
                                },
                                {
                                  text: 'Upgrade to Pro',
                                  onPress: () => {
                                    console.log('🚀 Navigating to plans/upgrade screen');
                                    router.push('/plans');
                                  },
                                  style: 'default'
                                }
                              ]
                            );
                          } else {
                            console.log('📸 Premium user, navigating to gallery');
                            router.push('/gallery');
                          }
                        }}
                      >
                        <Text style={styles.uploadPhotosButtonText}>Upload Photos</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* My Plan Tab */}
            {activeTab === 'plans' && (
              <View style={styles.myPlanContainer}>
                {planLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text style={[styles.loadingText, theme === 'dark' && { color: '#E5E7EB' }]}>Loading plan details...</Text>
                  </View>
                ) : (
                  <>
                    {/* Current Plan Card */}
                    <View style={[styles.planCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                      <View style={styles.planCardHeader}>
                        <Feather name="award" size={24} color="#DC2626" />
                        <Text style={[styles.planCardTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Current Plan</Text>
                      </View>
                      <Text style={[styles.planCardName, theme === 'dark' && { color: '#FFFFFF' }]}>
                        {userProfile?.packageName || 'No Active Plan'}
                      </Text>
                      <Text style={[styles.planCardDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                        {userProfile?.packageName ? 'Your active membership plan' : 'Upgrade to unlock premium features'}
                      </Text>
                    </View>

                    {/* Available Plans */}
                    {planDetails && Array.isArray(planDetails) && planDetails.length > 0 && (
                      <View style={styles.availablePlansSection}>
                        <Text style={[styles.availablePlansTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Available Plans</Text>
                        {planDetails.map((plan: any, index: number) => (
                          <View key={index} style={[styles.planOptionCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                            <View style={styles.planOptionHeader}>
                              <Text style={[styles.planOptionName, theme === 'dark' && { color: '#FFFFFF' }]}>
                                {plan.name || plan.title || `Plan ${index + 1}`}
                              </Text>
                              <Text style={styles.planOptionPrice}>
                                ₹{plan.price || plan.amount || '0'}
                              </Text>
                            </View>
                            <Text style={[styles.planOptionDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                              {plan.description || 'Premium membership plan'}
                            </Text>
                            
                            {/* Plan Benefits */}
                            <View style={styles.planBenefitsInline}>
                              {plan.interest_express_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.interest_express_limit} Interests
                                  </Text>
                                </View>
                              )}
                              {plan.contact_view_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.contact_view_limit} Contact Views
                                  </Text>
                                </View>
                              )}
                              {plan.image_upload_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.image_upload_limit} Photo Uploads
                                  </Text>
                                </View>
                              )}
                              {plan.validity_period > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.validity_period} Days Validity
                                  </Text>
                                </View>
                              )}
                            </View>

                              {/* Pay/Current Button */}
                              <TouchableOpacity
                                disabled={plan.id === userProfile?.packageId}
                                style={[
                                  styles.payNowButton,
                                  plan.id === userProfile?.packageId && styles.payNowButtonDisabled,
                                ]}
                                onPress={() => {
                                  if (plan.id !== userProfile?.packageId) {
                                    handlePayNow(plan.id);
                                  }
                                }}
                              >
                                <Text style={styles.payNowButtonText}>
                                  {plan.id === userProfile?.packageId ? 'Current' : 'Pay Now'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                        ))}
                      </View>
                    )}

                    {/* Get Premium Button */}
                    {!userProfile?.packageName && (
                      <TouchableOpacity 
                        style={styles.upgradePlanButton}
                        onPress={() => router.push('/plans')}
                      >
                        <Feather name="star" size={18} color="white" />
                        <Text style={styles.upgradePlanButtonText}>Upgrade to Premium</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

          </View>
        </View>

        {/* Duplicate My Plan Tab removed */}
        {false && (
          <View style={styles.myPlanContainer}>
            {planLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={[styles.loadingText, theme === 'dark' && { color: '#E5E7EB' }]}>Loading plan details...</Text>
              </View>
            ) : (
              <>
                {/* Current Plan Card */}
                <View style={[styles.planCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                  <View style={styles.planCardHeader}>
                    <Feather name="award" size={24} color="#DC2626" />
                    <Text style={[styles.planCardTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Current Plan</Text>
                  </View>
                  <Text style={[styles.planCardName, theme === 'dark' && { color: '#FFFFFF' }]}>
                    {userProfile?.packageName || 'No Active Plan'}
                  </Text>
                  <Text style={[styles.planCardDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                    {userProfile?.packageName ? 'Your active membership plan' : 'Upgrade to unlock premium features'}
                  </Text>
                </View>

                {/* Available Plans */}
                {planDetails && Array.isArray(planDetails) && planDetails.length > 0 && (
                  <View style={styles.availablePlansSection}>
                    <Text style={[styles.availablePlansTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Available Plans</Text>
                    {planDetails.map((plan: any, index: number) => (
                      <View key={index} style={[styles.planOptionCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                        <View style={styles.planOptionHeader}>
                          <Text style={[styles.planOptionName, theme === 'dark' && { color: '#FFFFFF' }]}>
                            {plan.name || plan.title || `Plan ${index + 1}`}
                          </Text>
                          <Text style={styles.planOptionPrice}>
                            ₹{plan.price || plan.amount || '0'}
                          </Text>
                        </View>
                        <Text style={[styles.planOptionDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                          {plan.description || 'Premium membership plan'}
                        </Text>
                        
                        {/* Plan Benefits */}
                        <View style={styles.planBenefitsInline}>
                          {plan.interest_express_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.interest_express_limit} Interests
                              </Text>
                            </View>
                          )}
                          {plan.contact_view_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.contact_view_limit} Contact Views
                              </Text>
                            </View>
                          )}
                          {plan.image_upload_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.image_upload_limit} Photo Uploads
                              </Text>
                            </View>
                          )}
                          {plan.validity_period > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.validity_period} Days Validity
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Get Premium Button */}
                {!userProfile?.packageName && (
                  <TouchableOpacity 
                    style={styles.upgradePlanButton}
                    onPress={() => router.push('/plans')}
                  >
                    <Feather name="star" size={18} color="white" />
                    <Text style={styles.upgradePlanButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

      
      <View style={styles.bottomPadding} />
    </ScrollView>
  </SafeAreaView>
</WithSwipe>
  );
}

const getSummaryStats = (dashboardData: any, loading: boolean): { title: string; value: string; icon: IconName; colors: readonly [ColorValue, ColorValue, ...ColorValue[]] }[] => {
  if (loading) {
    return [
      { title: 'Contact Views Left', value: '...', icon: 'eye', colors: ['#60A5FA', '#3B82F6'] as const },
      { title: 'Interests Left', value: '...', icon: 'heart', colors: ['#FDE68A', '#FBBF24'] as const },
      { title: ' Uploads Left', value: '...', icon: 'camera', colors: ['#EF4444', '#DC2626'] as const },
    ];
  }

  // Handle unlimited values (-1) and format display
  const formatValue = (value: number) => {
    if (value === -1) return '∞';
    return value?.toString() || '0';
  };

  return [
    { 
      title: 'Contact Views Left', 
      value: formatValue(dashboardData?.remaining_contact_view), 
      icon: 'eye', 
      colors: ['#60A5FA', '#3B82F6'] as const 
    },
    { 
      title: 'Interests Left', 
      value: formatValue(dashboardData?.remaining_interests), 
      icon: 'heart', 
      colors: ['#FDE68A', '#FBBF24'] as const 
    },
    { 
      title: 'Uploads Left', 
      value: formatValue(dashboardData?.remaining_image_upload), 
      icon: 'camera', 
      colors: ['#EF4444', '#DC2626'] as const 
    },
  ];
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
    width: '100%',
  },

  // Header without gradient (matches universal header padding style)
  headerWithoutGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  headerTopTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRightToggleIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageToggleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  premiumBannerTop: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 8,
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

  // New Header with Icons
  newHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  newHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  menuIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconToggleButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Settings Dropdown Menu
  settingsMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  settingsDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 400,
    marginTop: 50,
    marginRight: 10,
    marginLeft: 'auto',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: 180,
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },

  // New Red Profile Card
  newProfileCard: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 16,
  },

  // Profile Card Top Section
  profileCardTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileImageCircle: {
    position: 'relative',
    width: 70,
    height: 70,
  },
  profileImageCircleImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconSmall: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoRight: {
    flex: 1,
    gap: 4,
  },
  profileNameWhite: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmailWhite: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Profile Stats Row
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  profileStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Profile Card Bottom Section
  profileCardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
  },
  thankYouLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  logoutButtonSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoutButtonSmallText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Current Plan Section
  photosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  currentPlanSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  planLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  getPremiumButton: {
    backgroundColor: '#A855F7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  getPremiumButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  payNowButton:{
    backgroundColor:'#DC2626',
    paddingVertical:10,
    paddingHorizontal:20,
    borderRadius:8,
    alignSelf:'flex-start',
    marginTop:12
  },
  payNowButtonDisabled:{
    backgroundColor:'#9CA3AF'
  },
  payNowButtonText:{
    color:'#FFFFFF',
    fontWeight:'600'
  },

  // My Plan Tab
  myPlanContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  availablePlansSection: {
    gap: 10,
  },
  availablePlansTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  planOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  planOptionPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  planOptionDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  planOptionDuration: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  planCardDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  planBenefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  planBenefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  upgradePlanButton: {
    backgroundColor: '#A855F7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  upgradePlanButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Attractive Header
  attractiveHeader: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  gradientBackgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Profile Card
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 12,
    marginTop: -40,
    marginBottom: 32,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImageLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarGradientLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editIconLarge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  profileIdLarge: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 10,
  },
  premiumBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  premiumTextLarge: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Stats Section - Simple Text and Counters
  statsSection: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statsHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    marginLeft: 4,
  },
  statsSimpleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statSimpleItem: {
    alignItems: 'center',
    gap: 6,
  },
  statSimpleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 90,
  },
  statSimpleValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
  },
  actionListContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionListIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionListContent: {
    flex: 1,
  },
  actionListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionListSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
  },
  menuListContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  menuListIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuListContent: {
    flex: 1,
  },
  menuListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuItemNew: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuIconNew: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuItemTextNew: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutMenuItemNew: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  logoutIconNew: {
    backgroundColor: '#FEE2E2',
  },
  logoutMenuItemTextNew: {
    color: '#DC2626',
  },

  // Tabs Section Styles
  tabsSection: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: '#FFFFFF',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#DC2626',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabButtonTextActive: {
    color: '#DC2626',
  },
  tabContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },

  // Photos Grid Styles (Instagram-like)
  photosGrid: {
    minHeight: 300,
    paddingHorizontal: 0,
  },
  photoColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 2,
    paddingHorizontal: 12,
  },
  photoGridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  uploadCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  uploadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyPhotosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyPhotosText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptyPhotosSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: -8,
  },
  uploadPhotosButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadPhotosButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  // Actions List Styles (List view instead of grid)
  actionsGrid: {
    flexDirection: 'column',
    gap: 0,
  },
  actionGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionGridIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'left',
    flex: 1,
  },
  
  // Logout Button Special Style (List item)
  logoutButton: {
    borderBottomColor: '#FECACA',
  },

  // New Quick Actions Container
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 24,
  },

  // Quick Actions Section
  quickActionsSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  // Menu Section
  menuSection: {
    gap: 12,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  logoutButtonLarge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },

  bottomPadding: {
    height: 30,
  },

  // New Profile Card Styles (Redesigned)
  profileCardContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  profileImageLarge: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  crownOverlay: {
    position: 'absolute',
    left: -8,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  profileImageLargeImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  profileHeaderInfo: {
    alignItems: 'center',
    gap: 8,
  },
  profileNameLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  profileIdText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileStatsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },
  profileCardActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  avatarTextXL: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  planBenefitsInline: {
    marginTop: 12,
    gap: 8,
  },
  benefitItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitTextInline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
});