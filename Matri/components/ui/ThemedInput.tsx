import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Props extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
}

const ThemedInput: React.FC<Props> = ({ icon, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
      {icon && <Feather name={icon} size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />}
      <TextInput
        {...rest}
        placeholderTextColor={colors.inputPlaceholder}
        style={[styles.input, { color: colors.textPrimary }, style]}
      />
    </View>
  );
};

export default ThemedInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
});
