import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { apiService, premiumUtils } from '../services/api';
import { Colors } from '../constants/Colors';

interface Plan {
  id: number;
  name: string;
  price: number;
  validity_period: number;
  interest_express_limit: number;
  contact_view_limit: number;
  image_upload_limit: number;
  status: number;
}

export default function PlansScreen() {
  const router = useRouter();
  const { user, limitation } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchPlansAndUserData();
  }, []);

  const fetchPlansAndUserData = async () => {
    try {
      setLoading(true);
      
      // Plans data based on database structure
      const mockPlans = [
        {
          id: 1,
          name: 'BASIC MATCH',
          price: 399,
          validity_period: 90,
          interest_express_limit: 150,
          contact_view_limit: 90,
          image_upload_limit: 4,
          status: 1
        },
        {
          id: 2,
          name: 'PREMIUM MATCH',
          price: 799,
          validity_period: 365,
          interest_express_limit: 500,
          contact_view_limit: 365,
          image_upload_limit: 8,
          status: 1
        },
        {
          id: 3,
          name: 'ELITE MATCH',
          price: 1299,
          validity_period: -1, // Unlimited
          interest_express_limit: -1, // Unlimited
          contact_view_limit: -1, // Unlimited
          image_upload_limit: -1, // Unlimited
          status: 1
        }
      ];
      
      setPlans(mockPlans);
      
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: number) => {
    try {
      setPurchasing(planId);
      
      // For now, show alert - in production this would integrate with payment gateway
      Alert.alert(
        'Purchase Plan',
        'This will redirect to payment gateway. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: async () => {
              try {
                // Mock purchase success
                Alert.alert('Success', 'Plan purchased successfully!');
                fetchPlansAndUserData(); // Refresh data
              } catch (error) {
                Alert.alert('Error', 'Purchase failed. Please try again.');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const renderPlanCard = (plan: Plan) => {
    const isCurrentPlan = limitation?.package_id === plan.id;
    const packageColor = premiumUtils.getPackageColor(plan.id);
    const isUnlimited = plan.validity_period === -1;
    
    return (
      <View key={plan.id} style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
        <LinearGradient
          colors={[`${packageColor}20`, `${packageColor}10`]}
          style={styles.planGradient}
        >
          {isCurrentPlan && (
            <View style={[styles.currentPlanBadge, { backgroundColor: packageColor }]}>
              <Text style={styles.currentPlanText}>CURRENT PLAN</Text>
            </View>
          )}
          
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: packageColor }]}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.validity}>
                /{isUnlimited ? 'Lifetime' : `${plan.validity_period} days`}
              </Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialIcons name="favorite" size={20} color={packageColor} />
              <Text style={styles.featureText}>
                {isUnlimited ? 'Unlimited' : plan.interest_express_limit} Interest Expressions
              </Text>
            </View>
            
            <View style={styles.feature}>
              <MaterialIcons name="visibility" size={20} color={packageColor} />
              <Text style={styles.featureText}>
                {isUnlimited ? 'Unlimited' : plan.contact_view_limit} Contact Views
              </Text>
            </View>
            
            <View style={styles.feature}>
              <MaterialIcons name="photo-library" size={20} color={packageColor} />
              <Text style={styles.featureText}>
                {isUnlimited ? 'Unlimited' : plan.image_upload_limit} Photo Uploads
              </Text>
            </View>
            
            <View style={styles.feature}>
              <MaterialIcons name="support-agent" size={20} color={packageColor} />
              <Text style={styles.featureText}>24/7 Customer Support</Text>
            </View>
            
            {plan.id === 3 && (
              <View style={styles.feature}>
                <MaterialIcons name="star" size={20} color={packageColor} />
                <Text style={styles.featureText}>Priority Profile Visibility</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { backgroundColor: packageColor },
              isCurrentPlan && styles.currentPlanButton,
              purchasing === plan.id && styles.purchasingButton
            ]}
            onPress={() => !isCurrentPlan && handlePurchase(plan.id)}
            disabled={isCurrentPlan || purchasing === plan.id}
          >
            {purchasing === plan.id ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                {isCurrentPlan ? 'ACTIVE' : 'CHOOSE PLAN'}
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans & Pricing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Choose Your Perfect Match Plan</Text>
          <Text style={styles.subtitle}>
            Unlock premium features and find your life partner faster
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            All plans include profile verification, advanced search filters, and secure messaging.
          </Text>
          <Text style={styles.footerNote}>
            * Prices are in Indian Rupees. All purchases are secure and encrypted.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  planGradient: {
    padding: 20,
    backgroundColor: 'white',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
  },
  currentPlanText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  validity: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  purchaseButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#10B981',
  },
  purchasingButton: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerSection: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
