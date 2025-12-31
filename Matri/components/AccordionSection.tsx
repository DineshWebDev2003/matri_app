import React, { ReactNode, useState } from 'react';
import { View, TouchableOpacity, Text, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<Props> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.headerText}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#374151" />
      </TouchableOpacity>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
};

export default AccordionSection;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  body: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
});
