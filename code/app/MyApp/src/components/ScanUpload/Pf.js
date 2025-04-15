import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { Base64 } from 'js-base64';
import * as FileSystem from 'expo-file-system';

const EPFFiling = ({ route, navigation }) => {
  const { fileURI, fileName, isPDF } = route.params || {};

  const [formData, setFormData] = useState({
    email: "",
    trrnNo: "",
    establishmentId: "",
    establishmentName: "",
    wageMonth: "",
    member: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractionStatus, setExtractionStatus] = useState("");

  useEffect(() => {
    if (fileURI) {
      setExtractionStatus("Starting data extraction...");
      extractDataFromDocument(fileURI);
    }
  }, [fileURI]);

  const extractDataFromDocument = async (fileUri) => {
    setExtractionStatus("Extracting data from PF document...");
    setLoading(true);
  
    try {
      let formData = new FormData();
      let fileObject;

      if (Platform.OS === 'web') {
        if (fileUri.startsWith('data:')) {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          fileObject = new File([blob], fileName || 'document.jpg', { type: 'image/jpeg' });
        } else {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          fileObject = new File([blob], fileName || 'document.jpg', { type: blob.type });
        }
      } else {
        fileObject = {
          uri: fileUri,
          type: isPDF ? 'application/pdf' : 'image/jpeg',
          name: fileName || `document.${isPDF ? 'pdf' : 'jpg'}`
        };
      }
      
      formData.append('file', fileObject);
  
      const apiKey = "5aa26d66-fb76-11ef-a113-263262c841b0";
      const modelId = "3329200a-1e45-4c4b-93ea-a8efa65dc32e";
      const base64Credentials = Base64.encode(`${apiKey}:`);
      
      const result = await axios.post(
        `https://app.nanonets.com/api/v2/OCR/Model/${modelId}/LabelFile/`,
        formData,
        {
          headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (result.data && result.data.result) {
        const extractedData = processNanonetsResponse(result.data);
        setFormData(prevData => ({
          ...prevData,
          ...extractedData
        }));
        setExtractionStatus("✅ Data extracted successfully!");
      } else {
        throw new Error("Could not extract data from the PF document");
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      setError(`Error extracting data: ${error.message}`);
      setExtractionStatus("❌ Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const processNanonetsResponse = (data) => {
    try {
      const predictions = data.result[0].prediction;

      const extractedData = {
        email: predictions.find(p => p.label === "email")?.ocr_text || "",
        trrnNo: predictions.find(p => p.label === "trrn_no")?.ocr_text || "",
        establishmentId: predictions.find(p => p.label === "establishment_id")?.ocr_text || "",
        establishmentName: predictions.find(p => p.label === "establishment_name")?.ocr_text || "",
        wageMonth: formatWageMonth(predictions.find(p => p.label === "wage_month")?.ocr_text || ""),
        member: predictions.find(p => p.label === "member")?.ocr_text || "",
        totalAmount: predictions.find(p => p.label === "total_amount")?.ocr_text || ""
      };

      // Clean numeric values
      extractedData.member = cleanNumericValue(extractedData.member);
      extractedData.totalAmount = cleanNumericValue(extractedData.totalAmount);
      extractedData.email = cleanEmailValue(extractedData.email);

      return extractedData;
    } catch (error) {
      console.error("Error processing extracted data:", error);
      return {};
    }
  };

  const formatWageMonth = (monthStr) => {
    if (!monthStr) return "";

    try {
      monthStr = monthStr.trim();
      
      if (/^[A-Za-z]+ [0-9]{4}$/.test(monthStr) || /^[A-Za-z]+-[0-9]{4}$/.test(monthStr)) {
        return monthStr;
      }
      
      const dateParts = monthStr.split(/[/.-]/);
      if (dateParts.length === 3) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        let month = parseInt(dateParts[1], 10) - 1;
        let year = parseInt(dateParts[2], 10);
        
        if (month >= 0 && month < 12 && year > 2000) {
          return `${monthNames[month]} ${year}`;
        }
      }
    } catch (error) {
      console.error("Error formatting wage month:", error);
    }
    return monthStr;
  };

  const cleanNumericValue = (value) => {
    if (!value) return "";
    return value.replace(/[^\d.-]/g, '');
  };

  const cleanEmailValue = (value) => {
    if (!value) return "";
    let cleanedValue = value.trim().replace(/\s+/g, "");
    cleanedValue = cleanedValue
      .replace(/[oO]0/g, "o")
      .replace(/1l|l1/g, "l")
      .replace(/\[]/g, "i");
    return cleanedValue.includes("@") ? cleanedValue : value;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validate all required fields
    const requiredFields = {
      email: "Email",
      trrnNo: "TRRN Number",
      establishmentId: "Establishment ID",
      establishmentName: "Establishment Name",
      wageMonth: "Wage Month",
      member: "Members",
      totalAmount: "Total Amount"
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      if (Platform.OS === 'web') {
        alert(`Please fill in all required fields`);
      } else {
        Alert.alert("Validation Error", `Please fill in all required fields`);
      }
      return;
    }

    try {
      const apiUrl = Platform.OS === 'web' 
        ? 'http://localhost:5000/api/epf'
        : Platform.OS === 'android'
          ? 'http://10.0.2.2:5000/api/epf'
          : 'http://localhost:5000/api/epf';

      const postData = {
        ...formData,
        member: parseInt(formData.member) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
      };

      await axios.post(apiUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (Platform.OS === 'web') {
        alert("PF data submitted successfully!");
      } else {
        Alert.alert("Success", "PF data submitted successfully!");
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>EPF Filing</Text>

        {extractionStatus ? (
          <View style={[
            styles.statusContainer,
            extractionStatus.includes("failed") || extractionStatus.includes("❌") 
              ? styles.errorStatus 
              : extractionStatus.includes("Starting") 
              ? styles.loadingStatus 
              : styles.successStatus
          ]}>
            <Text style={styles.statusText}>{extractionStatus}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          {/* Form fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TRRN Number</Text>
            <TextInput
              style={styles.input}
              value={formData.trrnNo}
              onChangeText={(text) => handleChange("trrnNo", text)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Establishment ID</Text>
            <TextInput
              style={styles.input}
              value={formData.establishmentId}
              onChangeText={(text) => handleChange("establishmentId", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Establishment Name</Text>
            <TextInput
              style={styles.input}
              value={formData.establishmentName}
              onChangeText={(text) => handleChange("establishmentName", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wage Month</Text>
            <TextInput
              style={styles.input}
              value={formData.wageMonth}
              onChangeText={(text) => handleChange("wageMonth", text)}
              placeholder="e.g., January 2024"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Members</Text>
            <TextInput
              style={styles.input}
              value={formData.member}
              onChangeText={(text) => handleChange("member", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Amount</Text>
            <TextInput
              style={styles.input}
              value={formData.totalAmount}
              onChangeText={(text) => handleChange("totalAmount", text)}
              keyboardType="numeric"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.overlayLoader}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100vh',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    height: '100%',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    minHeight: 36,
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  loadingStatus: {
    backgroundColor: '#E1EFFE',
  },
  successStatus: {
    backgroundColor: '#D1FAE5',
  },
  errorStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
  },
  overlayLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default EPFFiling;
