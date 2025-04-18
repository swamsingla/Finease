import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

const UploadPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const uploadOptions = [
    { id: 'document', title: 'Upload Document', icon: 'document-outline' },
    { id: 'photo', title: 'Take Photo', icon: 'camera-outline' },
    { id: 'scan', title: 'Scan Document', icon: 'scan-outline' },
  ];
  
  const recentDocuments = [
    { id: 1, name: 'Invoice_1234.pdf', date: '10 Aug 2023', icon: 'document-text' },
    { id: 2, name: 'Receipt_5678.jpg', date: '05 Aug 2023', icon: 'image' },
    { id: 3, name: 'Contract.pdf', date: '01 Aug 2023', icon: 'document-text' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.pageTitle}>Upload Documents</Text>
        
        <View style={styles.uploadSection}>
          {uploadOptions.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.uploadOption,
                selectedOption === option.id ? styles.selectedOption : null
              ]}
              onPress={() => setSelectedOption(option.id)}
            >
              <Ionicons 
                name={option.icon} 
                size={32} 
                color={selectedOption === option.id ? "#fff" : "#007bff"} 
              />
              <Text style={[
                styles.uploadOptionText,
                selectedOption === option.id ? styles.selectedOptionText : null
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.uploadBox}>
          <View style={styles.dottedBorder}>
            <Ionicons name="cloud-upload-outline" size={60} color="#007bff" />
            <Text style={styles.uploadBoxTitle}>
              {selectedOption === 'document' ? 'Select a document to upload' : 
               selectedOption === 'photo' ? 'Take a photo' : 
               selectedOption === 'scan' ? 'Scan a document' : 
               'Select an option above'}
            </Text>
            {selectedOption && (
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>
                  {selectedOption === 'document' ? 'Choose File' : 
                   selectedOption === 'photo' ? 'Open Camera' : 
                   'Start Scan'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          
          {recentDocuments.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <Ionicons name={doc.icon} size={24} color="#007bff" />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <BottomNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 25,
  },
  uploadSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  uploadOption: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#007bff',
  },
  uploadOptionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
  },
  uploadBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  dottedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 10,
    width: '100%',
    padding: 30,
    alignItems: 'center',
  },
  uploadBoxTitle: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  docInfo: {
    flex: 1,
    marginLeft: 15,
  },
  docName: {
    fontSize: 16,
    color: '#333',
  },
  docDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});

export default UploadPage;
