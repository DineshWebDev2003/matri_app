import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import UniversalHeader from '../components/UniversalHeader';

const { width } = Dimensions.get('window');

export default function AIMatchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAIMatches();
  }, []);

  const fetchAIMatches = async () => {
    try {
      setLoading(true);
      // Fetch recommended profiles which are AI-matched
      const response = await apiService.getProfiles({ type: 'recommended', limit: 50 });
      
      if (response?.status === 'success' && response?.data?.profiles) {
        setProfiles(response.data.profiles);
      } else if (response?.data?.profiles) {
        setProfiles(response.data.profiles);
      }
    } catch (error) {
      console.error('Error fetching AI matches:', error);
      Alert.alert('Error', 'Failed to load AI matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (profileId: string | number) => {
    try {
      const response = await apiService.sendInterest(profileId);
      if (response?.status === 'success') {
        Alert.alert('Success', 'Interest sent successfully!');
        // Move to next profile
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send interest');
    }
  };

  const handleSkip = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('No More Profiles', 'You have viewed all AI matched profiles');
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
  };

  if (loading) {
    return (
      <View style={[styles.container, themeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={[styles.container, themeStyles.container]}>
        <UniversalHeader 
          title="AI Match"
          showProfileImage={false}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => {}}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Feather name="inbox" size={64} color="#DC2626" />
          <Text style={[styles.emptyText, themeStyles.text, { marginTop: 16 }]}>
            No AI matches available
          </Text>
          <Text style={[styles.emptySubtext, themeStyles.secondaryText, { marginTop: 8 }]}>
            Check back later for new matches
          </Text>
        </View>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];
  const profileImage = currentProfile?.image || currentProfile?.profileImage;
  const profileName = currentProfile?.name || `${currentProfile?.firstname || ''} ${currentProfile?.lastname || ''}`.trim();
  const age = currentProfile?.age || 'N/A';
  const location = currentProfile?.location || currentProfile?.city || 'N/A';
  const religion = currentProfile?.religion || 'N/A';
  const height = currentProfile?.height || 'N/A';

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <UniversalHeader 
        title="AI Match"
        showProfileImage={false}
        onProfilePress={() => router.push('/account')}
        onMenuPress={() => {}}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Profile Card */}
        <View style={styles.cardContainer}>
          <View style={styles.imageWrapper}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="user" size={64} color="#9CA3AF" />
              </View>
            )}
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileName}, {age}</Text>
                <Text style={styles.profileLocation}>📍 {location}</Text>
              </View>
            </LinearGradient>

            {/* Match Score Badge */}
            <View style={styles.matchScoreBadge}>
              <Text style={styles.matchScoreText}>AI Match</Text>
            </View>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Feather name="heart" size={20} color="#DC2626" />
              <Text style={[styles.detailLabel, themeStyles.secondaryText]}>Religion</Text>
              <Text style={[styles.detailValue, themeStyles.text]}>{religion}</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="maximize" size={20} color="#DC2626" />
              <Text style={[styles.detailLabel, themeStyles.secondaryText]}>Height</Text>
              <Text style={[styles.detailValue, themeStyles.text]}>{height}</Text>
            </View>
          </View>

          {currentProfile?.bio && (
            <View style={styles.bioContainer}>
              <Text style={[styles.bioLabel, themeStyles.secondaryText]}>About</Text>
              <Text style={[styles.bioText, themeStyles.text]}>{currentProfile.bio}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.skipButton]}
            onPress={handleSkip}
          >
            <Feather name="x" size={24} color="#DC2626" />
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.interestButton]}
            onPress={() => handleSendInterest(currentProfile.id)}
          >
            <Feather name="heart" size={24} color="white" fill="white" />
            <Text style={styles.interestButtonText}>Send Interest</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, themeStyles.secondaryText]}>
            {currentIndex + 1} of {profiles.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / profiles.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 500,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  profileLocation: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchScoreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  bioContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#DC2626',
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16,
  },
  interestButton: {
    backgroundColor: '#DC2626',
  },
  interestButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
});
