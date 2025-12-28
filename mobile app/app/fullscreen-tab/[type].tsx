import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import HeartIcon from '../../components/HeartIcon';

const ProfileCard = ({ item, onPress, onInterestToggle, isInterested }: { item: any, onPress: () => void, onInterestToggle: () => void, isInterested: boolean }) => {
  const profileName = item?.name || `${item?.firstname || 'Unknown'} ${item?.lastname || ''}`.trim();
  const profileId = item?.idNo || `USR${item?.id?.toString().padStart(5, '0') || '00000'}`;
  // Clean up malformed image URLs by removing any trailing special characters
  const cleanImageName = item?.image ? item.image.replace(/[}\])]$/g, '') : null;
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile';
  const profileImage = item?.images?.[0] || (cleanImageName ? `${imageBaseUrl}/${cleanImageName}` : null);
  const age = item?.age || 'N/A';
  const height = item?.height || 'N/A';
  const location = item?.location || item?.city || 'N/A';
  const isVerified = item?.verified === 1 || item?.verified === true || item?.is_verified === 1 || item?.kycVerified || item?.emailVerified || item?.mobileVerified;
  
  const getMembershipTier = () => {
    // Check package_id first (most reliable), then fall back to premium flag and membership_type
    const packageId = item?.package_id || 4;
    if (packageId && packageId !== 4 && packageId > 0) return 'premium';
    if (item?.premium || item?.membership_type === 'premium') return 'premium';
    if (item?.elite || item?.membership_type === 'elite') return 'elite';
    return 'basic';
  };
  
  const membershipTier = getMembershipTier();
  
  return (
    <TouchableOpacity style={[styles.profileCard, membershipTier === 'premium' && styles.premiumCard]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <ProfileImage 
          imageUrl={profileImage}
          name={profileName}
          size={80}
          isVerified={isVerified}
          showBadge={true}
        />
        <View style={[
          styles.membershipTag,
          membershipTier === 'premium' ? styles.premiumTag : 
          membershipTier === 'elite' ? styles.eliteTag : styles.basicTag
        ]}>
          <Text style={[
            styles.membershipTagText,
            membershipTier === 'premium' ? styles.premiumTagText : styles.basicTagText
          ]}>
            {membershipTier.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.profileInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.profileName}>{profileName}</Text>
          {isVerified && (
            <Feather name="check-circle" size={16} color="#007AFF" style={{ marginLeft: 5 }} />
          )}
        </View>
        <Text style={styles.profileDetail}>Age: {age}</Text>
        <Text style={styles.profileDetail}>Height: {height}</Text>
        <Text style={styles.profileDetail}>Location: {location}</Text>
        <Text style={styles.profileDetail}>ID: {profileId}</Text>
      </View>
      <TouchableOpacity style={styles.heartIcon} onPress={onInterestToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <HeartIcon 
          isInterested={isInterested}
          isBlocked={false}
          size={24}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function FullscreenTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type } = params;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [interestingProfiles, setInterestingProfiles] = useState<Set<string>>(new Set());
  const [interestStats, setInterestStats] = useState({ total: 0, interested: 0 });
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: '',
    religion: '',
    caste: ''
  });

  const getTabTitle = () => {
    switch (type) {
      case 'recommended': return 'Recommended';
      case 'newly_joined': return 'Newly Joined';
      case 'all': return 'All Profiles';
      default: return 'Profiles';
    }
  };

  const getTabIcon = () => {
    switch (type) {
      case 'recommended': return 'star';
      case 'newly_joined': return 'user-plus';
      case 'all': return 'users';
      default: return 'users';
    }
  };

  useEffect(() => {
    fetchProfiles(1, true);
    loadInterestedProfiles();
  }, [type]);

  const loadInterestedProfiles = async () => {
    try {
      const response = await apiService.getInterestedProfiles();
      if (response?.data?.profiles) {
        const interestedIds = new Set<string>(response.data.profiles.map((p: any) => p.id?.toString()).filter(Boolean));
        setInterestingProfiles(interestedIds);
        console.log('📋 Loaded interested profile IDs:', Array.from(interestedIds));
      }
    } catch (error) {
      console.error('💥 Error loading interested profiles:', error);
    }
  };

  const handleInterestToggle = async (profile: any) => {
    const profileId = profile.id?.toString();
    if (!profileId) return;

    try {
      const isCurrentlyInterested = interestingProfiles.has(profileId);
      
      if (isCurrentlyInterested) {
        await apiService.removeInterest(profileId);
        setInterestingProfiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        setInterestStats(prev => ({ ...prev, interested: prev.interested - 1 }));
        console.log('💔 Interest removed for profile:', profileId);
      } else {
        await apiService.expressInterest(profileId);
        setInterestingProfiles(prev => new Set(prev).add(profileId));
        setInterestStats(prev => ({ ...prev, interested: prev.interested + 1 }));
        console.log('💖 Interest expressed for profile:', profileId);
      }

      setProfiles(prev => prev.map((p: any) => 
        p.id?.toString() === profileId 
          ? { ...p, isInterested: !isCurrentlyInterested }
          : p
      ));

    } catch (error) {
      console.error('💥 Interest toggle error:', error);
    }
  };

  const fetchProfiles = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        if (reset) {
          setProfiles([]);
          setPage(1);
          setHasMore(true);
        }
      } else {
        setLoadingMore(true);
      }

      let profileType = 'all';
      if (type === 'recommended') profileType = 'new_matches';
      else if (type === 'newly_joined') profileType = 'newly_joined';

      const response = await apiService.getProfiles({
        type: profileType,
        limit: 20,
        page: pageNum,
        search: searchQuery,
        ...filters
      });

      if (response?.data?.profiles?.length > 0) {
        const newProfiles = response.data.profiles;
        
        if (pageNum === 1) {
          setProfiles(newProfiles);
          setInterestStats({ total: newProfiles.length, interested: interestingProfiles.size });
        } else {
          setProfiles(prev => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const filteredNew = newProfiles.filter((p: any) => !existingIds.has(p.id));
            const updatedProfiles = [...prev, ...filteredNew];
            setInterestStats({ total: updatedProfiles.length, interested: interestingProfiles.size });
            return updatedProfiles;
          });
        }
        
        setPage(pageNum);
        setHasMore(newProfiles.length === 20);
      } else {
        if (pageNum === 1) setProfiles([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      if (pageNum === 1) setProfiles([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    fetchProfiles(1, true);
  };

  const handleFilterApply = () => {
    setShowFilters(false);
    fetchProfiles(1, true);
  };

  const loadMoreProfiles = () => {
    if (loadingMore || !hasMore) return;
    fetchProfiles(page + 1);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Feather name={getTabIcon()} size={24} color={Colors.light.tint} />
          <Text style={styles.headerTitle}>{getTabTitle()}</Text>
          {interestStats.total > 0 && (
            <View style={styles.interestRate}>
              <Text style={styles.interestRateText}>
                {Math.round((interestStats.interested / interestStats.total) * 100)}% interested
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Feather name="filter" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput 
            placeholder="Search by name, caste, or profile ID..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="search" size={20} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView horizontal style={styles.filtersContainer} showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Min Age</Text>
              <TextInput
                style={styles.filterInput}
                value={filters.minAge}
                onChangeText={(text) => setFilters(prev => ({...prev, minAge: text}))}
                placeholder="18"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Max Age</Text>
              <TextInput
                style={styles.filterInput}
                value={filters.maxAge}
                onChangeText={(text) => setFilters(prev => ({...prev, maxAge: text}))}
                placeholder="35"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                style={styles.filterInput}
                value={filters.location}
                onChangeText={(text) => setFilters(prev => ({...prev, location: text}))}
                placeholder="City"
              />
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={handleFilterApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Profiles List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      ) : profiles.length > 0 ? (
        <FlatList
          data={profiles}
          renderItem={({ item }) => (
            <ProfileCard 
              item={item} 
              onPress={() => router.push(`/profile/${item?.id || '1'}`)}
              onInterestToggle={() => handleInterestToggle(item)}
              isInterested={interestingProfiles.has(item?.id?.toString() || '')}
            />
          )}
          keyExtractor={(item, index) => `fullscreen-${item?.id || `temp-${index}-${Date.now()}`}`}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
          onEndReached={loadMoreProfiles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No profiles found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 8,
    color: Colors.light.text 
  },
  searchSection: { padding: 20, backgroundColor: 'white' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 16 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, margin: 5 },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  filterItem: {
    marginRight: 15,
  },
  filterLabel: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 5,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 80,
  },
  applyButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  premiumCard: { backgroundColor: '#FFFBEB' },
  profileImage: { width: 80, height: 100, borderRadius: 10 },
  profileInfo: { flex: 1, marginLeft: 15, alignSelf: 'flex-start' },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileDetail: { color: Colors.light.icon, marginTop: 4, fontSize: 14 },
  heartIcon: { position: 'absolute', top: 15, right: 15 },
  imageContainer: { position: 'relative' },
  membershipTag: {
    position: 'absolute',
    top: -5,
    left: -5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  basicTag: { backgroundColor: '#FF4444' },
  premiumTag: { backgroundColor: '#FFD700' },
  eliteTag: { backgroundColor: '#FF4444' },
  membershipTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  basicTagText: { color: 'white' },
  premiumTagText: { color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.light.icon },
  interestRate: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  interestRateText: {
    fontSize: 12,
    color: '#2D7D32',
    fontWeight: 'bold',
  },
});
