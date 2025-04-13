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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EpfFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    trrnNo: '',
    establishmentId: '',
    establishmentName: '',
    wageMonth: '',
    member: '',
    totalAmount: '',
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

  // Function to extract data from EPF document
  const extractDataFromDocument = async (fileUri) => {
    setExtractionStatus('Extracting data from EPF document...');
    setLoading(true);

    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'epf_document.jpg'
      });

      // Simulate extraction (replace with actual OCR API in production)
      setTimeout(() => {
        // Simulated response
        const extractedData = {
          email: user?.email || '',
          trrnNo: 'TRRN1234567890',
          establishmentId: 'MHBAN0012345678',
          establishmentName: 'ABC Technologies Private Limited',
          wageMonth: 'Mar 2025',
          member: '15',
          totalAmount: '125000',
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.establishmentId || !formData.wageMonth) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send the form data to the backend
      await axios.post(`${API_URL}/epf`, formData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Alert.alert(
        'Success', 
        'EPF data submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error) {
      console.error("Error submitting EPF data:", error);
      setError("Failed to submit EPF data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>EPF Filing</Text>

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

        <Text style={styles.label}>TRRN Number</Text>
        <TextInput
          style={styles.input}
          value={formData.trrnNo}
          onChangeText={(value) => handleChange('trrnNo', value)}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Establishment ID*</Text>
        <TextInput
          style={styles.input}
          value={formData.establishmentId}
          onChangeText={(value) => handleChange('establishmentId', value)}
          placeholder="e.g., MHBAN0012345678"
        />

        <Text style={styles.label}>Establishment Name*</Text>
        <TextInput
          style={styles.input}
          value={formData.establishmentName}
          onChangeText={(value) => handleChange('establishmentName', value)}
          placeholder="e.g., ABC Technologies Private Limited"
        />

        <Text style={styles.label}>Wage Month*</Text>
        <TextInput
          style={styles.input}
          value={formData.wageMonth}
          onChangeText={(value) => handleChange('wageMonth', value)}
          placeholder="e.g., Mar 2025"
        />

        <Text style={styles.label}>Number of Members*</Text>
        <TextInput
          style={styles.input}
          value={formData.member}
          onChangeText={(value) => handleChange('member', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Total Amount (₹)*</Text>
        <TextInput
          style={styles.input}
          value={formData.totalAmount}
          onChangeText={(value) => handleChange('totalAmount', value)}
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
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4caf50',
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

export default EpfFormScreen;