import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

const API_URL = Constants.expoConfig.extra.apiUrl || 'http://localhost:5000/api';

const GstFilingScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [gstData, setGstData] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchGSTData();
  }, []);

  const fetchGSTData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API endpoint with authentication
      const response = await axios.get(`${API_URL}/gst`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      setGstData(response.data);
      
      // Format GST data for download
      if (response.data && response.data.length > 0) {
        formatGSTData(response.data);
      }
    } catch (err) {
      console.error("Error fetching GST data:", err);
      setError("Failed to fetch GST data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Format GST data according to specified structure
  const formatGSTData = (data) => {
    if (!data || data.length === 0) {
      setFormattedData(null);
      return;
    }

    try {
      // Create the base structure
      const formatted = {
        gstin: data[0].gstin, // Using the first record's GSTIN
        fp: "032025", // Financial period - defaulting to March 2025
        version: "GST3.2.1",
        hash: "hash",
        b2b: []
      };

      // Group by CTIN
      const ctinGroups = {};
      data.forEach(item => {
        if (!ctinGroups[item.ctin]) {
          ctinGroups[item.ctin] = [];
        }
        ctinGroups[item.ctin].push(item);
      });

      // Create b2b array
      let invoiceNumber = 1; // Initialize invoice number counter
      Object.keys(ctinGroups).forEach(ctin => {
        const ctinEntry = {
          ctin: ctin,
          inv: []
        };

        // Create invoices for each CTIN
        ctinGroups[ctin].forEach((item) => {
          // Format the invoice date
          const invoiceDate = new Date(item.invoiceDate);
          const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}-${
            (invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${
            invoiceDate.getFullYear()}`;
          
          // Calculate taxable value based on GST rates
          const txval = (100/9) * parseFloat(item.cgst);
          
          ctinEntry.inv.push({
            inum: invoiceNumber.toString(),
            idt: formattedDate,
            val: parseFloat(item.totalAmount),
            pos: "36", // Position of supply code
            rchrg: "N", // Reverse charge
            inv_typ: "R", // Regular invoice
            itms: [
              {
                num: 1801,
                itm_det: {
                  txval: parseFloat(txval.toFixed(2)),
                  rt: 18, // GST rate (18%)
                  camt: parseFloat(item.cgst),
                  samt: parseFloat(item.sgst),
                  csamt: 0 // Cess amount
                }
              }
            ]
          });
          
          invoiceNumber++;
        });

        formatted.b2b.push(ctinEntry);
      });

      setFormattedData(formatted);
    } catch (error) {
      console.error("Error formatting GST data:", error);
      Alert.alert("Error", "Failed to format GST data for download.");
    }
  };

  // Save file using Storage Access Framework on Android or share on iOS
  const saveFile = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      try {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
            .then(async (createdUri) => {
              await FileSystem.writeAsStringAsync(createdUri, base64, { encoding: FileSystem.EncodingType.Base64 });
              Alert.alert("Success", "File saved successfully to selected location!");
            })
            .catch(e => {
              console.error("Error creating file with SAF:", e);
              Alert.alert("Error", "Could not save file. Opening share dialog instead.");
              shareAsync(uri);
            });
        } else {
          // Fallback to sharing if permissions denied
          shareAsync(uri);
        }
      } catch (err) {
        console.error("SAF Error:", err);
        Alert.alert("Error", "An error occurred. Opening share dialog instead.");
        shareAsync(uri);
      }
    } else {
      // iOS and Web use sharing
      shareAsync(uri);
    }
  };

  // Download the formatted data as JSON
  const downloadJSON = async () => {
    if (!formattedData) {
      Alert.alert("Error", "No formatted GST data available for download.");
      return;
    }
    
    try {
      setDownloadLoading(true);
      const jsonString = JSON.stringify(formattedData, null, 2);
      const fileName = `gst_filing_data_${Date.now()}.json`;
      const mimetype = 'application/json';
      
      if (Platform.OS === 'web') {
        // Web implementation - create a blob and download it
        const blob = new Blob([jsonString], { type: mimetype });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Native (iOS/Android) implementation
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Write the file to app's document directory
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        // Save or share the file using our helper
        await saveFile(fileUri, fileName, mimetype);
      }
    } catch (error) {
      console.error("Error preparing/downloading GST JSON:", error);
      Alert.alert("Error", `Failed to prepare GST data: ${error.message}`);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GST Filing Data</Text>
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading GST data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={40} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchGSTData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !gstData || gstData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Icon name="file-document-outline" size={40} color="#9ca3af" />
            <Text style={styles.noDataText}>No GST data found.</Text>
            <Text style={styles.noDataSubtext}>Please submit invoice data first.</Text>
          </View>
        ) : (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Your GST Filing Data</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Your GST data is ready for filing. Click the button below to download
                the JSON file.
              </Text>
            </View>

            {formattedData && (
              <View style={styles.dataPreview}>
                <Text style={styles.previewTitle}>Preview:</Text>
                <ScrollView 
                  style={styles.previewContent}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.previewContentContainer}
                >
                  <Text style={styles.previewText}>
                    {JSON.stringify(formattedData, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.downloadButton, downloadLoading && styles.disabledButton]} 
              onPress={downloadJSON}
              disabled={!formattedData || downloadLoading}
            >
              {downloadLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="download" size={20} color="#fff" style={styles.downloadIcon} />
                  <Text style={styles.downloadButtonText}>Download GST Filing JSON</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  noDataSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  dataContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxText: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  dataPreview: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  previewContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  previewContentContainer: {
    padding: 12,
  },
  previewText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#374151',
  },
  downloadButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GstFilingScreen;
