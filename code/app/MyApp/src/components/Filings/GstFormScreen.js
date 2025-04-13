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

const GstFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    gstin: '',
    ctin: '',
    invoiceDate: '',
    placeOfSupply: '',
    address: '',
    cgst: '',
    sgst: '',
    totalAmount: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractionStatus, setExtractionStatus] = useState('');

  // Handle incoming file from ScanUpload
  useEffect(() => {
    if (route.params?.fileUri) {
      setExtractionStatus('Starting data extraction...');
      extractDataFromInvoice(route.params.fileUri);
    }
  }, [route.params]);

  // Function to extract data from invoice using API
  const extractDataFromInvoice = async (fileUri) => {
    setExtractionStatus('Extracting data from invoice...');
    setLoading(true);

    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg', // Adjust as needed
        name: 'invoice.jpg'
      });

      // Here you would integrate with your OCR service (like Nanonets)
      // For now, we'll just simulate a response
      setTimeout(() => {
        // Simulated response - in a real app replace with actual API call
        const extractedData = {
          email: user?.email || '',
          gstin: 'GST12345678XYZ',
          ctin: 'CTIN98765432ZYX',
          invoiceDate: '2025-04-01',
          placeOfSupply: 'Karnataka',
          address: '123 Main St, Bangalore',
          cgst: '1800',
          sgst: '1800',
          totalAmount: '21600'
        };
        
        setFormData(extractedData);
        setExtractionStatus('✅ Data extracted successfully!');
        setLoading(false);
      }, 2000);

      /* In a production app, replace the above with your actual API call:
      const result = await axios.post(
        'YOUR_OCR_API_ENDPOINT',
        formData,
        {
          headers: {
            'Authorization': 'YOUR_AUTH_TOKEN',
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Process the extracted data
      const extractedData = processAPIResponse(result.data);
      setFormData(prevData => ({
        ...prevData,
        ...extractedData
      }));
      setExtractionStatus("✅ Data extracted successfully!");
      */
      
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
    if (!formData.gstin || !formData.ctin || !formData.invoiceDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send the form data to the backend
      await axios.post(`${API_URL}/gst`, formData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Alert.alert(
        'Success', 
        'GST data submitted successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Dashboard')
          }
        ]
      );
    } catch (error) {
      console.error("Error submitting GST data:", error);
      setError("Failed to submit GST data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GST Filing</Text>

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

        <Text style={styles.label}>GSTIN</Text>
        <TextInput
          style={styles.input}
          value={formData.gstin}
          onChangeText={(value) => handleChange('gstin', value)}
          autoCapitalize="none"
        />

        <Text style={styles.label}>CTIN</Text>
        <TextInput
          style={styles.input}
          value={formData.ctin}
          onChangeText={(value) => handleChange('ctin', value)}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Invoice Date</Text>
        <TextInput
          style={styles.input}
          value={formData.invoiceDate}
          onChangeText={(value) => handleChange('invoiceDate', value)}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Place of Supply</Text>
        <TextInput
          style={styles.input}
          value={formData.placeOfSupply}
          onChangeText={(value) => handleChange('placeOfSupply', value)}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleChange('address', value)}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>CGST</Text>
        <TextInput
          style={styles.input}
          value={formData.cgst}
          onChangeText={(value) => handleChange('cgst', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>SGST</Text>
        <TextInput
          style={styles.input}
          value={formData.sgst}
          onChangeText={(value) => handleChange('sgst', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Total Amount</Text>
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

export default GstFormScreen;