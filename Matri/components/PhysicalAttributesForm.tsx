import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import ThemedInput from '../components/ui/ThemedInput';
import { useTheme } from '../context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../services/apiService';

interface Props {
  stored: any | null; // physical attributes object from API if available
}

interface Form {
  face_color: string;
  height: string;
  weight: string;
  blood_group: string;
  eye_color: string;
  hair_color: string;
  disability: string;
}

const defaultForm: Form = {
  face_color: '',
  height: '',
  weight: '',
  blood_group: '',
  eye_color: '',
  hair_color: '',
  disability: '',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const PhysicalAttributesForm: React.FC<Props> = ({ stored }) => {
  const { colors } = useTheme();
  const [form, setForm] = useState<Form>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (stored) {
      console.log('💪 PhysicalAttrs raw -->', stored);
      const mapped: Partial<Form> = {
        height: (stored.height ?? stored.stature)?.toString() ?? '',
        weight: (stored.weight ?? stored.mass)?.toString() ?? '',
        face_color: stored.face_color ?? stored.face_colour ?? stored.complexion ?? '',
      } as any;
      setForm({ ...defaultForm, ...stored, ...mapped });
    }
  }, [stored]);

  const handleChange = (key: keyof Form, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await apiService.updatePhysicalAttributes({ ...form });
      if (res.status === 'success') Alert.alert('Success', res.message || 'Updated');
      else Alert.alert('Error', res.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      {/* Face Colour */}
      <Text style={styles.label}>Face Colour *</Text>
      <ThemedInput value={form.face_color} onChangeText={(t) => handleChange('face_color', t)} />

      {/* Height */}
      <Text style={styles.label}>Height *</Text>
      <ThemedInput keyboardType="numeric" value={form.height} onChangeText={(t) => handleChange('height', t)} />

      {/* Weight */}
      <Text style={styles.label}>Weight *</Text>
      <ThemedInput keyboardType="numeric" value={form.weight} onChangeText={(t) => handleChange('weight', t)} />

      {/* Blood Group */}
      <Text style={styles.label}>Blood Group</Text>
      <Picker selectedValue={form.blood_group} onValueChange={(v) => handleChange('blood_group', v)} style={styles.picker}>
        <Picker.Item label="Select" value="" />
        {BLOOD_GROUPS.map((b) => (
          <Picker.Item key={b} label={b} value={b} />
        ))}
      </Picker>

      {/* Eye Color */}
      <Text style={styles.label}>Eye Color *</Text>
      <ThemedInput value={form.eye_color} onChangeText={(t) => handleChange('eye_color', t)} />

      {/* Hair Color */}
      <Text style={styles.label}>Hair Color *</Text>
      <ThemedInput value={form.hair_color} onChangeText={(t) => handleChange('hair_color', t)} />

      {/* Disability */}
      <Text style={styles.label}>Disability</Text>
      <ThemedInput value={form.disability} onChangeText={(t) => handleChange('disability', t)} />

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default PhysicalAttributesForm;

const styles = StyleSheet.create({
  label: { marginTop: 12, marginBottom: 4, fontSize: 13, fontWeight: '600', color: '#6B7280' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#C6222F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
