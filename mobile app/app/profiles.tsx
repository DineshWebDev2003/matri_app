import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import UniversalHeader from '../components/UniversalHeader';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

export default function ProfilesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const auth = useAuth();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());

  const filters = ['All', 'Online', 'Newest', 'Nearest', 'Match'];

  useEffect(() => {
    fetchProfiles();
  }, [selectedFilter]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching profiles using members endpoint...');
      
      // Use the correct getMembers endpoint
      const response = await apiService.getMembers(1, 100);
      
      if (response?.status === 'success' && response?.data?.profiles) {
        setProfiles(response.data.profiles);
        console.log(`✅ Loaded ${response.data.profiles.length} profiles`);
      } else {
        console.error('❌ Unexpected response format:', response);
        Alert.alert('Error', 'Failed to load profiles');
      }
    } catch (error) {
      console.error('❌ Error fetching profiles:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = (profile: any) => {
    if (profile?.image) {
      if (profile.image.startsWith('http')) {
        return profile.image;
      }
      const imageBaseUrl =
        process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL ||
        'http://10.97.175.139:8000/assets/images/user/profile';
      return `${imageBaseUrl}/${profile.image}`;
    }
    // Return gender-wise default image
    const userGender = profile?.gender?.toLowerCase();
    return userGender === 'female'
      ? require('../assets/images/default-female.jpg')
      : require('../assets/images/default-male.jpg');
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getMatchPercentage = (profile: any) => {
    // Generate random match percentage (90-99%)
    return Math.floor(Math.random() * 10) + 90;
  };

  const getGradientColors = (index: number) => {
    const gradients = [
      ['#8B5CF6', '#DC2626'], // Purple to Red
      ['#10B981', '#059669'], // Green
      ['#3B82F6', '#1E40AF'], // Blue
      ['#F59E0B', '#DC2626'], // Orange to Red
      ['#EC4899', '#BE123C'], // Pink to Red
      ['#6366F1', '#4F46E5'], // Indigo
    ];
    return gradients[index % gradients.length];
  };

  const renderProfileCard = ({ item, index }: { item: any; index: number }) => {
    const profileImage = getProfileImage(item);
    const age = calculateAge(item?.date_of_birth || item?.dateOfBirth);
    const location = item?.city || item?.location || 'Location';
    const name = `${item?.firstname || ''} ${item?.lastname || ''}`.trim() || 'User';
    const matchPercentage = getMatchPercentage(item);
    const isLiked = likedProfiles.has(item.id?.toString());
    const gradientColors = getGradientColors(index);

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          console.log(`👤 Navigating to profile ${item.id}`);
          router.push(`/profile-detail?profileId=${item.id}`);
        }}
        activeOpacity={0.9}
      >
        {/* Card Image */}
        <Image
          source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
          style={styles.cardImage}
          defaultSource={require('../assets/images/default-male.jpg')}
        />

        {/* Match Percentage Badge */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.matchBadge}
        >
          <Text style={styles.matchPercentageText}>{matchPercentage}% Match</Text>
        </LinearGradient>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName}>{name}</Text>
            <MaterialCommunityIcons name="check-circle" size={16} color="#FCD34D" />
          </View>
          <Text style={styles.profileAge}>{age} yrs</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.profileLocation}>{location}</Text>
          </View>
        </View>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => {
            const newLiked = new Set(likedProfiles);
            if (isLiked) {
              newLiked.delete(item.id?.toString());
            } else {
              newLiked.add(item.id?.toString());
            }
            setLikedProfiles(newLiked);
            console.log(`❤️ ${isLiked ? 'Unliked' : 'Liked'} profile ${item.id}`);
          }}
        >
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#DC2626' : 'white'}
            fill={isLiked ? '#DC2626' : 'none'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <ActivityIndicator size="large" color="#DC2626" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}
        translucent={false}
      />

      {/* Header */}
      <UniversalHeader
        title="Matches"
        showProfileImage={false}
        rightIcon="sliders"
        onRightIconPress={() => {
          console.log('🔍 Opening filters');
          router.push('/search');
        }}
      />

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.toLowerCase() && styles.filterButtonActive,
                theme === 'dark' && selectedFilter === item.toLowerCase()
                  ? { backgroundColor: '#8B5CF6' }
                  : {},
              ]}
              onPress={() => setSelectedFilter(item.toLowerCase())}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.toLowerCase() && styles.filterButtonTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={64} color="#9CA3AF" />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Profiles</Text>
          <Text style={[styles.emptyText, { color: '#6B7280' }]}>
            No profiles available at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNavBar, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
        <TouchableOpacity style={styles.navButton}>
          <Feather name="home" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="message-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButtonCenter}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerButtonGradient}
          >
            <MaterialCommunityIcons name="heart" size={28} color="white" fill="white" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="message-square" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="user" size={24} color="#9CA3AF" />
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
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  cardContainer: {
    width: cardWidth,
    height: cardWidth * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  matchPercentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  profileInfoContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 4,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.3,
  },
  profileAge: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLocation: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  likeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    color: '#6B7280',
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonCenter: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  centerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
