import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

const FileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const filingOptions = [
    {
      id: 'gst',
      title: 'GST Filing',
      description: 'File your GST returns and invoices',
      icon: 'file-document-outline',
      screen: 'GstFiling'
    },
    {
      id: 'itr',
      title: 'ITR Filing',
      description: 'File your income tax returns',
      icon: 'chart-bar',
      screen: 'ItrFiling'
    },
    {
      id: 'epf',
      title: 'EPF ECR Generator',
      description: 'Create and download ECR file for EPF submissions',
      icon: 'briefcase-outline',
      screen: 'EcrEpf'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Hello, {user?.name || 'User'}
        </Text>
        <Text style={styles.title}>Document Management</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filing Options</Text>
        {filingOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.card}
            onPress={() => navigation.navigate(option.screen)}
          >
            <Icon name={option.icon} size={24} color="#4b5563" style={styles.cardIcon} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  viewAllButton: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  }
});

export default FileScreen;