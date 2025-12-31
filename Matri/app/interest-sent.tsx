import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function InterestSentScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Sent');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterestedProfiles();
  }, []);

  const computeAge = (obj: any): number | null => {
    const dobStr = obj.dob || obj.date_of_birth || obj.birthDate || obj.birth_date;
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  };

  const fetchProfileDetails = async (profileId: string) => {
    try {
      const response = await apiService.getProfile(profileId);
      if (response?.status === 'success' && response?.data?.profile) {
        return response.data.profile;
      }
    } catch (error) {
      console.error(`Error fetching profile ${profileId}:`, error);
    }
    return null;
  };

  const fetchInterestedProfiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInterestedProfiles();
      
      if (response?.status === 'success' && response?.data?.profiles) {
        // First pass: Process basic info
        let enriched = response.data.profiles.map((p: any) => {
          const age = p.age || computeAge(p);
          return { ...p, age, loadingDetails: true };
        });
        
        setProfiles(enriched); // Show basic info immediately
        
        // Second pass: Fetch and update with full details
        const updatedProfiles = await Promise.all(
          enriched.map(async (profile: any) => {
            try {
              const fullProfile = await fetchProfileDetails(profile.id);
              if (fullProfile) {
                return {
                  ...profile,
                  religion: fullProfile.religion || profile.religion || 'N/A',
                  caste: fullProfile.caste || profile.caste || 'N/A',
                  height: fullProfile.height || profile.height || 'N/A',
                  location: fullProfile.location || profile.location || 'N/A',
                  loadingDetails: false
                };
              }
            } catch (error) {
              console.error(`Error processing profile ${profile.id}:`, error);
            }
            return { ...profile, loadingDetails: false };
          })
        );
        
        setProfiles(updatedProfiles);
      }
    } catch (error) {
      console.error('Error in fetchInterestedProfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
    return `${imageBaseUrl}/${image}`;
  };

  return (
    <SafeAreaView style={[styles.container, theme==='dark' && { backgroundColor:'#000' }]}>
      <View style={[styles.header, theme==='dark' && { backgroundColor:'#121212', borderBottomColor:'#2A2A2A' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme==='dark' ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme==='dark' && { color:'#FFFFFF' }]}>Interests</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, theme==='dark' && { color:'#D1D5DB'}]}>
          You've expressed interest in these profiles.
        </Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('Sent')}>
            <Text style={[styles.tab, activeTab === 'Sent' && styles.activeTab]}>Sent</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id?.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => {
              const profileImage = getImageUrl(item.image);
              const defaultImage = item.gender?.toLowerCase() === 'female'
                ? require('../assets/images/default-female.jpg')
                : require('../assets/images/default-male.jpg');

              return (
                <TouchableOpacity 
                  style={[styles.profileCard, theme==='dark' && { backgroundColor:'#1A1A1A', borderColor:'#2A2A2A' }]}
                  onLongPress={()=>{/* TODO: toggle shortlist */}}
                  onPress={() => router.push(`/profile/${item.id}`)}
                >
                  <Image 
                    source={profileImage ? { uri: profileImage } : defaultImage}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  {false && (
                  <View style={styles.profileInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.profileName} numberOfLines={1}>{item.name}</Text>
                      {item.loadingDetails && (
                        <ActivityIndicator size="small" color={theme === 'dark' ? '#fff' : '#000'} style={styles.loadingIndicator} />
                      )}
                    </View>
                    
                    <View style={styles.detailsRow}>
                      {item.age && (
                        <Text style={styles.profileAge}>{item.age} years</Text>
                      )}
                      {item.location && item.location !== 'N/A' && (
                        <View style={styles.locationRow}>
                          <Feather name="map-pin" size={12} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                          <Text style={[styles.profileLocation, theme === 'dark' && { color: '#9CA3AF' }]} numberOfLines={1}>
                            {item.location}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Status Badge */}
                    {typeof item.interest_status !== 'undefined' && (
                      <View style={styles.statusBadgeContainer}>
                        <Text style={[styles.statusBadge, 
                          item.interest_status === 0 && styles.statusPending,
                          item.interest_status === 1 && styles.statusAccepted,
                          item.interest_status === 2 && styles.statusRejected,
                          theme==='dark' && {borderColor:'#444'}
                        ]}>
                          {item.interest_status === 1 ? 'Accepted' : item.interest_status === 2 ? 'Rejected' : 'Pending'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No interests sent yet</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    fontSize: 16,
    color: 'gray',
    marginRight: 20,
    paddingBottom: 5,
  },
  activeTab: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
  },
  profileImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: '80%',
  },
  profileAge: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  extraInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLocation: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 40,
  },
});
