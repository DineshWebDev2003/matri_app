import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import CustomTabBar from '../../components/CustomTabBar';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const auth = useAuth();
  const isGuest = auth?.isGuest || false;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
      }}>

      {/* Show home only for authenticated users */}
      {!isGuest && (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={32} name="home" color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Profiles',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="users" color={color} />,
        }}
      />

      {/* Show saved only for authenticated users */}
      {!isGuest && (
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Interest',
            tabBarIcon: ({ color }) => <FontAwesome size={32} name="heart" color={color} />,
          }}
        />
      )}

      {/* Show chats only for authenticated users */}
      {!isGuest && (
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color }) => <FontAwesome size={32} name="comments" color={color} />,
          }}
        />
      )}

      {/* Show account only for authenticated users - 5th position */}
      {!isGuest && (
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <FontAwesome size={32} name="gear" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}