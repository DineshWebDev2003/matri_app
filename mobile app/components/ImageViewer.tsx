import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function ImageViewer({ 
  visible, 
  imageUrl, 
  onClose, 
  onDelete, 
  showDelete = false 
}: ImageViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            {showDelete && (
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Feather name="trash-2" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.imageContainer}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity activeOpacity={1} onPress={onClose}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoad={() => setImageLoaded(true)}
            />
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap to close • Pinch to zoom</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  imageContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.7,
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});
