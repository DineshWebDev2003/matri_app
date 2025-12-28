import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

// Placeholder components for different sections
const ProfileHeader = () => (
  <View style={styles.headerContainer}>
    <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
    <Text style={styles.userName}>User Name</Text>
    <Text style={styles.userId}>Profile ID: 12345</Text>
    <Text style={styles.status}>Online</Text>
  </View>
);

const ActionButtons = () => (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity style={styles.button}>
      <Text>Send Interest</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button}>
      <Text>Chat Now</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button}>
      <Text>Favorite</Text>
    </TouchableOpacity>
  </View>
);

const AboutSection = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text>Age: 28</Text>
        <Text>Height: 5'8"</Text>
        <Text>Religion: Hindu</Text>
    </View>
);

const PhotosSection = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {/* Placeholder for photo gallery */}
        <View style={styles.photoGrid}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.photo} />
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.photo} />
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.photo} />
        </View>
    </View>
);

const DetailsSection = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text>Education: Bachelor's Degree</Text>
        <Text>Occupation: Software Engineer</Text>
    </View>
);

const PreferencesSection = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Partner Preferences</Text>
        <Text>Looking for someone who is...</Text>
    </View>
);

const UserProfile = () => {
  return (
    <ScrollView style={styles.container}>
      <ProfileHeader />
      <ActionButtons />
      <AboutSection />
      <PhotosSection />
      <DetailsSection />
      <PreferencesSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userId: {
    fontSize: 16,
    color: 'gray',
  },
  status: {
    fontSize: 16,
    color: 'green',
    marginTop: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
  },
});

export default UserProfile;
