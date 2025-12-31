import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const shortlistedProfiles = [
  {
    id: '1',
    name: 'Sofia',
    age: 25,
    height: "5' 0\"",
    location: 'Madurai',
    idNo: 'NDR10101',
    image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=1889&auto=format&fit=crop',
    verified: true,
  },
  {
    id: '2',
    name: 'Suhashini',
    age: 24,
    height: "4' 5\"",
    location: 'Trichy',
    idNo: 'NDR10103',
    image: 'https://images.unsplash.com/photo-1594744806549-83db4a74a58b?q=80&w=1887&auto=format&fit=crop',
    verified: false,
  },
  {
    id: '3',
    name: 'Shree Nithi',
    age: 24,
    height: "4' 5\"",
    location: 'Trichy',
    idNo: 'NDR10103',
    image: 'https://images.unsplash.com/photo-1619981943232-5643b5e4053a?q=80&w=1887&auto=format&fit=crop',
    verified: true,
  },
];

export default function ShortlistedScreen() {
  const router = useRouter();

  const renderProfile = ({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/profile/${item.id}`)} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.profileDetails}>
        <View style={styles.nameContainer}>
          <Text style={styles.profileName}>{item.name}</Text>
          {item.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#007BFF" style={{ marginLeft: 5 }} />}
        </View>
        <Text style={styles.detailText}>Age      : {item.age}</Text>
        <Text style={styles.detailText}>Height   : {item.height}</Text>
        <Text style={styles.detailText}>Location : {item.location}</Text>
        <Text style={styles.detailText}>ID No    : {item.idNo}</Text>
      </View>
      <TouchableOpacity style={styles.bookmarkIcon}>
        <Feather name="bookmark" size={20} color="gray" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shortlisted by me</Text>
      </View>
      <FlatList
        data={shortlistedProfiles}
        renderItem={renderProfile}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    transform: [{ translateX: -12 }], 
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'space-around',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 13,
    color: 'gray',
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
});
