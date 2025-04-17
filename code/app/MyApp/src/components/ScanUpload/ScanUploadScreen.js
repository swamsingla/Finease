import React, { useState, useRef } from 'react';
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
import { WebView } from 'react-native-webview';
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
  const [webFile, setWebFile] = useState(null); // Store the File object for web
  const [showWebCamera, setShowWebCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Create refs for the hidden file inputs (web only)
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // Function to handle document picking from device storage
  const handleDocumentPick = async () => {
    setIsUploading(true);
    
    try {
      if (Platform.OS === 'web') {
        // For web: Use a hidden file input element
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        setIsUploading(false);
      } else {
        // For Android/iOS with Expo Go - keep existing code as it works perfectly
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to upload documents');
          setIsUploading(false);
          return;
        }
        
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
          const mimeType = asset.mimeType || 'application/octet-stream';
          const isPdf = mimeType === 'application/pdf';
          
          const assetForClassify = {
            uri: uri,
            type: mimeType,
            fileName: asset.name || `document.${isPdf ? 'pdf' : 'jpg'}`
          };
          
          console.log('Selected file:', { uri, type: assetForClassify.type, name: assetForClassify.fileName });
          
          setFileURI(uri);
          setFileName(assetForClassify.fileName);
          setIsPDF(isPdf);
          
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
  
  // Handle file selection for web platform
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileType = file.type;
    const isPdf = fileType.includes('pdf');
    
    // Create URL for preview
    const fileUrl = URL.createObjectURL(file);
    
    setFileURI(fileUrl);
    setFileName(file.name);
    setIsPDF(isPdf);
    setWebFile(file); // Store the actual File object for web
    
    // Create an object compatible with our classify function
    const assetForClassify = {
      uri: fileUrl,
      type: fileType,
      fileName: file.name,
      webFile: file // Keep the original File object for web uploads
    };
    
    classifyDocument(assetForClassify);
  };
  
  // Function to handle camera capture
  const handleCameraCapture = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web: Use direct MediaStream API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
              audio: false
            });
            
            // Show camera UI
            setShowWebCamera(true);
            setCameraStream(stream);
            
            // Connect stream to video element when component mounts
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            }, 100);
          } catch (error) {
            console.error('Error accessing camera:', error);
            Alert.alert(
              'Camera Access Error',
              'Could not access your camera. Please check permissions and try again.',
              [{ text: 'OK' }]
            );
          }
        } else if (cameraInputRef.current) {
          // Fall back to input method if MediaStream API is not available
          cameraInputRef.current.setAttribute('capture', 'environment');
          cameraInputRef.current.click();
        } else {
          Alert.alert(
            'Camera Not Supported',
            'Your browser does not support camera access. Please try using Chrome or Safari.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // For Android/iOS - existing code - leave as is
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

  // Handle web camera input change
  const handleCameraInputChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setFileURI(fileUrl);
    setFileName('Camera_' + new Date().toISOString().split('T')[0] + '.jpg');
    setIsPDF(false);
    setWebFile(file);
    
    // Create asset for classification
    const assetForClassify = {
      uri: fileUrl,
      type: file.type,
      fileName: 'Camera_' + new Date().toISOString().split('T')[0] + '.jpg',
      webFile: file
    };
    
    classifyDocument(assetForClassify);
  };

  // Function to take photo from web camera
  const captureWebPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob/file
    canvas.toBlob(async (blob) => {
      if (!blob) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }
      
      // Create file from blob
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      const fileUrl = URL.createObjectURL(blob);
      
      // Close camera
      closeWebCamera();
      
      // Set captured image
      setFileURI(fileUrl);
      setFileName('Camera_' + new Date().toISOString().split('T')[0] + '.jpg');
      setIsPDF(false);
      setWebFile(file);
      
      // Create asset-like object for classification
      const assetForClassify = {
        uri: fileUrl,
        type: 'image/jpeg',
        fileName: 'Camera_' + new Date().toISOString().split('T')[0] + '.jpg',
        webFile: file
      };
      
      // Classify document
      classifyDocument(assetForClassify);
    }, 'image/jpeg', 0.8);
  };

  // Close web camera function
  const closeWebCamera = () => {
    if (cameraStream) {
      // Stop all tracks in the stream
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowWebCamera(false);
  };

  // Function to classify document
  const classifyDocument = async (asset) => {
    setClassificationLoading(true);
    setClassification(null);
    
    try {
      const formData = new FormData();
      
      console.log('Asset details for debugging:', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName,
      });
      
      let fileToUpload;
      
      if (Platform.OS === 'web' && asset.webFile) {
        // For web: Use the File object directly
        fileToUpload = asset.webFile;
        console.log('Using web File object for upload:', fileToUpload.name, fileToUpload.type, fileToUpload.size);
      } else {
        // For mobile
        fileToUpload = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'document.' + (asset.type ? asset.type.split('/')[1] : 'jpg'),
        };
      }
      
      // Append the file to FormData
      formData.append('file', fileToUpload);
      
      console.log('Sending classification request for:', asset.fileName || 'unnamed file');
      
      // Use environment variable for API URL with platform-specific fallbacks
      const baseApiUrl = Constants.expoConfig?.extra?.apiUrl ||
        (Platform.OS === 'android'
          ? 'http://10.0.2.2:5000/api'
          : 'http://localhost:5000/api');
      
      const apiUrl = `${baseApiUrl}/classify`;
      
      console.log('Sending request to API URL:', apiUrl);
      
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
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
        // Uncomment for testing
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
    setWebFile(null);
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

  // Render PDF viewer for web
  const renderPDFPreview = () => {
    if (Platform.OS === 'web' && isPDF && fileURI) {
      return (
        <iframe 
          src={fileURI} 
          style={{
            width: '100%',
            height: 500,
            border: 'none',
            borderRadius: 8,
          }}
          title="PDF Preview"
        />
      );
    } else if (isPDF) {
      // Fallback for mobile or when PDF can't be embedded
      return (
        <View style={styles.pdfPlaceholder}>
          <SimpleIcon name="pdf" size={48} color="#2563EB" />
          <Text style={styles.pdfText}>PDF Document</Text>
          {fileName && <Text style={styles.fileNameText}>{fileName}</Text>}
        </View>
      );
    } else {
      // Image preview
      return (
        <>
          <Image 
            source={{ uri: fileURI }} 
            style={styles.imagePreview} 
            resizeMode="contain" 
          />
          {fileName && <Text style={styles.fileNameText}>{fileName}</Text>}
        </>
      );
    }
  };

  // Render main upload screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden file inputs for web platform */}
      {Platform.OS === 'web' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            capture="environment"
            onChange={handleCameraInputChange}
          />
        </>
      )}
      
      {/* Web Camera UI */}
      {Platform.OS === 'web' && showWebCamera && (
        <View style={styles.webCameraContainer}>
          <View style={styles.webCameraContent}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.videoPreview}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <View style={styles.webCameraControls}>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={captureWebPhoto}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeWebCamera}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Only show scroll content when web camera is not active */}
      {!showWebCamera && (
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
              {renderPDFPreview()}
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
      )}
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
    paddingBottom: 20,
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
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }
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
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }
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
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }
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
  webCameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webCameraContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  webCameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScanUploadPage;