import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Plan = {
  name: string;
  price: string;
  originalPrice: string;
  validity: string;
  isPremium: boolean;
  features: { title: string; description: string }[];
  modalTitle: string;
  modalDescription: string;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const plans: Plan[] = [
  {
    name: 'BASIC MATCH',
    price: '399.00',
    originalPrice: '999',
    validity: '90 Days Validity',
    isPremium: false,
    features: [
        { title: '90 Days Validity', description: 'Enough time to explore and try.' },
        { title: 'View Unlimited Profiles', description: 'And 90 Contact Viewable.' },
        { title: 'Send Interest to 150 Members', description: 'Show your interest to chosen profiles.' },
        { title: 'Upload 3 Photos', description: 'Share your identity with clear limits.' },
        { title: 'Low-Cost Entry Plan', description: 'Best for first-time users or quick marriages.' },
    ],
    modalTitle: 'Simple & Budget-Friendly Search',
    modalDescription: 'Great for people who want to try with fewer features and low cost.',
  },
  {
    name: 'PREMIUM MATCH',
    price: '799.00',
    originalPrice: '1,999',
    validity: '365 Days Validity',
    isPremium: true,
    features: [
        { title: '365 Days Validity', description: '1-year access for relaxed matchmaking.' },
        { title: 'View Unlimited Profiles', description: 'And 365 Contact Viewable.' },
        { title: 'Send Interest to 500 Members', description: 'Higher reach to connect better.' },
        { title: 'Upload 8 Photos', description: 'More images to present yourself well.' },
        { title: 'Balanced Features', description: 'Ideal for serious users at a fair price.' },
    ],
    modalTitle: 'Serious Match Finders',
    modalDescription: 'Ideal for serious users who want more time and better reach.',
  },
  {
    name: 'ELITE MATCH',
    price: '1,299.00',
    originalPrice: '3,999',
    validity: 'Unlimited Validity',
    isPremium: false,
    features: [
        { title: 'Unlimited Validity', description: 'Lifetime access to find your perfect match.' },
        { title: 'Unlimited Profile And Contacts Views', description: 'Browse every profile without limits.' },
        { title: 'Unlimited Interest Requests', description: 'Connect freely with anyone.' },
        { title: 'Unlimited Photo Uploads', description: 'Fully showcase your personality.' },
        { title: 'Priority Support', description: 'Get dedicated assistance anytime.' },
    ],
    modalTitle: 'Full Access & Unlimited Search',
    modalDescription: 'Lifetime membership with unrestricted features for serious match seekers.',
  },
];

export default function UpdatePlanScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleViewFeatures = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + 20));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Choose your perfect plan and start your love journey today with verified profiles, full access, and 90s style matchmaking magic!</Text>
      </View>

      <ScrollView
        horizontal
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={styles.plansContainer}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {plans.map((plan, index) => (
          <View key={index} style={[styles.planCardContainer, plan.isPremium && styles.premiumCardContainer]}>
              <LinearGradient
                colors={plan.isPremium ? ['#FFD700', '#FDB813'] : ['#DC2626', '#C53030']}
                style={styles.planCard}
              >
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.currency}>INR</Text>
                </View>
                <Text style={styles.originalPrice}>{plan.originalPrice} INR</Text>
                <Text style={styles.validity}>{plan.validity}</Text>
                <TouchableOpacity style={[styles.button, plan.isPremium && styles.premiumButton]}>
                  <Text style={[styles.buttonText, plan.isPremium && styles.premiumButtonText]}>Buy Now</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.featuresButton, plan.isPremium && styles.premiumFeaturesButton]}
                  onPress={() => handleViewFeatures(plan)}
                >
                  <Text style={[styles.buttonText, plan.isPremium ? styles.premiumButtonText : { color: 'white' }]}>View Features</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {plans.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      {selectedPlan && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPlan.modalTitle}</Text>
              <Text style={styles.modalDescription}>{selectedPlan.modalDescription}</Text>
              <View style={styles.featuresList}>
                {selectedPlan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Feather name="check" size={20} color="#48BB78" />
                    <Text style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>– {feature.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF2F2' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  titleContainer: { padding: 20, alignItems: 'center' },
  mainTitle: { fontSize: 16, color: '#555', textAlign: 'center' },
  plansContainer: {
    paddingHorizontal: CARD_SPACING - 10, // Adjust for card margin
    paddingVertical: 20,
    alignItems: 'center',
  },
  planCardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  premiumCardContainer: { transform: [{ scale: 1.05 }], zIndex: 1 },
  planCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  planName: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 22, marginBottom: 20 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 48, fontWeight: 'bold', color: 'white' },
  currency: { fontSize: 20, color: 'white', marginLeft: 5, fontWeight: '500' },
  originalPrice: { fontSize: 18, color: 'rgba(255,255,255,0.8)', textDecorationLine: 'line-through', marginVertical: 10 },
  validity: { fontSize: 16, color: 'white', marginBottom: 20 },
  button: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingVertical: 15, 
    borderRadius: 10, 
    marginVertical: 5, 
    width: '90%'
  },
  featuresButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'white' },
  premiumButton: { backgroundColor: '#422006' },
  premiumFeaturesButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#422006' },
  buttonText: { color: '#C53030', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  premiumButtonText: { color: 'white' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#C53030', width: 12, height: 12, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#C53030' },
  modalDescription: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 20 },
  featuresList: {},
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  featureText: { marginLeft: 10, fontSize: 15, color: '#333', flex: 1 },
  featureTitle: { fontWeight: 'bold' },
});
