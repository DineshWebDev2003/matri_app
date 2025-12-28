import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function InterestReceivedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to derive age from date fields
  const computeAge = (obj: any): number | null => {
    const dobStr = obj.dob || obj.date_of_birth || obj.birthDate || obj.birth_date;
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  useEffect(() => {
    fetchInterestRequests();
  }, []);

  const fetchInterestRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInterestRequests();
      if (response?.status === 'success' && response?.data?.profiles) {
        const enriched = response.data.profiles.map((p: any) => {
          const age = p.age || computeAge(p);
          return { ...p, age };
        });
        setProfiles(enriched);
      }
    } catch (error) {
      console.error('Error fetching interest requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (profileId: number) => {
    try {
      const response = await apiService.acceptInterest(profileId);
      if (response?.status === 'success') {
        Alert.alert('Success', 'Interest accepted successfully');
        fetchInterestRequests();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept interest');
    }
  };

  const handleDecline = async (profileId: number) => {
    try {
      const response = await apiService.rejectInterest(profileId);
      if (response?.status === 'success') {
        Alert.alert('Success', 'Interest declined');
        fetchInterestRequests();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to decline interest');
    }
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
    return `${imageBaseUrl}/${image}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interest Received</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={item => item.id?.toString()}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchInterestRequests();
          }}
          renderItem={({ item }) => {
            const profileImage = getImageUrl(item.image);
            const defaultImage = item.gender?.toLowerCase() === 'female'
              ? require('../assets/images/default-female.jpg')
              : require('../assets/images/default-male.jpg');

            return (
              <View style={styles.interestCard}>
                <TouchableOpacity onPress={() => router.push(`/profile/${item.id}`)}>
                  <Image 
                    source={profileImage ? { uri: profileImage } : defaultImage}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View style={styles.interestInfo}>
                  <Text style={styles.interestName}>{item.name}</Text>
                  {item.age && (
                    <Text style={styles.interestAge}>{item.age} years</Text>
                  )}
                  {item.location && item.location !== 'N/A' && (
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={12} color="#6B7280" />
                      <Text style={styles.interestLocation} numberOfLines={1}>{item.location}</Text>
                    </View>
                  )}
                  {/* Status Badge */}
                  {typeof item.interest_status !== 'undefined' && (
                    <View style={styles.statusBadgeContainer}>
                      <Text style={[styles.statusBadge,
                        item.interest_status === 0 && styles.statusPending,
                        item.interest_status === 1 && styles.statusAccepted,
                        item.interest_status === 2 && styles.statusRejected,
                      ]}>
                        {item.interest_status === 1 ? 'Accepted' : item.interest_status === 2 ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.extraInfo}>Interest Date: {item.interestDate || item.created_at || 'N/A'}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.acceptButton}
                      onPress={() => handleAccept(item.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.declineButton}
                      onPress={() => handleDecline(item.id)}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No interest requests received</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        />
      )}
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
    fontWeight: 'bold' 
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  interestInfo: {
    flex: 1,
  },
  interestName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  interestAge: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  extraInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadgeContainer: {
    marginBottom: 6,
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    textAlign: 'center',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    color: '#92400E',
  },
  statusAccepted: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    color: '#166534',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    color: '#991B1B',
  },
  interestLocation: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  declineButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  declineButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 40,
  },
});
