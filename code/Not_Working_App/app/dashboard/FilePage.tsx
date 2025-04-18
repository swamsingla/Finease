import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FilePage = () => {
  const router = useRouter();

  const filingOptions = [
    { id: 1, title: 'GST Filing', icon: 'calculator-outline', description: 'File your GST returns' },
    { id: 2, title: 'ITR Filing', icon: 'receipt-outline', description: 'File your income tax returns' },
    { id: 3, title: 'EPF Filing', icon: 'briefcase-outline', description: 'File your EPF returns' },
    { id: 4, title: 'TDS Filing', icon: 'cash-outline', description: 'File your TDS returns' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.pageTitle}>Filing Services</Text>
        <Text style={styles.subtitle}>Choose a service to start filing</Text>
        
        <View style={styles.filingContainer}>
          {filingOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.filingCard}>
              <View style={styles.iconContainer}>
                <Ionicons name={option.icon} size={32} color="#007bff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Assistance?</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.helpButtonText}>Chat with Support</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  filingContainer: {
    gap: 16,
  },
  filingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  helpSection: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '80%',
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FilePage;
