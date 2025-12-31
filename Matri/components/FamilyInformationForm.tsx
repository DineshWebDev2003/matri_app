import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { apiService } from '../services/apiService';

interface Props {
  stored: any | null; // family info object from API
}

interface Form {
  father_name: string;
  father_profession: string;
  father_contact: string;
  mother_name: string;
  mother_profession: string;
  mother_contact: string;
  total_brother: string;
  total_sister: string;
}

const defaultForm: Form = {
  father_name: '',
  father_profession: '',
  father_contact: '',
  mother_name: '',
  mother_profession: '',
  mother_contact: '',
  total_brother: '',
  total_sister: '',
};

const FamilyInformationForm: React.FC<Props> = ({ stored }) => {
  const [form, setForm] = useState<Form>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (stored) {
      const mapped: Partial<typeof defaultForm> = {
        total_brother: (stored.total_brother ?? stored.totalBrothers ?? stored.total_brothers)?.toString() ?? '',
        total_sister: (stored.total_sister ?? stored.totalSisters ?? stored.total_sisters)?.toString() ?? '',
      } as any;
      setForm({ ...defaultForm, ...stored, ...mapped });
    }
  }, [stored]);

  const handleChange = (key: keyof Form, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await apiService.updateFamilyInfo({ ...form });
      if (res.status === 'success') Alert.alert('Success', res.message || 'Updated');
      else Alert.alert('Error', res.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const row = (leftKey: keyof Form, leftLabel: string, rightKey: keyof Form, rightLabel: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.label}>{leftLabel}</Text>
        <TextInput style={styles.input} value={form[leftKey]} onChangeText={(t) => handleChange(leftKey, t)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{rightLabel}</Text>
        <TextInput style={styles.input} value={form[rightKey]} onChangeText={(t) => handleChange(rightKey, t)} />
      </View>
    </View>
  );

  return (
    <View>
      {/* Parents Names */}
      <Text style={styles.label}>Father's Name *</Text>
      <TextInput style={styles.input} value={form.father_name} onChangeText={(t) => handleChange('father_name', t)} />

      {row('father_profession', "Father's Profession", 'father_contact', "Father's Contact")}

      <Text style={styles.label}>Mother's Name *</Text>
      <TextInput style={styles.input} value={form.mother_name} onChangeText={(t) => handleChange('mother_name', t)} />

      {row('mother_profession', "Mother's Profession", 'mother_contact', "Mother's Contact")}

      {row('total_brother', 'Total Brother', 'total_sister', 'Total Sister')}

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default FamilyInformationForm;

const styles = StyleSheet.create({
  label: { marginTop: 12, marginBottom: 4, fontSize: 13, fontWeight: '600', color: '#6B7280' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
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
