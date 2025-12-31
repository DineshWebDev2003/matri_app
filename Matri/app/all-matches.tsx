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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UniversalHeader from '../components/UniversalHeader';

export default function AllMatchesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const auth = useAuth();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      console.log('📋 Loading all matches...');
      
      if (params.profiles) {
        const parsedProfiles = JSON.parse(params.profiles as string);
        setProfiles(parsedProfiles);
        
        if (params.currentIndex) {
          setCurrentIndex(parseInt(params.currentIndex as string));
        }
        
        console.log(`✅ Loaded ${parsedProfiles.length} profiles`);
      }
    } catch (error) {
      console.error('❌ Error loading profiles:', error);
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

  const renderProfileCard = ({ item, index }: { item: any; index: number }) => {
    const profileImage = getProfileImage(item);
    const age = calculateAge(item?.date_of_birth || item?.dateOfBirth);
    const location = item?.city || item?.location || 'N/A';
    const name = `${item?.firstname || ''} ${item?.lastname || ''}`.trim() || 'User';

    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F8F9FA' },
        ]}
        onPress={() => {
          console.log(`👤 Navigating to profile ${item.id}`);
          router.push(`/profile-detail?profileId=${item.id}`);
        }}
      >
        {/* Profile Image - No Circle Container */}
        <Image
          source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
          style={styles.profileImage}
          defaultSource={require('../assets/images/default-male.jpg')}
        />

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, theme === 'dark' && { color: '#FFFFFF' }]}>
            {name}, {age}
          </Text>

          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={14}
              color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
            <Text style={[styles.profileLocation, theme === 'dark' && { color: '#9CA3AF' }]}>
              {location}
            </Text>
          </View>

          {item.caste && (
            <Text style={[styles.profileCaste, theme === 'dark' && { color: '#9CA3AF' }]}>
              {item.caste}
            </Text>
          )}

          {item.religion && (
            <Text style={[styles.profileReligion, theme === 'dark' && { color: '#9CA3AF' }]}>
              {item.religion}
            </Text>
          )}
        </View>

        {/* Arrow Icon - Replace default arrow */}
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={24} color="#DC2626" />
        </View>
      </TouchableOpacity>
    );
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
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

      {/* Universal Header */}
      <UniversalHeader
        title="All Matches"
        showProfileImage={false}
        leftIcon="arrow-left"
        onLeftIconPress={() => router.back()}
      />

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={64} color={themeStyles.secondaryText.color} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Profiles</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            No profiles available at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    gap: 12,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  profileCaste: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  profileReligion: {
    fontSize: 11,
    color: '#6B7280',
  },
  arrowContainer: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
});
