import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Picker, PickerProps } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Props extends PickerProps {
  icon?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewProps['style'];
}

export const ThemedPicker: React.FC<Props> = ({ icon, containerStyle, style, ...rest }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }, containerStyle]}>
      {icon && (
        <Feather name={icon} size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
      )}
      <Picker
        {...rest}
        style={[{ flex: 1, color: colors.textPrimary }, style]}
        dropdownIconColor={colors.textSecondary as any}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
});
