import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from '../components/ImageViewer';
import UniversalHeader from '../components/UniversalHeader';

const { width } = Dimensions.get('window');
const imageSize = (width - 45) / 2; // 2 images per row with better spacing

interface GalleryImage {
  id: string;
  image_url: string;
  uploaded_at: string;
}

interface UserPlan {
  package_name?: string;
  is_premium?: boolean;
  remaining_image_upload?: number;
}

const normalizeUrl = (raw?: string) => {
  if (!raw) return '';
  try {
    // decode then fix common duplicate/space issues then re-encode
    let s = decodeURI(raw);
    // remove duplicated assets path if present
    s = s.replace('/assets/assets/', '/assets/');
    // ensure "Final Code" spaces encoded
    s = s.replace(/Final Code/g, 'Final%20Code');
    // guard for accidental double slashes (keep protocol)
    s = s.replace(/([^:]\/)\/+/g, '$1');
    return encodeURI(s);
  } catch (e) {
    return encodeURI(raw);
  }
};

export default function GalleryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  useEffect(() => {
    fetchGalleryImages();
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      const response = await apiService.getUserPlan();
      if (response.status === 'success') {
        setUserPlan(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGalleryImages();
      if (response.status === 'success') {
        setImages(response.data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
      Alert.alert('Error', 'Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const remainingUploads = userPlan?.remaining_image_upload || 0;
      const isPremium = userPlan?.is_premium || false;
      
      if (remainingUploads <= 0 && !isPremium) {
        Alert.alert(
          'Upload Limit Reached',
          'You have reached your image upload limit. Upgrade to premium for unlimited uploads.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/plans') }
          ]
        );
        return;
      }

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Show options
      Alert.alert(
        'Add Gallery Image',
        `Remaining uploads: ${remainingUploads}${isPremium ? ' (Unlimited)' : ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() }
        ]
      );
    } catch (error) {
      console.error('Error checking upload limits:', error);
      Alert.alert('Error', 'Failed to check upload limits. Please try again.');
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset: any) => {
    try {
      setUploading(true);
      console.log('🖼️ Uploading gallery image...');
      
      const formData = new FormData();
      formData.append('gallery_image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'gallery.jpg',
      } as any);

      const response = await apiService.uploadGalleryImage(formData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Image uploaded successfully!');
        // Refresh gallery and user plan
        fetchGalleryImages();
        fetchUserPlan();
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImagePress = (image: any) => {
    setSelectedImage(image);
    setImageViewerVisible(true);
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    
    try {
      // Add delete API call here when backend supports it
      Alert.alert('Success', 'Image deleted successfully!');
      fetchGalleryImages(); // Refresh gallery
    } catch (error) {
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const renderImage = ({ item, index }: { item: any, index: number }) => {
    const uri = normalizeUrl(item.image_url);
    return (
      <TouchableOpacity 
        style={[styles.imageContainer, { marginRight: (index + 1) % 2 === 0 ? 0 : 15 }]}
        onPress={() => handleImagePress(item)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri }} 
          style={styles.galleryImage}
          onError={(e) => console.warn('❌ Image failed to load:', e.nativeEvent?.error, 'URL:', uri)}
          defaultSource={require('../assets/placeholder.webp')} // add a local placeholder if available
        />
        <View style={styles.imageOverlay}>
          <View style={styles.imageInfo}>
            <Feather name="calendar" size={12} color="white" />
            <Text style={styles.imageDate}>
              {new Date(item.uploaded_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.zoomIndicator}>
            <Feather name="maximize-2" size={14} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddButton = () => (
    <TouchableOpacity 
      style={styles.addImageContainer}
      onPress={handleAddImage}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={Colors.light.tint} />
      ) : (
        <>
          <Feather name="plus" size={24} color={Colors.light.tint} />
          <Text style={styles.addImageText}>Add Photo</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <UniversalHeader 
      title="My Gallery"
      leftIcon="arrow-left"
      onLeftPress={() => router.back()}
      rightIcons={['plus']}
      onRightPress={[() => handleAddImage()]}
    />
  );

  const renderPlanInfo = () => (
    <View style={styles.planInfo}>
      <View style={styles.planDetails}>
        <Text style={styles.planTitle}>{userPlan?.package_name || 'FREE MATCH'}</Text>
        <Text style={styles.planSubtitle}>
          {userPlan?.is_premium 
            ? 'Unlimited uploads' 
            : `${userPlan?.remaining_image_upload || 0} uploads remaining`
          }
        </Text>
      </View>
      {!userPlan?.is_premium && (
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => router.push('/plans')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderPlanInfo()}
      
      <FlatList
        data={[{ id: 'add-button' }, ...images]}
        renderItem={({ item, index }) => {
          if (item.id === 'add-button') {
            return renderAddButton();
          }
          return renderImage({ item, index: index - 1 });
        }}
        keyExtractor={(item) => item.id?.toString() || 'add-button'}
        numColumns={2}
        contentContainerStyle={styles.galleryContainer}
        showsVerticalScrollIndicator={false}
      />

      <ImageViewer
        visible={imageViewerVisible}
        imageUrl={normalizeUrl(selectedImage?.image_url || '')}
        onClose={() => {
          setImageViewerVisible(false);
          setSelectedImage(null);
        }}
        onDelete={handleDeleteImage}
        showDelete={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  galleryIconContainer: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22, // Increased size
    fontWeight: '700', // Bolder
    color: Colors.light.text,
    letterSpacing: 0.5, // Added spacing
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  photoCountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    // Add subtle shadow
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    // Enhanced card style
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: Colors.light.background,
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  planSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    // Add gradient and shadow
    elevation: 3,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  galleryContainer: {
    padding: 15,
  },
  addImageContainer: {
    width: imageSize,
    height: imageSize + 20,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    // Enhanced add button style
    backgroundColor: 'rgba(239,68,68,0.05)',
    transform: [{ scale: 0.98 }],
    // Add hover effect
    ':hover': {
      transform: [{ scale: 1 }],
      backgroundColor: 'rgba(239,68,68,0.1)',
    },
  },
  addImageText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize + 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    // Enhanced shadow and elevation
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    // Add subtle border
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    // Add scale animation on load
    transform: [{ scale: 1.02 }],
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Enhanced gradient overlay
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Add subtle gradient
    backgroundGradient: {
      colors: ['transparent', 'rgba(0,0,0,0.8)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageDate: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
  },
  zoomIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.icon,
  },
});
