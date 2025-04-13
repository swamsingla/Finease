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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

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
  
  // Function to handle document picking from device storage
  const handleDocumentPick = async () => {
    setIsUploading(true);
    
    try {
      const options = {
        mediaType: Platform.OS === 'web' ? 'photo' : 'mixed', // Fix for web platform
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        selectionLimit: 1,
        type: 'library', // Explicitly set to library to ensure device files are accessible
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
        } else {
          Alert.alert('Error', 'No file was selected');
        }
      });
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document: ' + err.message);
      setIsUploading(false);
    }
  };
  
  // Function to handle camera capture
  const handleCameraCapture = async () => {
    try {
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
        } else {
          Alert.alert('Error', 'No image was captured');
        }
      });
    } catch (err) {
      console.error('Error capturing image:', err);
      Alert.alert('Error', 'Failed to capture image: ' + err.message);
    }
  };

  const resetCapture = () => {
    setFileURI(null);
    setFileName(null);
    setIsPDF(false);
  };

  const handleContinue = () => {
    // Navigate to a document processing screen with the file details
    navigation.navigate('DocumentFiling', { 
      fileURI,
      fileName,
      isPDF
    });
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
          disabled={isUploading}
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
          disabled={isUploading}
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

        {/* Continue Button */}
        {fileURI && !isUploading && (
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
});

export default ScanUploadPage;