import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function NewTicketScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Ticket</Text>
        <TouchableOpacity style={styles.myTicketsButton} onPress={() => router.push('/support-tickets')}>
          <Text style={styles.myTicketsButtonText}>My Tickets</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput style={styles.input} placeholder="Enter subject" />

          <Text style={styles.label}>Priority *</Text>
          {/* Replace with a custom dropdown component if needed */}
          <View style={styles.pickerContainer}>
            <Text>High</Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </View>

          <Text style={styles.label}>Message</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Enter your message" multiline />

          <Text style={styles.label}>Attachments</Text>
          <View style={styles.attachmentContainer}>
            <TouchableOpacity style={styles.chooseFileButton}>
              <Text style={styles.chooseFileButtonText}>Choose File</Text>
            </TouchableOpacity>
            <Text style={styles.fileName}>No file chosen</Text>
          </View>
          <Text style={styles.attachmentInfo}>Max 5 files can be uploaded. Maximum upload size is 100M</Text>
          <Text style={styles.attachmentInfo}>Allowed File Extensions: .jpg, .jpeg, .png, .pdf, .doc, .docx</Text>

          <TouchableOpacity style={styles.submitButton}>
            <Feather name="send" size={16} color="white" />
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
        paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  myTicketsButton: {
    backgroundColor: '#C6222F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  myTicketsButtonText: { color: 'white', fontWeight: 'bold' },
  contentContainer: { padding: 20 },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  label: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  attachmentContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chooseFileButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  chooseFileButtonText: { fontWeight: '500' },
  fileName: { marginLeft: 10, color: '#6B7280' },
  attachmentInfo: { color: '#6B7280', fontSize: 12, marginBottom: 5 },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C6222F',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});
