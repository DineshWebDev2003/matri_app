import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const viewers = [
  { id: '1', name: 'Dharshika', message: 'Let\'s Connect !', image: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { id: '2', name: 'Esther Kaen', message: 'Let\'s Connect !', image: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { id: '3', name: 'Roshini', message: 'Let\'s Connect !', image: 'https://randomuser.me/api/portraits/women/9.jpg' },
];

export default function ViewedProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viewed your profile</Text>
      </View>

      <Text style={styles.subtitle}>11 Profile viewers in the past 1 week</Text>

      <FlatList
        data={viewers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.viewerCard}>
            <Image source={{ uri: item.image }} style={styles.profileImage} />
            <View style={styles.viewerInfo}>
              <Text style={styles.viewerName}>{item.name}</Text>
              <Text style={styles.viewerMessage}>{item.message}</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  viewerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  viewerInfo: {
    flex: 1,
  },
  viewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewerMessage: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
