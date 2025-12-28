import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput, Linking, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import UniversalHeader from '../components/UniversalHeader';

type IconName = React.ComponentProps<typeof Feather>['name'];

const settingsMenuItems: { id: string; title: string; icon: IconName; section: string; hasToggle?: boolean }[] = [
  { id: '1', title: 'Personal Information', icon: 'user', section: 'personal' },
  { id: '2', title: 'Privacy Centre', icon: 'lock', section: 'personal' },
  { id: '3', title: 'Account Status', icon: 'check-circle', section: 'personal' },
  { id: '4', title: 'Link History', icon: 'link', section: 'personal' },
  { id: '5', title: 'Push Notification', icon: 'bell', section: 'notifications', hasToggle: true },
  { id: '6', title: 'Email Notification', icon: 'mail', section: 'notifications', hasToggle: true },
  { id: '7', title: 'SMS Notification', icon: 'message-square', section: 'notifications', hasToggle: true },
  { id: '8', title: 'Weekly Notification', icon: 'calendar', section: 'notifications', hasToggle: true },
  { id: '9', title: 'Search History', icon: 'search', section: 'other' },
  { id: '10', title: 'Privacy Policy', icon: 'file-text', section: 'other' },
  { id: '11', title: 'About Us', icon: 'info', section: 'other' },
  { id: '12', title: 'Customer Care', icon: 'phone', section: 'other' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const logout = auth?.logout;
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toggleStates, setToggleStates] = useState({
    pushnotification: false,
    emailnotification: false,
    smsnotification: false,
    weeklynotification: false,
  });

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
  };

  const handleMenuItemPress = (item: any) => {
    switch (item.title) {
      case 'Personal Information':
        Alert.alert('Personal Information', 'Manage your personal details');
        break;
      case 'Privacy Centre':
        router.push('/privacy-policy');
        break;
      case 'Account Status':
        Alert.alert('Account Status', 'Your account is active and verified');
        break;
      case 'Link History':
        Alert.alert('Link History', 'View your connection history');
        break;
      case 'Search History':
        Alert.alert('Search History', 'View your search history');
        break;
      case 'Privacy Policy':
        router.push('/privacy-policy');
        break;
      case 'About Us':
        setShowAboutModal(true);
        break;
      case 'Customer Care':
        setShowContactModal(true);
        break;
    }
  };

  const handleToggle = (key: string) => {
    setToggleStates(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'personal': return t('personal_information');
      case 'notifications': return t('notifications_settings');
      case 'other': return t('other_settings');
      default: return '';
    }
  };

  const groupedItems = settingsMenuItems.reduce((acc: any, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Universal Header */}
      <UniversalHeader 
        title="Settings"
        leftIcon="arrow-left"
        onLeftPress={() => router.back()}
        rightIcons={['more-vertical']}
        onRightPress={[() => Alert.alert('More Options', 'Additional settings coming soon')]}
      />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 0 }}>

        {/* Settings Sections */}
        {Object.keys(groupedItems).map((section, sectionIndex) => (
          <View key={section}>
            {/* Section Title */}
            <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#E5E7EB' }]}>
              {getSectionTitle(section)}
            </Text>

            {/* Section Items */}
            {groupedItems[section].map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingsMenuItem,
                  index !== groupedItems[section].length - 1 && [styles.settingsMenuItemBorder, theme === 'dark' && { borderBottomColor: '#2A2A2A' }],
                  theme === 'dark' && { backgroundColor: '#1A1A1A' }
                ]}
                onPress={() => !item.hasToggle && handleMenuItemPress(item)}
                activeOpacity={item.hasToggle ? 1 : 0.7}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F3F4F6' }]}>
                    <Feather 
                      name={item.icon} 
                      size={18} 
                      color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                    />
                  </View>
                  <Text style={[styles.settingsMenuItemText, theme === 'dark' && { color: '#E5E7EB' }]}>
                    {item.title}
                  </Text>
                </View>
                
                {item.hasToggle ? (
                  <Switch
                    value={toggleStates[item.title.toLowerCase().replace(/\s+/g, '') as keyof typeof toggleStates] || false}
                    onValueChange={() => handleToggle(item.title.toLowerCase().replace(/\s+/g, ''))}
                    trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                    thumbColor={toggleStates[item.title.toLowerCase().replace(/\s+/g, '') as keyof typeof toggleStates] ? '#FFFFFF' : '#FFFFFF'}
                  />
                ) : (
                  <Feather name="chevron-right" size={20} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

      </ScrollView>

      {/* About Us Modal */}
      <Modal visible={showAboutModal} transparent animationType="fade" onRequestClose={() => setShowAboutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAboutModal(false)}>
              <Feather name="x" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
            
            <Text style={[styles.modalTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Who We Are – With a 90s Twist</Text>
            
            <ScrollView style={{ maxHeight: '70%' }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalText, { color: theme === 'dark' ? '#B0B0B0' : '#6B7280' }]}>
                At 90sKalyanam, we're not just another matrimony site – we're a vibe! Made for 90s kids who still believe in slow love, long conversations, and soulful connections, we blend old-school Tamil romance with today's tech.
              </Text>
              
              <Text style={[styles.modalText, { color: theme === 'dark' ? '#B0B0B0' : '#6B7280' }]}>
                From Rajini-style proposals to Simran-level shyness, we celebrate everything that made 90s love magical. If you're searching for a match who gets your jokes and your values – welcome home!
              </Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <View style={[styles.featureItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                  <View style={styles.featureBadge}>
                    <Feather name="check-circle" size={20} color="#10B981" />
                  </View>
                  <Text style={[styles.featureText, { color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>VERIFIED PROFILES</Text>
                </View>

                <View style={[styles.featureItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                  <View style={styles.featureBadge}>
                    <Feather name="search" size={20} color="#3B82F6" />
                  </View>
                  <Text style={[styles.featureText, { color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>FIND MATCH EASILY</Text>
                </View>

                <View style={[styles.featureItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                  <View style={styles.featureBadge}>
                    <Feather name="shield" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.featureText, { color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>PROTECTED PERSONAL DATA</Text>
                </View>

                <View style={[styles.featureItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                  <View style={styles.featureBadge}>
                    <Feather name="heart" size={20} color="#DC2626" />
                  </View>
                  <Text style={[styles.featureText, { color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>BEST MATRIMONY FOR 90S KIDS</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalCloseButtonBottom}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contact Us Modal */}
      <Modal visible={showContactModal} transparent animationType="fade" onRequestClose={() => setShowContactModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowContactModal(false)}>
              <Feather name="x" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
            
            <Text style={[styles.modalTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Contact Us</Text>

            {/* Contact Info */}
            <View style={styles.contactInfoContainer}>
              <View style={[styles.contactItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                <View style={styles.contactIconBox}>
                  <Feather name="map-pin" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF' }]}>Office Address</Text>
                  <Text style={[styles.contactValue, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>Pollachi</Text>
                </View>
              </View>

              <View style={[styles.contactItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                <View style={styles.contactIconBox}>
                  <Feather name="mail" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF' }]}>Email Address</Text>
                  <Text style={[styles.contactValue, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>info@90skalyanam.com</Text>
                </View>
              </View>

              <View style={[styles.contactItem, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
                <View style={styles.contactIconBox}>
                  <Feather name="phone" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: theme === 'dark' ? '#9CA3AF' : '#9CA3AF' }]}>Contact Number</Text>
                  <Text style={[styles.contactValue, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>81480-78285</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalCloseButtonBottom}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flex: 1 },

  // Simple Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },

  // Section Title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
    paddingLeft: 0,
  },

  // Settings Menu Item
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
  },
  settingsMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  settingsMenuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 8,
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Features Container
  featuresContainer: {
    marginTop: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  featureBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },

  // Contact Info
  contactInfoContainer: {
    marginTop: 20,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Modal Close Button
  modalCloseButtonBottom: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
