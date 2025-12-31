import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

interface CareerItem {
  id: number;
  company: string;
  designation: string;
  start: string;
  end: string;
}

const CareerInformationSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CareerItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CareerItem | null>(null);
  const [form, setForm] = useState({ company: '', designation: '', start: '', end: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    console.log('📥 Fetch careers');
    setLoading(true);
    try {
      const res = await apiService.getCareers();
      if (res.status === 'success') {
        const list = res.careers || res.data?.careers || res.data?.data?.careers || res.data || [];
        console.log('👔 Careers fetched', list);
        setItems(Array.isArray(list) ? list : []);
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
    setForm({ company: '', designation: '', start: '', end: '' });
    setModalVisible(true);
  };
  const openEdit = (item: CareerItem) => {
    setEditing(item);
    setForm({ company: item.company, designation: item.designation, start: item.start, end: item.end });
    setModalVisible(true);
  };
  const submit = async () => {
    if (!form.company || !form.designation) return Alert.alert('Validation', 'Company and Designation are required');
    setSubmitting(true);
    try {
      let res;
      if (editing) res = await apiService.updateCareer(editing.id, form);
      else res = await apiService.createCareer(form);
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
  const del = async (id: number) => {
    if (!id) return;
    Alert.alert('Confirm', 'Delete this entry?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await apiService.deleteCareer(id); load(); } catch (e) { Alert.alert('Error', 'Failed'); }
        }
      }
    ]);
  };

  const renderItem = ({ item, index }: { item: CareerItem; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.row}><Text style={styles.label}>S.N </Text>{index + 1}</Text>
      <Text style={styles.row}><Text style={styles.label}>Company </Text>{item.company}</Text>
      <Text style={styles.row}><Text style={styles.label}>Designation </Text>{item.designation}</Text>
      <Text style={styles.row}><Text style={styles.label}>Start </Text>{item.start}</Text>
      <Text style={styles.row}><Text style={styles.label}>End </Text>{item.end}</Text>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Feather name="edit" size={16} color="#059669" /></TouchableOpacity>
        <TouchableOpacity onPress={() => del(item.id)} style={styles.iconBtn}><Feather name="trash-2" size={16} color="#DC2626" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Feather name="plus" size={14} color="#fff" /><Text style={styles.addBtnText}> Add New</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <View>
          {items.map((item, idx) => (
          <React.Fragment key={item.id ?? idx}>
            {renderItem({ item, index: idx })}
          </React.Fragment>
        ))}
        </View>
      )}

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editing ? 'Edit Career Information' : 'Add Career Information'}</Text>
          {['company', 'designation', 'start', 'end'].map((f, idx) => (
            <TextInput
              key={f}
              style={[styles.input, idx > 0 && { marginTop: 10 }]}
              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
              keyboardType={f === 'start' || f === 'end' ? 'numeric' : 'default'}
              value={(form as any)[f]}
              onChangeText={(t) => setForm((p) => ({ ...p, [f]: t }))}
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

export default CareerInformationSection;

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
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  row: { fontSize: 13, color: '#374151', marginBottom: 2 },
  label: { fontWeight: '600' },
  iconBtn: { marginRight: 12 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#C6222F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
