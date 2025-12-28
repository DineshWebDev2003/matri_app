import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, RefreshControl, Image, StatusBar, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import HeartIcon from '../../components/HeartIcon';
import UniversalHeader from '../../components/UniversalHeader';
import MenuModal from '../../components/MenuModal';
import WithSwipe from '../../components/WithSwipe';
import { LinearGradient } from 'expo-linear-gradient';

export default function InterestedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const auth = useAuth();
  
  const isUserPremium = (): boolean => {
    const pkgIdUser = auth?.user?.package_id ?? auth?.user?.packageId;
    const pkgIdLimit = auth?.limitation?.package_id ?? auth?.limitation?.packageId;

    const premiumFlag = auth?.user?.premium === 1 || auth?.user?.premium === true;

    const hasPremiumPkg = (id?: number) => id !== undefined && id !== null && id !== 4 && id > 1;

    return premiumFlag || hasPremiumPkg(pkgIdUser) || hasPremiumPkg(pkgIdLimit);
  };
  const [activeTab, setActiveTab] = useState(params.tab as string || 'sent');
  const [sentProfiles, setSentProfiles] = useState([]);
  const [receivedProfiles, setReceivedProfiles] = useState([]);
  const [ignoredProfiles, setIgnoredProfiles] = useState([]);
  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  // Helper to compute age from various date fields
  const computeAge = (obj: any): number | null => {
    const dobStr = obj.dob || obj.date_of_birth || obj.birthDate || obj.birth_date;
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  useEffect(() => {
    console.log('🎯 Interest Screen Mounted - Starting data fetch');
    fetchAllInterests();
  }, []);

  const fetchAllInterests = async () => {
    try {
      setLoading(true);
      console.log('🚀 ===== FETCHING ALL INTEREST DATA =====');
      console.log('⏰ Timestamp:', new Date().toISOString());
      
      // Fetch sent interests (profiles I'm interested in)
      console.log('\n📤 FETCHING SENT INTERESTS...');
      console.log('🔗 Calling apiService.getHeartedProfiles()');
      const sentResponse = await apiService.getHeartedProfiles();
      console.log('📥 Sent interests API response:', sentResponse);
      console.log('📥 Sent interests API response status:', sentResponse?.status);
      console.log('📥 Sent interests full response:', JSON.stringify(sentResponse, null, 2));
      console.log('📥 Response keys:', Object.keys(sentResponse || {}));
      
      if (sentResponse.status === 'success') {
        const sentProfiles = sentResponse.data?.profiles || sentResponse.data || [];
        console.log('✅ Sent profiles count:', sentProfiles.length);
        console.log('📋 Sent profiles raw array:', JSON.stringify(sentProfiles, null, 2));
        
        const transformedSent = sentProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing sent profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    Status: ${profile.status}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);
          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          // Status mapping
          const status = profile.status === 1 || profile.status === 'accepted' ? 'Accepted' : 'Pending';
          
          const transformed = {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: status,
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'sent',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
          console.log(`    ✅ Transformed: ${JSON.stringify(transformed)}`);
          return transformed;
        });
        setSentProfiles(transformedSent);
        console.log(`\n✅ Sent interests loaded: ${transformedSent.length} profiles`);
        console.log('📊 Transformed sent profiles:', JSON.stringify(transformedSent, null, 2));
      } else {
        console.log('❌ Sent interests API error:', sentResponse.message);
      }

      // Fetch received interests (profiles interested in me)
      console.log('\n📥 FETCHING RECEIVED INTERESTS...');
      const receivedResponse = await apiService.getHeartRequests();
      console.log('📥 Received interests API response status:', receivedResponse.status);
      console.log('📥 Received interests full response:', JSON.stringify(receivedResponse, null, 2));
      
      if (receivedResponse.status === 'success') {
        const receivedProfiles = receivedResponse.data?.profiles || receivedResponse.data || [];
        console.log('✅ Received profiles count:', receivedProfiles.length);
        console.log('📋 Received profiles raw array:', JSON.stringify(receivedProfiles, null, 2));
        
        const transformedReceived = receivedProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing received profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    Status: ${profile.status}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);

          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          // Status mapping
          const status = profile.status === 1 || profile.status === 'accepted' ? 'Accepted' : 'Pending';
          
          return {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: status,
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'received',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
        });
        setReceivedProfiles(transformedReceived);
        console.log('✅ Received interests loaded:', transformedReceived.length);
        console.log('📋 Transformed received profiles:', transformedReceived);
      }

      // Fetch ignored profiles
      console.log('\n🚫 FETCHING IGNORED PROFILES...');
      const ignoredResponse = await apiService.getIgnoredHearts();
      console.log('📥 Ignored profiles API response status:', ignoredResponse.status);
      console.log('📥 Ignored profiles full response:', JSON.stringify(ignoredResponse, null, 2));
      
      if (ignoredResponse.status === 'success') {
        const ignoredProfiles = ignoredResponse.data?.profiles || ignoredResponse.data || [];
        console.log('✅ Ignored profiles count:', ignoredProfiles.length);
        console.log('📋 Ignored profiles raw array:', JSON.stringify(ignoredProfiles, null, 2));
        
        const transformedIgnored = ignoredProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing ignored profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);
          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          const transformed = {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: 'Ignored',
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'ignored',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
          console.log(`    ✅ Transformed: ${JSON.stringify(transformed)}`);
          return transformed;
        });
        setIgnoredProfiles(transformedIgnored);
        console.log(`\n✅ Ignored interests loaded: ${transformedIgnored.length} profiles`);
        console.log('📊 Transformed ignored profiles:', JSON.stringify(transformedIgnored, null, 2));
      } else {
        console.log('❌ Ignored profiles API error:', ignoredResponse.message);
      }

      // Final Summary
      console.log('\n📊 ===== FINAL SUMMARY =====');
      console.log(`✅ Sent profiles: ${sentProfiles.length}`);
      console.log(`✅ Received profiles: ${receivedProfiles.length}`);
      console.log(`✅ Ignored profiles: ${ignoredProfiles.length}`);
      console.log('🎉 ===== DATA FETCH COMPLETE =====\n');

    } catch (error: any) {
      console.error('💥 ===== ERROR FETCHING INTEREST DATA =====');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error response:', error?.response);
      console.error('📋 Error details:', JSON.stringify(error, null, 2));
      console.error('📋 Error stack:', error?.stack);
      setSentProfiles([]);
      setReceivedProfiles([]);
      setIgnoredProfiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('✅ fetchAllInterests completed');
    }
  };

  const handleRemoveInterest = async (profileId: string | number) => {
    Alert.alert(
      'Remove Interest',
      'Are you sure you want to remove your interest in this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.removeInterest(profileId.toString());
              if (response.status === 'success') {
                // Remove from sent profiles (only sent interests can be removed)
                setSentProfiles((prev: any) => prev.filter((p: any) => p.id !== profileId));
                console.log('✅ Interest removed successfully');
              }
            } catch (error) {
              console.error('💥 Error removing interest:', error);
              Alert.alert('Error', 'Failed to remove interest. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleIgnoreInterest = async (profileId: string | number) => {
    try {
      // Call API to ignore profile
      const response = await apiService.ignoreHeart(profileId);
      
      if (response.status === 'success') {
        // Find the profile to move to ignored list
        const profileToIgnore = receivedProfiles.find((p: any) => p.id === profileId);
        
        if (profileToIgnore) {
          // Add to ignored list
          setIgnoredProfiles((prev: any) => [...prev, { ...profileToIgnore, status: 'Ignored' }]);
          
          // Remove from received profiles
          setReceivedProfiles((prev: any) => prev.filter((p: any) => p.id !== profileId));
          
          console.log('✅ Profile ignored successfully');
          Alert.alert('Success', 'Profile has been added to your ignore list');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to ignore profile. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error ignoring profile:', error);
      Alert.alert('Error', 'Failed to ignore profile. Please try again.');
    }
  };

  const handleAcceptInterest = async (profileId: string | number) => {
    try {
      // Call API to accept interest
      const response = await apiService.acceptHeart(profileId);
      
      if (response.status === 'success') {
        // Update status to accepted
        setReceivedProfiles((prev: any) => 
          prev.map((p: any) => p.id === profileId ? { ...p, status: 'Accepted' } : p)
        );
        
        console.log('✅ Interest accepted successfully');
        Alert.alert('Success', 'Interest accepted! You can now chat with this user.');
      } else {
        Alert.alert('Error', response.message || 'Failed to accept interest. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error accepting interest:', error);
      Alert.alert('Error', 'Failed to accept interest. Please try again.');
    }
  };

  const handleShortlist = async (profileId: string | number) => {
    try {
      // Add to shortlist locally (no API call needed for now)
      const profileToShortlist = getCurrentProfiles().find((p: any) => p.id === profileId);
      
      if (profileToShortlist) {
        setShortlistedProfiles((prev: any) => {
          // Check if already in shortlist
          if (prev.some((p: any) => p.id === profileId)) {
            return prev.filter((p: any) => p.id !== profileId);
          }
          return [...prev, profileToShortlist];
        });
        
        console.log('✅ Profile shortlisted successfully');
        Alert.alert('Success', 'Profile added to your shortlist');
      }
    } catch (error) {
      console.error('💥 Error shortlisting profile:', error);
      Alert.alert('Error', 'Failed to shortlist profile. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllInterests();
  };

  const getCurrentProfiles = () => {
    if (activeTab === 'sent') return sentProfiles;
    if (activeTab === 'received') return receivedProfiles;
    if (activeTab === 'ignored') return ignoredProfiles;
    if (activeTab === 'shortlist') return shortlistedProfiles;
    return [];
  };

  const renderTabBar = () => {
    const tabs = [
      { label: `Sent (${sentProfiles.length})`, key: 'sent' },
      { label: `Received (${receivedProfiles.length})`, key: 'received' },
      { label: `Ignored (${ignoredProfiles.length})`, key: 'ignored' },
      { label: `Shortlist (${shortlistedProfiles.length})`, key: 'shortlist' }
    ];
    
    console.log('📑 Rendering tabs with counts:', {
      sent: sentProfiles.length,
      received: receivedProfiles.length,
      ignored: ignoredProfiles.length,
      shortlist: shortlistedProfiles.length,
      activeTab: activeTab
    });
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.filterTabsContainer, theme === 'dark' && styles.filterTabsContainerDark]}
        contentContainerStyle={styles.filterTabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              theme === 'dark' && styles.filterTabDark,
              activeTab === tab.key && styles.filterTabActive
            ]}
            onPress={() => {
              console.log(`📑 Tab switched to: ${tab.key}`);
              setActiveTab(tab.key);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                theme === 'dark' && styles.filterTabTextDark,
                activeTab === tab.key && styles.filterTabTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderProfile = ({ item }: { item: any }) => {
    console.log(`🎨 Rendering profile card for: ${item.name} (ID: ${item.id})`);
    return (
      <View style={styles.profileCardContainer}>
        {/* Main Card with Image and Gradient Overlay */}
        <View style={styles.mainCard}>
          {/* Image Container with Gradient */}
          <View style={styles.imageCardContainer}>
            <LinearGradient
              colors={['#DC2626', '#EF4444', '#F87171']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageCard}
            >
              <Image
                source={{ uri: item.profileImage || 'https://via.placeholder.com/400x600' }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              
              {/* Profile Info Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                style={styles.infoOverlay}
              >
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{item.name}</Text>
                  <Text style={styles.profileDetails}>{item.age} yrs • {item.location}</Text>
                </View>
              </LinearGradient>

              {/* Verified Badge */}
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check-circle" size={18} color="white" />
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Action Buttons - Bottom of Card */}
          <View style={styles.cardActionButtons}>
            {/* Left Button */}
            {activeTab === 'sent' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.removeActionButton]}
                onPress={() => handleRemoveInterest(item.id)}
              >
                <Feather name="trash-2" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            {activeTab === 'received' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.acceptActionButton]}
                onPress={() => handleAcceptInterest(item.id)}
              >
                <Feather name="check" size={20} color="white" />
              </TouchableOpacity>
            )}

            {activeTab === 'ignored' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.shortlistActionButton]}
                onPress={() => handleShortlist(item.id)}
              >
                <Feather name="bookmark" size={20} color="white" />
              </TouchableOpacity>
            )}

            {/* Center Button - View Profile */}
            <TouchableOpacity 
              style={[styles.cardActionButton, styles.cardActionButtonLarge, styles.viewProfileButton]}
              onPress={() => router.push(`/profile/${item.id}`)}
            >
              <Feather name="eye" size={28} color="white" />
            </TouchableOpacity>

            {/* Right Button */}
            {activeTab === 'sent' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.shortlistActionButton]}
                onPress={() => handleShortlist(item.id)}
              >
                <Feather name="bookmark" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            {activeTab === 'received' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.ignoreActionButton]}
                onPress={() => handleIgnoreInterest(item.id)}
              >
                <Feather name="x-circle" size={20} color="white" />
              </TouchableOpacity>
            )}

            {activeTab === 'ignored' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.acceptActionButton]}
                onPress={() => handleShortlist(item.id)}
              >
                <Feather name="check" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Section Below Card */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height:</Text>
            <Text style={styles.infoValue}>{item.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Religion:</Text>
            <Text style={styles.infoValue}>{item.religion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Caste:</Text>
            <Text style={styles.infoValue}>{item.caste}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Date:</Text>
            <Text style={styles.infoValue}>{item.interestDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: item.status === 'Accepted' ? '#059669' : '#D97706' }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F9F9F9' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    headerBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#FFFFFF' },
  };

  if (loading) {
    return (
      <WithSwipe toLeft="/(tabs)/profiles" toRight="/(tabs)/chats">
      <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
        <StatusBar 
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
          translucent={false}
        />
        <UniversalHeader 
          title="Interest"
          showProfileImage={true}
          userImage={auth?.user?.image}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
          leftIcon="heart"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Loading interests...</Text>
        </View>
      </View>
      </WithSwipe>
    );
  }

  const currentProfiles = getCurrentProfiles();

  return (
    <WithSwipe toLeft="/(tabs)/profiles" toRight="/(tabs)/chats">
    <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />
      
      {/* Header with Tabs Below */}
      <View style={[styles.headerWithTabs, themeStyles.container]}>
        <UniversalHeader 
          title="Interest"
          showProfileImage={true}
          userImage={auth?.user?.image}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
          leftIcon="heart"
        />
        
        {/* Filter Tabs - Below Header */}
        {renderTabBar()}
      </View>

      {/* Premium Upgrade Banner - Only show for non-premium users */}
      {!isUserPremium() && (
        <LinearGradient
          colors={['#FCA5A5', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumBannerContent}>
            <View style={styles.premiumBannerText}>
              <Feather name="lock" size={18} color="white" />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumBannerTitle}>View Full Profiles</Text>
                <Text style={styles.premiumBannerSubtitle}>Upgrade to Premium to see all details</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.premiumBannerButton}
              onPress={() => {
                const url = `https://90skalyanam.com/upgrade?user_id=${auth?.user?.id || ''}`;
                Linking.openURL(url);
              }}
            >
              <Text style={styles.premiumBannerButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
      
      {currentProfiles.length > 0 ? (
        <FlatList
          data={currentProfiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.tint]}
              tintColor={Colors.light.tint}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather 
            name={activeTab === 'sent' ? 'send' : 'heart'} 
            size={64} 
            color={Colors.light.icon} 
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'sent' ? 'No Hearts Sent' : 'No Hearts Received'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'sent' 
              ? "You haven't expressed heart in any profiles yet. Start exploring and find your perfect match!"
              : "No one has expressed heart in your profile yet. Keep your profile updated and active!"
            }
          </Text>
          <TouchableOpacity 
            style={styles.browseButton} 
            onPress={() => router.push('/(tabs)/profiles')}
          >
            <Text style={styles.browseButtonText}>Browse Profiles</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Modal */}
      <MenuModal 
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />
    </View>
    </WithSwipe>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0
  },
  headerWithTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
  },
  // Profile Card Styles
  profileCard: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  premiumBadgeCard: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FCD34D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
  },
  verifiedBadgeCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardInfoSection: {
    padding: 12,
  },
  cardNameRow: {
    marginBottom: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  cardLocation: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadgeCard: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextCard: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    gap: 6,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Old styles (keeping for compatibility)
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  heartButton: {
    padding: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 10,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: Colors.light.icon,
  },
  activeTabText: {
    color: 'white',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 40,
  },
  profileImageContainer: {
    marginRight: 15,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  removeButton: {
    padding: 8,
  },
  premiumBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 12,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  ignoreButton: {
    backgroundColor: '#EF4444',
  },
  ignoreButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
  },
  removeButton: {
    backgroundColor: '#EF4444',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  shortlistButton: {
    backgroundColor: '#8B5CF6',
  },
  shortlistButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  // Filter Tabs Styles (matching profiles screen)
  filterTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: 'white',
  },
  // Dark theme additions
  filterTabsContainerDark: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#2D2D2D',
  },
  filterTabDark: {
    backgroundColor: '#2D2D2D',
    borderColor: '#3A3A3A',
  },
  filterTabTextDark: {
    color: '#D1D5DB',
  },
  filterTabTextActive: {
    color: 'white',
  },
  // Profile Card Styles (matching profile screen)
  profileCardContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  mainCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageCardContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  infoOverlay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'flex-end',
  },
  profileInfo: {
    zIndex: 5,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  cardActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  cardActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  cardActionButtonSmall: {
    width: 50,
    height: 50,
  },
  cardActionButtonLarge: {
    width: 70,
    height: 70,
  },
  removeActionButton: {
    backgroundColor: '#EF4444',
  },
  acceptActionButton: {
    backgroundColor: '#10B981',
  },
  ignoreActionButton: {
    backgroundColor: '#EF4444',
  },
  shortlistActionButton: {
    backgroundColor: '#8B5CF6',
  },
  viewProfileButton: {
    backgroundColor: '#3B82F6',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
});