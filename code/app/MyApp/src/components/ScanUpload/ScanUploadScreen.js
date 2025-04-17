import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';

// Import react-native-image-picker for web platform
// We conditionally use this only on web
let launchCamera;
let launchImageLibrary;
if (Platform.OS === 'web') {
  // Dynamic import for web only
  try {
    const ImagePickerModule = require('react-native-image-picker');
    launchCamera = ImagePickerModule.launchCamera;
    launchImageLibrary = ImagePickerModule.launchImageLibrary;
  } catch (e) {
    console.warn('react-native-image-picker not available, web functionality may be limited');
  }
}

// Simple text-based icon component
const SimpleIcon = ({ name, size = 20, color = '#4B5563' }) => {
  const iconMap = {
    'home': '🏠',
    'file': '📄',
    'upload': '⬆️',
    'file-text': '📝',
    'camera': '📸',
    'document': '📂',
    'gallery': '🖼️',
    'image': '🖼️',
    'pdf': '📄',
  };

  return (
    <Text style={{ fontSize: size, color: color }}>
      {iconMap[name] || '•'}
    </Text>
  );
};

const ScanUploadPage = () => {
  const navigation = useNavigation();
  const [fileURI, setFileURI] = useState(null);
  const [isPDF, setIsPDF] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [classification, setClassification] = useState(null);
  const [classificationLoading, setClassificationLoading] = useState(false);
  
  // Function to handle document picking from device storage
  const handleDocumentPick = async () => {
    setIsUploading(true);
    
    try {
      if (Platform.OS === 'web' && launchImageLibrary) {
        // For web platform, use react-native-image-picker as in the original code
        const options = {
          mediaType: 'mixed',
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          selectionLimit: 1,
          type: 'library',
        };
        
        launchImageLibrary(options, (response) => {
          setIsUploading(false);
          
          if (response.didCancel) {
            console.log('User cancelled document picker');
            return;
          }
          
          if (response.errorCode) {
            console.error('ImagePicker Error: ', response.errorMessage);
            Alert.alert('Error', 'Failed to pick document: ' + response.errorMessage);
            return;
          }
          
          if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            const uri = asset.uri;
            const type = asset.type;
            const name = asset.fileName || 'Document';
            
            console.log('Selected file:', { uri, type, name });
            
            setFileURI(uri);
            setFileName(name);
            setIsPDF(type && type.includes('pdf'));
            
            // Classify the document
            console.log('DETAILED URI INFO:', {
              uri: asset.uri,
              uriStartsWith: asset.uri.substring(0, 30),
              uriLength: asset.uri.length
            });
            classifyDocument(asset);
          } else {
            Alert.alert('Error', 'No file was selected');
          }
        });
      } else {
        // For Android with Expo Go, use Expo's ImagePicker
        // First, request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to upload documents');
          setIsUploading(false);
          return;
        }
        
        // Launch image picker for images
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });
        
        setIsUploading(false);
        
        if (result.canceled) {
          console.log('User cancelled document picker');
          return;
        }

        if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const uri = asset.uri;
          // Determine file type from uri
          const mimeType = asset.mimeType || 'application/octet-stream';
          const isPdf = mimeType === 'application/pdf';
          
          // Create an asset-like object for compatibility with the classify function
          const assetForClassify = {
            uri: uri,
            type: mimeType,
            fileName: asset.name || `document.${isPdf ? 'pdf' : 'jpg'}`
          };
          
          console.log('Selected file:', { uri, type: assetForClassify.type, name: assetForClassify.fileName });
          
          setFileURI(uri);
          setFileName(assetForClassify.fileName);
          // FIX: Use the isPdf variable we defined above instead of the undefined fileType variable
          setIsPDF(isPdf);
          
          // Classify the document
          classifyDocument(assetForClassify);
        } else {
          Alert.alert('Error', 'No file was selected');
        }
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document: ' + err.message);
      setIsUploading(false);
    }
  };
  
  // Function to handle camera capture
  const handleCameraCapture = async () => {
    try {
      if (Platform.OS === 'web' && launchCamera) {
        // Use react-native-image-picker for web as in the original code
        const options = {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          saveToPhotos: true,
          quality: 0.8,
        };
        
        launchCamera(options, (response) => {
          if (response.didCancel) {
            console.log('User cancelled camera');
            return;
          }
          
          if (response.errorCode) {
            console.error('Camera Error: ', response.errorMessage);
            Alert.alert('Error', 'Failed to capture image: ' + response.errorMessage);
            return;
          }
          
          if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            setFileURI(asset.uri);
            setFileName('Camera_' + new Date().toISOString().split('T')[0]);
            setIsPDF(false);
            console.log('DETAILED URI INFO:', {
              uri: asset.uri,
              uriStartsWith: asset.uri.substring(0, 30),
              uriLength: asset.uri.length
            });
            // Classify the document
            classifyDocument(asset);
          } else {
            Alert.alert('Error', 'No image was captured');
          }
        });
      } else {
        // For Android with Expo Go, use Expo's Camera
        // First check for camera permissions
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera permissions to take a photo');
          return;
        }
        
        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
        });
        
        if (result.canceled) {
          console.log('User cancelled camera');
          return;
        }
        
        if (result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const uri = asset.uri;
          
          // Create an asset-like object for compatibility with the classify function
          const assetForClassify = {
            uri: uri,
            type: 'image/jpeg',
            fileName: 'Camera_' + new Date().toISOString().split('T')[0] + '.jpg'
          };
          
          setFileURI(uri);
          setFileName(assetForClassify.fileName);
          setIsPDF(false);
          
          // Classify the document
          classifyDocument(assetForClassify);
        } else {
          Alert.alert('Error', 'No image was captured');
        }
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      Alert.alert('Error', 'Failed to capture image: ' + err.message);
    }
  };

  // Function to classify document
  const classifyDocument = async (asset) => {
    setClassificationLoading(true);
    setClassification(null);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      
      // Debug: Log asset details before appending to FormData
      console.log('Asset details for debugging:', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      });
      
      // Determine if the URI is a base64 data URL
      const isBase64DataUrl = asset.uri && asset.uri.startsWith('data:');
      console.log('Is base64 data URL:', isBase64DataUrl);
      
      let fileToUpload;
      
      if (isBase64DataUrl && Platform.OS === 'web') {
        // For web with base64 data URL: Convert to Blob
        console.log('Converting base64 data URL to Blob for web upload');
        
        try {
          // Extract the base64 data (remove the data:image/png;base64, prefix)
          const base64Data = asset.uri.split(',')[1];
          const contentType = asset.uri.split(';')[0].split(':')[1] || 'image/jpeg';
          
          // Convert base64 to Blob using fetch API (works in browser environment)
          const response = await fetch(`data:${contentType};base64,${base64Data}`);
          const blob = await response.blob();
          
          console.log('Successfully created Blob from base64 data', {
            size: blob.size,
            type: blob.type
          });
          
          // Use the Blob directly with a filename
          fileToUpload = new File(
            [blob], 
            asset.fileName || `image.${contentType.split('/')[1]}`,
            { type: contentType }
          );
        } catch (e) {
          console.error('Error converting base64 to Blob:', e);
          throw new Error('Failed to process image data');
        }
      } else {
        // Normal case: Use the asset URI directly
        fileToUpload = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'document.' + (asset.type ? asset.type.split('/')[1] : 'jpg'),
        };
      }
      
      // Debug: Log file object being appended to FormData
      console.log('File object being appended to FormData:', 
        isBase64DataUrl ? { type: fileToUpload.type, name: fileToUpload.name, isBlob: true } : fileToUpload
      );
      
      // Append the file with its uri, type, and name
      formData.append('file', fileToUpload);
      
      // Debug: Try to inspect FormData keys (limited in React Native)
      console.log('FormData created with file key. Cannot directly inspect contents in React Native.');
      
      console.log('Sending classification request for:', asset.fileName || 'unnamed file');
      
      // Use environment variable for API URL with platform-specific fallbacks
      const baseApiUrl = Constants.expoConfig?.extra?.apiUrl ||
        (Platform.OS === 'android'
          ? 'http://10.0.2.2:5000/api'
          : 'http://localhost:5000/api');
      
      // Append endpoint to base URL
      const apiUrl = `${baseApiUrl}/classify`;
      
      console.log('Sending request to API URL:', apiUrl);
      
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Do NOT include Content-Type header here - React Native will add it with proper boundary
      });
      
      if (!response.ok) {
        console.error('Server responded with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Raw server response:', responseText);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse server response as JSON:', e);
        throw new Error('Server returned invalid JSON');
      }
      
      setClassification(data.classification);
      console.log("Classification result:", data.classification);
    } catch (error) {
      console.error('Classification error:', error);
      
      // In development mode, use mock data for testing UI
      if (__DEV__) {
        console.log('DEV MODE: Setting mock classification for testing');
        // Uncomment the next line to test UI with mock data during development
        // setClassification('PF Filing');
      }
      
      Alert.alert(
        'Classification Failed',
        'Could not classify the document. Please check your server connection and try again.'
      );
    } finally {
      setClassificationLoading(false);
    }
  };

  const resetCapture = () => {
    setFileURI(null);
    setFileName(null);
    setIsPDF(false);
    setClassification(null);
  };

  const handleContinue = () => {
    if (classification) {
      // Navigate based on classification
      switch(classification) {
        case 'PF Filing':
          navigation.navigate('EPFFiling', { fileURI, fileName, isPDF });
          break;
        case 'GST Filing':
          navigation.navigate('GSTFiling', { fileURI, fileName, isPDF });
          break;
        case 'ITR Filing':
          navigation.navigate('ITRFiling', { fileURI, fileName, isPDF });
          break;
        default:
          navigation.navigate('DocumentFiling', { fileURI, fileName, isPDF });
      }
    } else {
      // Default navigation if no classification
      navigation.navigate('DocumentFiling', { fileURI, fileName, isPDF });
    }
  };

  // Render main upload screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Scan or Upload</Text>
        
        {/* Scan Document Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={handleCameraCapture}
          activeOpacity={0.7}
          disabled={isUploading || classificationLoading}
        >
          <View style={styles.cardContent}>
            <SimpleIcon name="camera" size={24} color="#4B5563" />
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Scan Document</Text>
              <Text style={styles.cardDescription}>Use your camera to scan a document</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Upload Files Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={handleDocumentPick}
          activeOpacity={0.7}
          disabled={isUploading || classificationLoading}
        >
          <View style={styles.cardContent}>
            <SimpleIcon name="upload" size={24} color="#4B5563" />
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Upload files</Text>
              <Text style={styles.cardDescription}>Select files from your device</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Accessing file picker...</Text>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}

        {/* Classification Loading */}
        {classificationLoading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Classifying document...</Text>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}

        {/* Display Uploaded File */}
        {fileURI && !isUploading && (
          <View style={styles.previewContainer}>
            {isPDF ? (
              <View style={styles.pdfPlaceholder}>
                <SimpleIcon name="pdf" size={48} color="#2563EB" />
                <Text style={styles.pdfText}>PDF Document</Text>
                {fileName && <Text style={styles.fileNameText}>{fileName}</Text>}
              </View>
            ) : (
              <>
                <Image 
                  source={{ uri: fileURI }} 
                  style={styles.imagePreview} 
                  resizeMode="contain" 
                />
                {fileName && <Text style={styles.fileNameText}>{fileName}</Text>}
              </>
            )}
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetCapture}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Classification Results */}
        {classification && !classificationLoading && (
          <View style={styles.classificationContainer}>
            <Text style={styles.classificationTitle}>
              📄 Document Type: <Text style={styles.classificationValue}>{classification}</Text>
            </Text>

            {/* Classification-specific buttons */}
            <View style={styles.classificationButtonsContainer}>
              {classification === 'PF Filing' && (
                <TouchableOpacity
                  style={[styles.classButton, styles.pfButton]}
                  onPress={() => navigation.navigate('EPFFiling', { fileURI, fileName, isPDF })}
                >
                  <Text style={styles.classButtonText}>Proceed to EPF Filing</Text>
                </TouchableOpacity>
              )}

              {classification === 'GST Filing' && (
                <TouchableOpacity
                  style={[styles.classButton, styles.gstButton]}
                  onPress={() => navigation.navigate('GSTFiling', { fileURI, fileName, isPDF })}
                >
                  <Text style={styles.classButtonText}>Proceed to GST Filing</Text>
                </TouchableOpacity>
              )}

              {classification === 'ITR Filing' && (
                <TouchableOpacity
                  style={[styles.classButton, styles.itrButton]}
                  onPress={() => navigation.navigate('ITRFiling', { fileURI, fileName, isPDF })}
                >
                  <Text style={styles.classButtonText}>Proceed to ITR Filing</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Continue Button */}
        {fileURI && !isUploading && !classificationLoading && !classification && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                Continue with Document
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20, // Reduced padding since we removed the bottom nav
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    backgroundColor: 'white',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  pdfPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    marginTop: 8,
    fontSize: 16,
    color: '#4B5563',
  },
  fileNameText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  resetButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 12,
  },
  actionContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  classificationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  classificationTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  classificationValue: {
    fontWeight: 'bold',
  },
  classificationButtonsContainer: {
    width: '100%',
    marginTop: 12,
  },
  classButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  pfButton: {
    backgroundColor: '#3B82F6', // blue
  },
  gstButton: {
    backgroundColor: '#10B981', // green
  },
  itrButton: {
    backgroundColor: '#8B5CF6', // purple
  },
  classButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ScanUploadPage;