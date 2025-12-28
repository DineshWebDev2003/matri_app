import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

interface PlanInfo {
  name: string;
  colors: [string, string];
  validity: string;
}

const PLAN_INFO: { [key: number]: PlanInfo } = {
  1: {
    name: 'BASIC MATCH',
    colors: ['#3B82F6', '#1E40AF'],
    validity: '90 days'
  },
  2: {
    name: 'PREMIUM MATCH',
    colors: ['#C6222F', '#A11A25'],
    validity: '365 days'
  },
  3: {
    name: 'ELITE MATCH',
    colors: ['#9333EA', '#6B21A8'],
    validity: 'Lifetime'
  }
};

export default function ViewPlanScreen() {
  const router = useRouter();
  const { limitation, user } = useAuth();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  useEffect(() => {
    if (limitation?.package_id) {
      const info = PLAN_INFO[limitation.package_id];
      setPlanInfo(info || PLAN_INFO[2]);
    }
  }, [limitation]);

  if (!limitation || !planInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C6222F" />
        </View>
      </View>
    );
  }

  const isUnlimited = limitation.validity_period === -1;
  const expiryDate = limitation.expire_date ? new Date(limitation.expire_date).toLocaleDateString() : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Current Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={planInfo.colors} style={styles.planCard}>
          <Text style={styles.planName}>{planInfo.name}</Text>
          <Text style={styles.planValidity}>
            {isUnlimited ? 'Lifetime Access' : `Valid for ${planInfo.validity}`}
          </Text>
          <Text style={styles.expiryText}>
            Expires: {expiryDate}
          </Text>
        </LinearGradient>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Your Limits</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Feather name="heart" size={24} color="#C6222F" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Express Interest</Text>
              <Text style={styles.featureValue}>
                {limitation.interest_express_limit === -1 ? 'Unlimited' : limitation.interest_express_limit || '0'}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Feather name="eye" size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Contact Views</Text>
              <Text style={styles.featureValue}>
                {limitation.contact_view_limit === -1 ? 'Unlimited' : limitation.contact_view_limit || '0'}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Feather name="image" size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Image Uploads</Text>
              <Text style={styles.featureValue}>
                {limitation.image_upload_limit === -1 ? 'Unlimited' : limitation.image_upload_limit || '0'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Plan Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package ID:</Text>
            <Text style={styles.infoValue}>{limitation.package_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Validity Period:</Text>
            <Text style={styles.infoValue}>
              {limitation.validity_period === -1 ? 'Unlimited' : `${limitation.validity_period} days`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activated:</Text>
            <Text style={styles.infoValue}>
              {limitation.created_at ? new Date(limitation.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/plans')}>
          <Text style={styles.upgradeButtonText}>View Other Plans</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  planCard: {
    margin: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  planValidity: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  featureValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  upgradeButton: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#C6222F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
