import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import file system conditionally
let FileSystem;
let Sharing;
let MediaLibrary;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
  MediaLibrary = require('expo-media-library');
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ItrFilingScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [itrData, setItrData] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchITRData();
  }, []);

  const fetchITRData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API endpoint with authentication
      const response = await axios.get(`${API_URL}/itr`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      setItrData(response.data);
      
      // Format ITR data for download
      if (response.data && response.data.length > 0) {
        formatITRData(response.data);
      }
    } catch (err) {
      console.error("Error fetching ITR data:", err);
      setError("Failed to fetch ITR data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Format ITR data according to specified structure
  const formatITRData = (data) => {
    if (!data || data.length === 0) {
      setFormattedData(null);
      return;
    }

    try {
      // Create the ITR-1 form data structure (simplified for example)
      const formatted = {
        version: "ITR-1_2024",
        formName: "INDIAN INCOME TAX RETURN",
        assessmentYear: "2024-25",
        panCard: data[0].panNo,
        taxpayerDetails: {
          name: data[0].name || "Taxpayer Name",
          email: data[0].email,
          address: data[0].addressEmployee,
          employerAddress: data[0].addressEmployer,
        },
        filingPeriod: {
          from: data[0].period?.from,
          to: data[0].period?.to
        },
        incomeDetails: {
          grossTotalIncome: parseFloat(data[0].grossTotalIncome),
          grossTaxableIncome: parseFloat(data[0].grossTaxableIncome),
          netTaxPayable: parseFloat(data[0].netTaxPayable),
          taxDeductedAtSource: parseFloat(data[0].tdsAmount || 0),
          interestPayable: parseFloat(data[0].interestPayable || 0)
        },
        verificationDetails: {
          place: "Place of verification",
          date: new Date().toISOString().split('T')[0]
        }
      };

      setFormattedData(formatted);
    } catch (error) {
      console.error("Error formatting ITR data:", error);
      Alert.alert("Error", "Failed to format ITR data for download.");
    }
  };

  // Request storage permission (for Android)
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission Required",
          message: "This app needs access to your storage to download files",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error("Permission request error:", err);
      return false;
    }
  };

  // Download the formatted data as JSON - cross-platform implementation
  const downloadJSON = async () => {
    if (!formattedData) {
      Alert.alert("Error", "No formatted ITR data available for download.");
      return;
    }
    
    try {
      setDownloadLoading(true);
      const jsonString = JSON.stringify(formattedData, null, 2);
      const fileName = `itr_filing_data_${Date.now()}.json`;
      
      if (Platform.OS === 'web') {
        // Web implementation - create a blob and download it
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // No need for an alert on web as the browser handles the download UI
      } else {
        // Native (iOS/Android) implementation
        
        // Request storage permission
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert("Permission Denied", "Storage permission is required to download files.");
          setDownloadLoading(false);
          return;
        }
        
        // Request media library permission
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Media library permission is required to save files.');
          setDownloadLoading(false);
          return;
        }
        
        // For Android/iOS, first save to app's internal storage
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // Write the file to internal storage
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        // For Android, copy file to Downloads folder for better visibility
        if (Platform.OS === 'android') {
          try {
            // Create asset in media library
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            
            // Create "Downloads" album if it doesn't exist and add file to it
            const album = await MediaLibrary.getAlbumAsync('Downloads');
            if (album === null) {
              await MediaLibrary.createAlbumAsync('Downloads', asset, false);
            } else {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            }
            
            Alert.alert(
              "Download Complete", 
              `File saved to Downloads folder as ${fileName}`
            );
          } catch (error) {
            console.log("Error saving to downloads:", error);
            // Fallback to sharing
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/json',
              dialogTitle: 'Download ITR Data',
              UTI: 'public.json'
            });
          }
        } else {
          // For iOS and other platforms, use the sharing API
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Download ITR Data',
            UTI: 'public.json'
          });
        }
        
        Alert.alert("Success", "ITR data file has been downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading JSON:", error);
      Alert.alert("Error", `Failed to download ITR data: ${error.message}`);
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
        <Text style={styles.headerTitle}>ITR Filing Data</Text>
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading ITR data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={40} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchITRData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !itrData || itrData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Icon name="file-document-outline" size={40} color="#9ca3af" />
            <Text style={styles.noDataText}>No ITR data found.</Text>
            <Text style={styles.noDataSubtext}>Please submit income tax return data first.</Text>
          </View>
        ) : (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Your ITR Filing Data</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Your ITR data is ready for filing. Click the button below to download
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
                  <Text style={styles.downloadButtonText}>Download ITR Filing JSON</Text>
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
    backgroundColor: '#8a2be2', // Purple color for ITR
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

export default ItrFilingScreen;