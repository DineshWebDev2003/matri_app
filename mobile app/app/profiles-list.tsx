import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Calculate age function
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


export default function ProfilesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type } = params;
  const { theme } = useTheme();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interestingProfiles, setInterestingProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentPage(1);
    setProfiles([]);
    fetchProfiles(1);
  }, [type]);

  const fetchProfiles = async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      console.log(`🔄 Fetching ${type} profiles (page ${page}) using apiService...`);

      // Determine API parameters based on type
      let apiParams: any = {
        limit: 20,
        page: page,
      };

      // Fetch all members without complex filters
      apiParams.type = 'all';

      console.log('📊 API Parameters:', apiParams);
      console.log('🌐 Fetching all members directly without gender filtering');

      // Fetch profiles using apiService
      const response = await apiService.getProfiles(apiParams);
      
      if (response && response.status === 'success' && response.data?.profiles) {
        console.log(`✅ API Success: Found ${response.data.profiles.length} profiles`);
        
        // Process profiles with interest status - NO GENDER FILTERING
        const processedProfiles = response.data.profiles.map((profile: any) => ({
          ...profile,
          isInterested: interestingProfiles.has(profile.id?.toString() || '')
        }));

        console.log(`📊 Total profiles: ${processedProfiles.length}`);

        // Append to existing profiles if loading more, otherwise replace
        if (page === 1) {
          setProfiles(processedProfiles);
        } else {
          setProfiles(prev => [...prev, ...processedProfiles]);
        }
        
        // Check if there are more profiles to load
        setHasMore(processedProfiles.length >= 20);
        
        if (processedProfiles.length === 0) {
          console.log('⚠️ No profiles found');
        }
      } else {
        console.log('❌ API Error or no data:', response?.status || 'Unknown error');
        console.log('📥 Response:', response);
        if (page === 1) {
          setProfiles([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('💥 Error fetching profiles:', error);
      if (page === 1) {
        setProfiles([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProfiles(nextPage);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setProfiles([]);
    fetchProfiles(1);
  };

  const handleHeartPress = async (item: any) => {
    const profileId = item.id?.toString();
    if (!profileId) return;

    try {
      const isCurrentlyInterested = interestingProfiles.has(profileId);
      
      if (isCurrentlyInterested) {
        // Remove interest
        await apiService.removeInterest(profileId);
        setInterestingProfiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        console.log('💔 Interest removed for profile:', profileId);
      } else {
        // Express interest
        await apiService.expressInterest(profileId);
        setInterestingProfiles(prev => new Set(prev).add(profileId));
        console.log('💖 Interest expressed for profile:', profileId);
      }
      
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('💥 Error updating interest:', error);
      // Revert the UI change if API call failed
      // The UI will stay in its current state since we only update on success
    }
  };

  const getScreenTitle = () => {
    switch (type) {
      case 'recommended':
        return 'Recommended Profiles';
      case 'new_matches':
        return 'New Matches';
      case 'all':
        return 'All Matches';
      default:
        return 'Profiles';
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={Colors.light.tint} />
        <Text style={[styles.footerText, { color: theme === 'dark' ? '#B0B0B0' : '#6B7280' }]}>Loading more profiles...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F8FAFC' }]}>
        <Feather name="users" size={48} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
        <Text style={[styles.emptyTitle, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>No profiles found</Text>
        <Text style={[styles.emptyText, { color: theme === 'dark' ? '#B0B0B0' : '#6B7280' }]}>Try adjusting your filters or check back later</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F8FAFC' }]}>
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#2A2A2A' : 'white', borderBottomColor: theme === 'dark' ? '#3A3A3A' : '#F3F4F6' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>{getScreenTitle()}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={profiles}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: theme === 'dark' ? '#2A2A2A' : 'white' }]}
            onPress={() => router.push(`/profile/${item?.id || '1'}`)}
            activeOpacity={0.95}
          >
            <View style={styles.imageContainer}>
              {(() => {
                const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile';
                const profileImage = item?.images?.[0] || 
                  (item?.image ? `${imageBaseUrl}/${item?.image?.replace(/[}\])]$/g, '')}` : null);
                const userGender = item?.gender?.toLowerCase();
                const defaultImage = userGender === 'female' 
                  ? require('../assets/images/default-female.jpg')
                  : require('../assets/images/default-male.jpg');
                
                return profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image 
                    source={defaultImage}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                );
              })()}
              
              {/* Heart Icon */}
              <TouchableOpacity 
                style={styles.heartIcon} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleHeartPress(item);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.heartBackground,
                  interestingProfiles.has(item?.id?.toString()) && styles.heartBackgroundActive
                ]}>
                  <Feather 
                    name="heart" 
                    size={16} 
                    color={interestingProfiles.has(item?.id?.toString()) ? 'white' : '#FF6B6B'}
                    fill={interestingProfiles.has(item?.id?.toString()) ? 'white' : 'none'}
                  />
                </View>
              </TouchableOpacity>
              
              {/* Gradient Overlay with Profile Info */}
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(220,38,38,0.7)', 'rgba(220,38,38,0.95)']}
                style={styles.gradientOverlay}
              >
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayName} numberOfLines={1}>
                    {item?.name || `${item?.firstname || 'Unknown'} ${item?.lastname || ''}`.trim()}
                  </Text>
                  <View style={styles.overlayDetails}>
                    <Text style={styles.overlayAge}>
                      {calculateAge(item?.dateOfBirth || item?.dob) || item?.age || 'N/A'}
                    </Text>
                    <Text style={styles.overlayLocation} numberOfLines={1}>
                      📍 {item?.city || item?.location || item?.state || 'Unknown'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.light.tint} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
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
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.icon,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  // Grid Card Styles (2-column layout like your image)
  gridCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 15,
    marginRight: 10,
    width: '46%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  heartIcon: {
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
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  heartBackgroundActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
