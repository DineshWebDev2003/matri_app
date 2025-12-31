import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

interface Props {
  options: {
    religions: any[];
    marital_statuses: any[];
    countries: any[] | Record<string, any>;
  } | null;
  stored: any | null; // partner expectation object from API if available
}

interface Form {
  general_requirement: string;
  country: string;
  min_age: string;
  max_age: string;
  min_height: string;
  max_height: string;
  max_weight: string;
  marital_status: string;
  religion: string;
  face_color: string;
  smoking_status: string;
  drinking_status: string;
  min_degree: string;
  profession: string;
  personality: string;
  family_position: string;
  annual_income: string;
  languages: string[];
  eating_habits: string;
  body_type: string;
  hair_color: string;
  hobbies: string;
  interests: string;
}

const defaultForm: Form = {
  general_requirement: '',
  country: '',
  min_age: '',
  max_age: '',
  min_height: '',
  max_height: '',
  max_weight: '',
  marital_status: '',
  religion: '',
  face_color: '',
  smoking_status: '0',
  drinking_status: '0',
  min_degree: '',
  profession: '',
  personality: '',
  family_position: '',
  annual_income: '',
  languages: [],
};

const PartnerExpectationForm: React.FC<Props> = ({ options, stored }) => {
  const [form, setForm] = useState<Form>(defaultForm);
  const [languageInput, setLanguageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (stored) {
      console.log('👀 PartnerExpectation raw -->', stored);
      // map possible backend keys to our form keys
      const mapped: Partial<Form> = {
        min_age: (stored.min_age ?? stored.minimum_age)?.toString() ?? '',
        max_age: (stored.max_age ?? stored.maximum_age)?.toString() ?? '',
        min_height: (stored.min_height ?? stored.minimum_height)?.toString() ?? '',
        max_height: (stored.max_height ?? stored.maximum_height)?.toString() ?? '',
        max_weight: (stored.max_weight ?? stored.maximum_weight)?.toString() ?? '',
        face_color: stored.face_color ?? stored.face_colour ?? stored.complexion ?? '',
        annual_income: (stored.annual_income ?? stored.annualIncome ?? stored.financial_condition)?.toString() ?? '',
        languages: stored.languages ?? stored.language ?? [],
      } as any;

      setForm({
        ...defaultForm,
        ...stored,
        ...mapped,
      });
    }
  }, [stored]);

  const handleChange = (key: keyof Form, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await apiService.updatePartnerExpectation({ ...form });
      if (res.status === 'success') Alert.alert('Success', res.message || 'Updated');
      else Alert.alert('Error', res.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const countriesArr = (() => {
    if (!options) return [] as any[];
    if (Array.isArray(options.countries)) return options.countries as any[];
    if (typeof options.countries === 'object')
      return Object.entries(options.countries).map(([code, obj]: any) => ({ id: code, name: obj.country || obj.name || code }));
    return [] as any[];
  })();

  return (
    <View>
      <Text style={styles.label}>General Requirement</Text>
      <TextInput
        style={[styles.input, { height: 80 }]} multiline value={form.general_requirement} onChangeText={(t) => handleChange('general_requirement', t)}
      />

      <Text style={styles.label}>Country</Text>
      <Picker selectedValue={form.country} onValueChange={(v) => handleChange('country', v)} style={styles.picker}>
        <Picker.Item label="Select One" value="" />
        {countriesArr.map((c: any) => (
          <Picker.Item key={c.id} label={c.name} value={c.name} />
        ))}
      </Picker>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Minimum Age</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.min_age} onChangeText={(t) => handleChange('min_age', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Maximum Age</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.max_age} onChangeText={(t) => handleChange('max_age', t)} />
        </View>
      </View>

      {/* Height Range */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Minimum Height</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.min_height} onChangeText={(t) => handleChange('min_height', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Maximum Height</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.max_height} onChangeText={(t) => handleChange('max_height', t)} />
        </View>
      </View>

      {/* Max Weight & Marital Status */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Maximum Weight</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={form.max_weight} onChangeText={(t) => handleChange('max_weight', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Marital Status</Text>
          <Picker selectedValue={form.marital_status} onValueChange={(v) => handleChange('marital_status', v)} style={styles.picker}>
            <Picker.Item label="Select One" value="" />
            {options?.marital_statuses?.map?.((m: any) => (
              <Picker.Item key={m.id} label={m.name} value={m.name} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Religion & Face Colour */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Religion</Text>
          <Picker selectedValue={form.religion} onValueChange={(v) => handleChange('religion', v)} style={styles.picker}>
            <Picker.Item label="Select One" value="" />
            {options?.religions?.map?.((r: any) => (
              <Picker.Item key={r.id} label={r.name} value={r.name} />
            ))}
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Face Colour</Text>
          <TextInput style={styles.input} value={form.face_color} onChangeText={(t) => handleChange('face_color', t)} />
        </View>
      </View>

      {/* Smoking & Drinking */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Smoking Habits</Text>
          <Picker selectedValue={form.smoking_status} onValueChange={(v) => handleChange('smoking_status', v)} style={styles.picker}>
            <Picker.Item label="Does not matter" value="0" />
            <Picker.Item label="Smoker" value="1" />
            <Picker.Item label="Non-Smoker" value="2" />
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Drinking Status</Text>
          <Picker selectedValue={form.drinking_status} onValueChange={(v) => handleChange('drinking_status', v)} style={styles.picker}>
            <Picker.Item label="Does not matter" value="0" />
            <Picker.Item label="Drinker" value="1" />
            <Picker.Item label="Non-Drinker" value="2" />
          </Picker>
        </View>
      </View>

      {/* Degree & Profession */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Minimum Degree</Text>
          <TextInput style={styles.input} value={form.min_degree} onChangeText={(t) => handleChange('min_degree', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Profession</Text>
          <TextInput style={styles.input} value={form.profession} onChangeText={(t) => handleChange('profession', t)} />
        </View>
      </View>

      {/* Personality & Family Position */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Personality</Text>
          <TextInput style={styles.input} value={form.personality} onChangeText={(t) => handleChange('personality', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Family Position</Text>
          <TextInput style={styles.input} value={form.family_position} onChangeText={(t) => handleChange('family_position', t)} />
        </View>
      </View>

      {/* Annual Income */}
      <Text style={styles.label}>Annual Income</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.annual_income} onChangeText={(t) => handleChange('annual_income', t)} />

      {/* Languages Tag Input */}
      <Text style={styles.label}>Languages</Text>
      <View style={styles.tagInputContainer}>
        {form.languages.map((lang) => (
          <View key={lang} style={styles.tag}>
            <Text style={styles.tagText}>{lang}</Text>
            <TouchableOpacity style={styles.tagRemove} onPress={() => handleChange('languages', form.languages.filter((l) => l !== lang))}>
              <Feather name="x" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={styles.tagTextInput}
          value={languageInput}
          onChangeText={(text) => {
            if (text.includes(' ')) {
              const trimmed = text.trim();
              if (trimmed && !form.languages.includes(trimmed)) {
                handleChange('languages', [...form.languages, trimmed]);
              }
              setLanguageInput('');
            } else {
              setLanguageInput(text);
            }
          }}
          onSubmitEditing={() => {
            const trimmed = languageInput.trim();
            if (trimmed && !form.languages.includes(trimmed)) {
              handleChange('languages', [...form.languages, trimmed]);
            }
            setLanguageInput('');
          }}
          placeholder="Type language and press Enter"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default PartnerExpectationForm;

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
  tagInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 6,
    minHeight: 46,
    marginTop: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C6222F',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { color: '#fff', fontSize: 12 },
  tagRemove: { marginLeft: 4 },
  tagTextInput: { flex: 1, minWidth: 60 },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#C6222F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
