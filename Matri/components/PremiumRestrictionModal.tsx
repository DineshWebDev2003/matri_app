import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

interface PremiumRestrictionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  feature: string; // 'chat', 'contact_view', 'interest_express'
}

export default function PremiumRestrictionModal({
  visible,
  onClose,
  title,
  message,
  feature
}: PremiumRestrictionModalProps) {
  const router = useRouter();

  const getFeatureIcon = () => {
    switch (feature) {
      case 'chat':
        return 'message-circle';
      case 'contact_view':
        return 'eye';
      case 'interest_express':
        return 'heart';
      default:
        return 'star';
    }
  };

  const handleUpgrade = () => {
    onClose();
    router.push('/plans');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.headerGradient}
          >
            <View style={styles.iconContainer}>
              <Feather name={getFeatureIcon()} size={40} color="white" />
            </View>
            <Text style={styles.headerTitle}>{title}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.messageContainer}>
              <MaterialIcons name="lock" size={60} color="#FFD700" />
              <Text style={styles.message}>{message}</Text>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Upgrade to Premium and get:</Text>
              
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Unlimited messaging</Text>
              </View>
              
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>View contact details</Text>
              </View>
              
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Express unlimited interests</Text>
              </View>
              
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Priority profile visibility</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <LinearGradient
                  colors={['#FFD700', '#FDB813']}
                  style={styles.upgradeGradient}
                >
                  <MaterialIcons name="star" size={20} color="#333" />
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerGradient: {
    padding: 25,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    padding: 25,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 15,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  buttonContainer: {
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
