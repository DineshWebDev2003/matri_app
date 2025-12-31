import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  AsyncStorage 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface SearchSuggestionsProps {
  visible: boolean;
  searchQuery: string;
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

const popularSearches = [
  'Software Engineer',
  'Doctor',
  'Teacher',
  'Business',
  'Chennai',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hindu',
  'Christian',
  'Muslim',
  'Brahmin',
  'Kshatriya',
];

export default function SearchSuggestions({ 
  visible, 
  searchQuery, 
  onSelectSuggestion, 
  onClose 
}: SearchSuggestionsProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = [
        ...searchHistory.filter(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...popularSearches.filter(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !searchHistory.includes(item)
        )
      ].slice(0, 8);
      
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([
        ...searchHistory.slice(0, 5),
        ...popularSearches.slice(0, 5)
      ]);
    }
  }, [searchQuery, searchHistory]);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const saveSearchTerm = async (term: string) => {
    try {
      const updatedHistory = [
        term,
        ...searchHistory.filter(item => item !== term)
      ].slice(0, 10); // Keep only last 10 searches
      
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save search term:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    saveSearchTerm(suggestion);
    onSelectSuggestion(suggestion);
  };

  const renderSuggestion = ({ item, index }: { item: string, index: number }) => {
    const isHistory = searchHistory.includes(item);
    
    return (
      <TouchableOpacity 
        style={styles.suggestionItem}
        onPress={() => handleSelectSuggestion(item)}
      >
        <Feather 
          name={isHistory ? 'clock' : 'trending-up'} 
          size={16} 
          color={Colors.light.icon} 
        />
        <Text style={styles.suggestionText}>{item}</Text>
        {isHistory && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => {
              const updated = searchHistory.filter(h => h !== item);
              setSearchHistory(updated);
              AsyncStorage.setItem('searchHistory', JSON.stringify(updated));
            }}
          >
            <Feather name="x" size={14} color={Colors.light.icon} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {searchQuery ? 'Suggestions' : 'Recent & Popular'}
        </Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearSearchHistory}>
            <Text style={styles.clearButton}>Clear History</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredSuggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearButton: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  list: {
    maxHeight: 240,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.light.text,
  },
  removeButton: {
    padding: 4,
  },
});
