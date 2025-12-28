import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function MenuModal({ visible, onClose }: MenuModalProps) {
  const { theme, setThemeMode } = useTheme();
  const router = useRouter();

  const themeStyles = {
    drawerBg: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FF69B4' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#FFFFFF' },
    subtitle: theme === 'dark' ? { color: '#B0B0B0' } : { color: 'rgba(255, 255, 255, 0.8)' },
  };

  const menuItems = [
    {
      id: 'likes',
      title: 'Likes',
      icon: 'heart',
      route: '/(tabs)/saved',
      color: '#DC2626',
    },
    {
      id: 'my-profile',
      title: 'My Profile',
      icon: 'user',
      route: '/profile-setting',
      color: '#FF69B4',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell',
      route: '/notifications',
      color: '#F59E0B',
    },
    {
      id: 'favorites',
      title: 'My Favourite',
      icon: 'bookmark',
      route: '/shortlisted',
      color: '#EC4899',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      color: '#8B5CF6',
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      route: '/help',
      color: '#06B6D4',
    },
  ];

  const handleMenuItemPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setThemeMode(newTheme);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Drawer Background */}
        <LinearGradient
          colors={['#FF69B4', '#FF1493']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.drawer]}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerContent} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Logo/Title Section */}
            <View style={styles.logoSection}>
              <Feather name="heart" size={32} color="white" />
              <Text style={styles.logoText}>Likes</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItemsContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.route)}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuIconBox}>
                      <Feather name={item.icon as any} size={18} color="white" />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Section - Spacer */}
            <View style={{ flex: 1 }} />

            {/* Bottom Links */}
            <View style={styles.bottomLinksContainer}>
              <TouchableOpacity style={styles.bottomLink}>
                <Text style={styles.bottomLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomLink}>
                <Text style={styles.bottomLinkText}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            {/* Dark Mode Toggle */}
            <View style={styles.darkModeSection}>
              <View style={styles.darkModeContent}>
                <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={18} color="white" />
                <Text style={styles.darkModeText}>Dark Mode</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: 'rgba(255, 255, 255, 0.5)' }}
                thumbColor={theme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </ScrollView>
        </LinearGradient>

        {/* Overlay to close drawer */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: width * 0.7,
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  drawerContent: {
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    marginTop: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  menuItemsContainer: {
    gap: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bottomLinksContainer: {
    gap: 12,
    marginBottom: 20,
  },
  bottomLink: {
    paddingVertical: 8,
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  darkModeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 20,
  },
  darkModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
