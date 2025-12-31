import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
  };

  const sections = [
    {
      title: 'What Information Do We Collect?',
      icon: 'database',
      content: 'We collect information from you when you:\n\n• Register on our website\n• Fill out a form or submit a request\n• Purchase any of our services\n• Respond to surveys or feedback\n\nYou may be asked to provide your name, email address, phone number, or other relevant details. You can also visit our site anonymously.'
    },
    {
      title: 'How Do We Protect Your Information?',
      icon: 'shield',
      content: 'All sensitive data, including payment information, is securely processed via trusted gateways like Stripe. We do not store your credit/debit card details or other financial data on our servers after a transaction.'
    },
    {
      title: 'Do We Share Your Information?',
      icon: 'share-2',
      content: 'We do not sell, trade, or share your personal data with outside parties, except in the following cases:\n\n• With trusted partners who help us operate our website and services (under strict confidentiality agreements)\n• When legally required to comply with laws or to protect users and the platform'
    },
    {
      title: 'Children\'s Privacy (COPPA Compliance)',
      icon: 'users',
      content: 'We comply with the Children\'s Online Privacy Protection Act (COPPA). We do not knowingly collect information from anyone under the age of 13. Our services are strictly for users aged 13 and above.'
    },
    {
      title: 'Data Retention',
      icon: 'calendar',
      content: 'We retain your data as long as your account remains active. You may delete your account at any time, and your data will be removed (subject to legal requirements).'
    },
    {
      title: 'What We Don\'t Do With Your Data',
      icon: 'x-circle',
      content: 'We never sell, rent, or give your personal data to other companies for marketing their products or services.'
    },
    {
      title: 'Changes to This Policy',
      icon: 'edit',
      content: 'If we make any changes to this Privacy Policy, we will update them on this page. Please review it periodically for updates.'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Simple Header */}
      <View style={[styles.header, theme === 'dark' && { backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={theme === 'dark' ? '#FFFFFF' : '#1F2937'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === 'dark' && { color: '#FFFFFF' }]}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Introduction */}
        <View style={styles.introContainer}>
          <Text style={[styles.introText, themeStyles.secondaryText]}>
            At 90sKalyanam, your privacy is our top priority. We are committed to protecting the personal information you share with us. This policy explains what data we collect, how we use it, and how we keep it safe.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={[styles.sectionCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: index % 3 === 0 ? '#FEE2E2' : index % 3 === 1 ? '#EDE9FE' : '#DBEAFE' }]}>
                <Feather 
                  name={section.icon as any} 
                  size={20} 
                  color={index % 3 === 0 ? '#DC2626' : index % 3 === 1 ? '#8B5CF6' : '#3B82F6'} 
                />
              </View>
              <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
                {section.title}
              </Text>
            </View>

            {/* Section Content */}
            <Text style={[styles.sectionContent, themeStyles.secondaryText]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Contact Section */}
        <View style={[styles.contactSection, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Feather name="mail" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.sectionTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
              Contact Us
            </Text>
          </View>

          <Text style={[styles.sectionContent, themeStyles.secondaryText]}>
            If you have any questions about this policy, feel free to contact us:
          </Text>

          <View style={[styles.contactBox, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
            <Feather name="mail" size={18} color="#DC2626" />
            <Text style={[styles.contactEmail, theme === 'dark' && { color: '#E5E7EB' }]}>
              support@90skalyanam.com
            </Text>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <Text style={[styles.lastUpdatedText, themeStyles.secondaryText]}>
            Last Updated: November 2025
          </Text>
        </View>

      </ScrollView>
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

  // Introduction
  introContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  introText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: '#6B7280',
  },

  // Section Card
  sectionCard: {
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  sectionContent: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: '#6B7280',
    marginLeft: 52,
  },

  // Contact Section
  contactSection: {
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginTop: 12,
  },
  contactEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Last Updated
  lastUpdatedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});
