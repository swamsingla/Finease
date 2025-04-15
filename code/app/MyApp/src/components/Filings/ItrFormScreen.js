import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl || 'http://localhost:5000/api';

const ItrFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    panNo: '',
    tan: '',
    addressEmployee: '',
    addressEmployer: '',
    period: {
      from: '',
      to: '',
    },
    grossTotalIncome: '',
    grossTaxableIncome: '',
    netTaxPayable: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractionStatus, setExtractionStatus] = useState('');

  // Handle incoming file from ScanUpload
  useEffect(() => {
    if (route.params?.fileUri) {
      setExtractionStatus('Starting data extraction...');
      extractDataFromDocument(route.params.fileUri);
    }
  }, [route.params]);

  // Function to extract data from ITR document
  const extractDataFromDocument = async (fileUri) => {
    setExtractionStatus('Extracting data from ITR document...');
    setLoading(true);

    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'itr_document.jpg'
      });

      // Simulate extraction (replace with actual OCR API in production)
      setTimeout(() => {
        // Simulated response
        const extractedData = {
          email: user?.email || '',
          panNo: 'ABCDE1234F',
          tan: 'BANG12345B',
          addressEmployee: '123 Employee St, Bangalore 560001',
          addressEmployer: '456 Employer Rd, Bangalore 560002',
          period: {
            from: '2024-04-01',
            to: '2025-03-31',
          },
          grossTotalIncome: '1500000',
          grossTaxableIncome: '1200000',
          netTaxPayable: '125000',
        };
        
        setFormData(extractedData);
        setExtractionStatus('✅ Data extracted successfully!');
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error extracting data:", error);
      setError("Failed to extract data. Please fill the form manually.");
      setExtractionStatus("❌ Extraction failed");
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    // Handle nested period object
    if (name === 'fromDate' || name === 'toDate') {
      setFormData({
        ...formData,
        period: {
          ...formData.period,
          [name === 'fromDate' ? 'from' : 'to']: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.panNo || !formData.grossTaxableIncome) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send the form data to the backend
      await axios.post(`${API_URL}/itr`, formData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Alert.alert(
        'Success', 
        'ITR data submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error) {
      console.error("Error submitting ITR data:", error);
      setError("Failed to submit ITR data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Income Tax Return Filing</Text>

      {extractionStatus ? (
        <View style={[
          styles.statusContainer,
          extractionStatus.includes('failed') || extractionStatus.includes('❌')
            ? styles.errorStatus
            : extractionStatus.includes('Starting')
              ? styles.infoStatus
              : styles.successStatus
        ]}>
          <Text style={styles.statusText}>{extractionStatus}</Text>
        </View>
      ) : null}

      {/* Form fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PAN Number*</Text>
        <TextInput
          style={styles.input}
          value={formData.panNo}
          onChangeText={(value) => handleChange('panNo', value)}
          autoCapitalize="characters"
          placeholder="e.g., ABCDE1234F"
        />

        <Text style={styles.label}>TAN</Text>
        <TextInput
          style={styles.input}
          value={formData.tan}
          onChangeText={(value) => handleChange('tan', value)}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Employee Address</Text>
        <TextInput
          style={styles.input}
          value={formData.addressEmployee}
          onChangeText={(value) => handleChange('addressEmployee', value)}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Employer Address</Text>
        <TextInput
          style={styles.input}
          value={formData.addressEmployer}
          onChangeText={(value) => handleChange('addressEmployer', value)}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Assessment Period</Text>
        <View style={styles.periodContainer}>
          <View style={styles.periodField}>
            <Text style={styles.label}>From</Text>
            <TextInput
              style={styles.input}
              value={formData.period.from}
              onChangeText={(value) => handleChange('fromDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.periodField}>
            <Text style={styles.label}>To</Text>
            <TextInput
              style={styles.input}
              value={formData.period.to}
              onChangeText={(value) => handleChange('toDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Income Details</Text>
        <Text style={styles.label}>Gross Total Income (₹)*</Text>
        <TextInput
          style={styles.input}
          value={formData.grossTotalIncome}
          onChangeText={(value) => handleChange('grossTotalIncome', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gross Taxable Income (₹)*</Text>
        <TextInput
          style={styles.input}
          value={formData.grossTaxableIncome}
          onChangeText={(value) => handleChange('grossTaxableIncome', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Net Tax Payable (₹)*</Text>
        <TextInput
          style={styles.input}
          value={formData.netTaxPayable}
          onChangeText={(value) => handleChange('netTaxPayable', value)}
          keyboardType="numeric"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorStatus: {
    backgroundColor: '#ffebee',
  },
  infoStatus: {
    backgroundColor: '#e3f2fd',
  },
  successStatus: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
    color: '#333',
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodField: {
    width: '48%',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#757575',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ItrFormScreen;