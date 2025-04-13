import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FilingOptionsScreen = () => {
  const navigation = useNavigation();

  const filingOptions = [
    {
      id: 'gst',
      title: 'GST Filing',
      description: 'File your GST returns and invoices',
      icon: 'file-document-outline',
      navigateTo: 'GstFiling'
    },
    {
      id: 'itr',
      title: 'ITR Filing',
      description: 'File your income tax returns',
      icon: 'chart-bar',
      navigateTo: 'ItrFiling'
    },
    {
      id: 'epf',
      title: 'EPF ECR Generator',
      description: 'Create and download ECR file for EPF submissions',
      icon: 'briefcase-outline',
      navigateTo: 'EpfEcr'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Filing Type</Text>
      
      {filingOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={styles.optionCard}
          onPress={() => navigation.navigate(option.navigateTo)}
        >
          <Icon name={option.icon} size={24} color="#555" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2
  },
  icon: {
    marginRight: 16
  },
  textContainer: {
    flex: 1
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  optionDescription: {
    fontSize: 14,
    color: '#555'
  }
});

export default FilingOptionsScreen;