import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '@/constants/Colors';
import { apiService } from '../services/api';

export default function IgnoredProfilesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const auth = useAuth();
  const [ignoredProfiles, setIgnoredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIgnoredProfiles();
  }, []);

  const fetchIgnoredProfiles = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching ignored profiles...');
      
      const response = await apiService.getIgnoredProfiles();
      
      if (response.status === 'success') {
        const profiles = response.data?.profiles || [];
        console.log('✅ Ignored profiles loaded:', profiles.length);
        
        // Transform profiles data
        const transformedProfiles = profiles.map((profile: any) => {
          // Calculate age from DOB if available
          let age = profile.age || 'N/A';
          if (!age || age === 'N/A') {
            if (profile.birth_date || profile.dob) {
              const birthDate = new Date(profile.birth_date || profile.dob);
              const today = new Date();
              age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            }
          }
          
          // Handle image URL
          let imageUrl = null;
          if (profile.image) {
            if (profile.image.startsWith('http')) {
              imageUrl = profile.image;
            } else {
              imageUrl = `http://10.97.175.139:8000/assets/images/user/profile/${profile.image}`;
            }
          }
          
          return {
            id: profile.id || profile.user_id,
            name: profile.name || profile.full_name || `${profile.firstname || ''} ${profile.lastname || ''}`.trim() || 'User',
            age: age,
            location: profile.location || profile.city || profile.present_city || 'N/A',
            profileImage: imageUrl,
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
        });
        
        setIgnoredProfiles(transformedProfiles);
      } else {
        console.log('⚠️ Failed to load ignored profiles:', response.message);
        setIgnoredProfiles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching ignored profiles:', error);
      Alert.alert('Error', 'Failed to load ignored profiles');
      setIgnoredProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
  };

  return (
    <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.header, theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F8F9FA' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themeStyles.text]}>Ignored Profiles</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Loading...</Text>
        </View>
      ) : ignoredProfiles.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="inbox" size={64} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Ignored Profiles</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            You haven't ignored any profiles yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ignoredProfiles}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.profileCard, theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#FFFFFF' }]}
              onPress={() => router.push(`/profile-detail?profileId=${item.id}`)}
            >
              {/* Profile Image */}
              {item.profileImage && (
                <Image
                  source={{ uri: item.profileImage }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
              
              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <View style={styles.profileHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.profileName, themeStyles.text]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.profileDetails, themeStyles.secondaryText]}>
                      {item.age} yrs • {item.location}
                    </Text>
                  </View>
                  <Feather name="slash-circle" size={20} color="#EF4444" />
                </View>
                
                {/* Tags */}
                <View style={styles.tagsContainer}>
                  {item.religion && item.religion !== 'N/A' && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.religion}</Text>
                    </View>
                  )}
                  {item.caste && item.caste !== 'N/A' && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.caste}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
});
