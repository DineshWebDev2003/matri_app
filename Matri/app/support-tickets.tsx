import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import UniversalHeader from '../components/UniversalHeader';

export default function SupportTicketsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch tickets from API or local storage
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // For now, show empty state
      setTickets([]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    card: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F8F9FA' },
  };

  const renderTicketItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, themeStyles.card]}
      onPress={() => router.push(`/ticket-detail/${item.id}`)}
    >
      <View style={styles.ticketHeader}>
        <Text style={[styles.ticketSubject, themeStyles.text]} numberOfLines={1}>
          {item.subject}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.ticketDate, themeStyles.secondaryText]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#3B82F6';
      case 'in-progress':
        return '#F59E0B';
      case 'closed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <UniversalHeader 
        title="Support Tickets"
        showProfileImage={false}
        onProfilePress={() => router.push('/account')}
        onMenuPress={() => {}}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : tickets.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Feather name="inbox" size={64} color="#DC2626" />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Tickets Yet</Text>
          <Text style={[styles.emptySubtext, themeStyles.secondaryText]}>
            Create a new support ticket to get help
          </Text>
          <TouchableOpacity 
            style={styles.createTicketButton}
            onPress={() => router.push('/new-ticket')}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.createTicketButtonText}>Create Ticket</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={tickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => router.push('/new-ticket')}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {tickets.length === 0 && !loading && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => router.push('/new-ticket')}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  createTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  createTicketButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  ticketCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  ticketDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
