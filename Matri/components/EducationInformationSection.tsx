import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

interface EducationItem {
  id: number;
  institute: string;
  degree: string;
  field?: string;
  registration_no?: string;
  roll_no?: string;
  start_year: string;
  end_year?: string;
  result?: string;
  result_out_of?: string;
}

const defaultForm = {
  institute: '',
  degree: '',
  field: '',
  registration_no: '',
  roll_no: '',
  start_year: '',
  end_year: '',
  result: '',
  result_out_of: '',
};

const EducationInformationSection: React.FC = () => {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<EducationItem | null>(null);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    console.log('📥 Fetch educations');
    setLoading(true);
    try {
      const res = await apiService.getEducations();
      if (res.status === 'success') {
        const list = res.educations || res.data?.educations || res.data?.data?.educations || res.data || [];
        console.log('🎓 Educations fetched', list);
        const normalized = Array.isArray(list) ? list.map((it: any) => ({
          ...it,
          start_year: it.start_year ?? it.start ?? '',
          end_year: it.end_year ?? it.end ?? '',
          field: it.field ?? it.field_of_study ?? it.study_field ?? '',
        })) : [];
        setItems(normalized);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalVisible(true);
  };
  const openEdit = (item: EducationItem) => {
    setEditing(item);
    setForm({ ...defaultForm, ...item } as any);
    setModalVisible(true);
  };

  const submit = async () => {
    if (!form.institute || !form.degree) return Alert.alert('Validation', 'Institute and Degree are required');
    setSubmitting(true);
    try {
      let res;
      if (editing) res = await apiService.updateEducation(editing.id, form);
      else res = await apiService.createEducation(form);
      if (res.status === 'success') {
        setModalVisible(false);
        load();
      } else Alert.alert('Error', res.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const del = (id: number) => {
    Alert.alert('Confirm', 'Delete this entry?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await apiService.deleteEducation(id); load(); } catch { Alert.alert('Error', 'Failed'); }
        }
      }
    ]);
  };

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Feather name="plus" size={14} color="#fff" />
        <Text style={styles.addBtnText}> Add New</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <View>
          {items.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.row}><Text style={styles.label}>S.N </Text>{index + 1}</Text>
              <Text style={styles.row}><Text style={styles.label}>Degree </Text>{item.degree}</Text>
              <Text style={styles.row}><Text style={styles.label}>Institute </Text>{item.institute}</Text>
              {item.field ? <Text style={styles.row}><Text style={styles.label}>Field </Text>{item.field}</Text> : null}
              <Text style={styles.row}><Text style={styles.label}>Start </Text>{item.start_year}</Text>
              {item.end_year ? <Text style={styles.row}><Text style={styles.label}>End </Text>{item.end_year}</Text> : null}
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Feather name="edit" size={16} color="#059669" /></TouchableOpacity>
                <TouchableOpacity onPress={() => del(item.id)} style={styles.iconBtn}><Feather name="trash-2" size={16} color="#DC2626" /></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editing ? 'Edit Education Information' : 'Add Education Information'}</Text>
          {Object.entries(form).map(([key, val]) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              value={val}
              onChangeText={(t) => setForm((p) => ({ ...p, [key]: t }))}
              keyboardType={key.includes('year') || key.includes('result') ? 'numeric' : 'default'}
            />
          ))}
          <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default EducationInformationSection;

const styles = StyleSheet.create({
  addBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtnText: { color: '#fff', fontSize: 13, marginLeft: 4 },
  card: { backgroundColor: '#F3F4F6', borderRadius: 6, padding: 10, marginBottom: 10 },
  row: { fontSize: 13, color: '#374151', marginBottom: 2 },
  label: { fontWeight: '600' },
  iconBtn: { marginRight: 12 },
  modalContent: { flex: 1, backgroundColor: '#fff', padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 10, marginBottom: 10 },
  submitButton: { backgroundColor: '#C6222F', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
