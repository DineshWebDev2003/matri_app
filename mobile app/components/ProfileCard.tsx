import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { premiumUtils, apiService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export interface ProfileCardRef {
  flipCard: () => void;
}

interface ProfileCardProps {
  userProfile?: any;
  item?: any;
}

const ProfileCard = forwardRef<ProfileCardRef, ProfileCardProps>(({ userProfile, item }, ref) => {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  
  // Get package information from userProfile or user
  const packageId = userProfile?.packageId || user?.packageId || 4;
  const packageName = userProfile?.packageName || user?.packageName || 'FREE MATCH';
  const isPremium = premiumUtils.isPremiumUser(packageId);
  const packageTier = premiumUtils.getPackageTier(packageId);
  const packageColor = premiumUtils.getPackageColor(packageId);

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

  const profile = {
    name: userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : (item?.name || item?.firstname ? `${item?.firstname || ''} ${item?.lastname || ''}`.trim() : (user?.name || 'Dinesh M')),
    id: `ID : ${userProfile?.profile_id || item?.id || user?.id || '54879108'}`,
    profileImage: userProfile?.image || item?.images?.[0] || item?.image || user?.profileImage || null,
    plan: `${packageTier} MATCH`,
    isPremium: isPremium,
    packageColor: packageColor,
    firstLetter: userProfile?.firstname?.charAt(0)?.toUpperCase() || item?.firstname?.charAt(0)?.toUpperCase() || user?.firstname?.charAt(0)?.toUpperCase() || 'U',
    location: item?.location || item?.city || null,
    age: item?.age || calculateAge(item?.dateOfBirth || item?.dob) || null,
    gender: item?.gender || item?.basicInfo?.gender || null,
    religion: item?.religion || null,
    caste: item?.caste || null,
  };

  // Debug logging
  console.log('🔍 ProfileCard Debug:');
  console.log('- userProfile:', userProfile);
  console.log('- item:', item);
  console.log('- profile.location:', profile.location);
  console.log('- profile.age:', profile.age);
  console.log('- userProfile.image:', userProfile?.image);
  console.log('- user.profileImage:', user?.profileImage);
  console.log('- Final profileImage:', profile.profileImage);

  const handleImagePicker = async () => {
    try {
      // Check plan limitations first
      const userPlan = await apiService.getUserPlan();
      const remainingUploads = userPlan.data?.remaining_image_upload || 0;
      
      if (remainingUploads <= 0 && !isPremium) {
        Alert.alert(
          'Upload Limit Reached',
          'You have reached your image upload limit. Upgrade to premium for unlimited uploads.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/plans') }
          ]
        );
        return;
      }

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Show options
      Alert.alert(
        'Update Profile Picture',
        `Remaining uploads: ${remainingUploads}${isPremium ? ' (Unlimited)' : ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() }
        ]
      );
    } catch (error) {
      console.error('Error checking upload limits:', error);
      Alert.alert('Error', 'Failed to check upload limits. Please try again.');
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset: any) => {
    try {
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
        // Refresh user data
        auth?.refreshUser();
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  
    const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped((prev) => !prev);
    });
  };

  useImperativeHandle(ref, () => ({
    flipCard,
  }));

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const renderFront = () => (
    <Animated.View style={[styles.card, frontAnimatedStyle]}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image 
              source={{ uri: profile.profileImage }} 
              style={styles.profileImage}
              onLoad={() => console.log('✅ Profile image loaded successfully:', profile.profileImage)}
              onError={(error) => console.log('❌ Profile image failed to load:', error.nativeEvent.error, 'URL:', profile.profileImage)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{profile.firstLetter}</Text>
              </LinearGradient>
            </View>
          )}
          <TouchableOpacity style={styles.editIconContainer} onPress={() => router.push('/profile-setting')}>
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <MaterialIcons name="verified" size={24} color="#3B82F6" style={styles.verifiedBadge} />
          </View>
          
          {/* Age and Gender */}
          <View style={styles.profileDetailsRow}>
            {profile.age && (
              <Text style={styles.profileDetail}>{profile.age} yrs</Text>
            )}
            {profile.gender && (
              <Text style={styles.profileDetail}>• {profile.gender}</Text>
            )}
          </View>
          
          {/* Religion and Caste */}
          <View style={styles.profileDetailsRow}>
            {profile.religion && (
              <Text style={styles.profileDetail}>{profile.religion}</Text>
            )}
            {profile.caste && (
              <Text style={styles.profileDetail}>• {profile.caste}</Text>
            )}
          </View>
          
          {/* Location */}
          {profile.location && (
            <Text style={styles.profileLocation} numberOfLines={1}>
              <Feather name="map-pin" size={12} color="#6B7280" /> {profile.location}
            </Text>
          )}
          
          <Text style={styles.profileId}>{profile.id}</Text>
          {profile.isPremium && (
            <View style={[styles.planContainer, { backgroundColor: `${profile.packageColor}20`, borderColor: `${profile.packageColor}40` }]}>
              <Text style={[styles.planText, { color: profile.packageColor }]}>{profile.plan}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderBack = () => (
    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
      <LinearGradient 
        colors={profile.isPremium ? [profile.packageColor, `${profile.packageColor}CC`] : ['#DC2626', '#C53030']}
        style={styles.backGradient}
      >
        <Text style={styles.backTitle}>Current Plan</Text>
        <Text style={styles.backPlanName}>{profile.plan}</Text>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            style={[styles.backButton, profile.isPremium && styles.premiumButton]} 
            onPress={() => router.push('/(tabs)/account/plans')}
          >
            <Text style={[styles.backButtonText, profile.isPremium && styles.premiumButtonText]}>
              {profile.isPremium ? 'Manage Plan' : 'Upgrade Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.profileContainer}>
      {renderFront()}
      {renderBack()}
    </View>
  );
});

export default ProfileCard;

const styles = StyleSheet.create({
  profileContainer: {
    height: 160, // Fixed height for flipping
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
  },
  cardBack: {
    backgroundColor: '#C6222F',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    flex: 1,
    position: 'relative',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F0F0F0',
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#C6222F',
    borderRadius: 15,
    padding: 8,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  verifiedBadge: {
    marginLeft: 8,
  },
  profileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  profileDetail: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileAge: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginTop: 2,
    fontWeight: '500',
  },
  profileLocation: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginTop: 4,
    fontWeight: '400',
  },
  profileId: { fontSize: 14, color: 'gray', marginTop: 5 },
    planContainer: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderColor: '#FEEBC8',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  planText: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 12,
  },
  backGradient: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  backPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    width: '80%',
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#422006',
  },
  backButtonText: {
    color: '#C53030',
    fontWeight: 'bold',
    fontSize: 16,
  },
  premiumButtonText: {
    color: 'white',
  },
});
