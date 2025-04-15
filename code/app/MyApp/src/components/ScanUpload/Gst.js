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

const GSTFiling = ({ route, navigation }) => {
  // Extract parameters from navigation
  const { fileURI, fileName, isPDF } = route.params || {};

  const [formData, setFormData] = useState({
    email: "",
    gstin: "",
    ctin: "",
    invoiceDate: "",
    placeOfSupply: "",
    address: "",
    cgst: "",
    sgst: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractionStatus, setExtractionStatus] = useState("");

  // Handle incoming file from ScanUploadScreen
  useEffect(() => {
    if (fileURI) {
      setExtractionStatus("Starting data extraction...");
      extractDataFromInvoice(fileURI);
    }
  }, [fileURI]);

  // Function to extract data from invoice using Nanonets API
  const extractDataFromInvoice = async (fileUri) => {
    setExtractionStatus("Extracting data from invoice...");
    setLoading(true);
  
    try {
      let formData = new FormData();
      let fileObject;

      // Handle different platforms
      if (Platform.OS === 'web') {
        // For web, handle data URIs
        if (fileUri.startsWith('data:')) {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          fileObject = new File(
            [blob],
            fileName || 'document.jpg',
            { type: 'image/jpeg' }
          );
        } else {
          // Regular URL case for web
          const response = await fetch(fileUri);
          const blob = await response.blob();
          fileObject = new File(
            [blob],
            fileName || 'document.jpg',
            { type: blob.type }
          );
        }
      } else {
        // For native platforms (iOS/Android)
        fileObject = {
          uri: fileUri,
          type: isPDF ? 'application/pdf' : 'image/jpeg',
          name: fileName || `document.${isPDF ? 'pdf' : 'jpg'}`
        };
      }
      
      formData.append('file', fileObject);
  
      // Call Nanonets API with platform-specific configuration
      const apiKey = "5aa26d66-fb76-11ef-a113-263262c841b0";
      const modelId = "ed880aeb-7171-4658-b4d0-cb8011604541";
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

      // Process the extracted data
      if (result.data && result.data.result) {
        const extractedData = processNanonetsResponse(result.data);
        setFormData(prevData => ({
          ...prevData,
          ...extractedData
        }));
        setExtractionStatus("✅ Data extracted successfully!");
      } else {
        throw new Error("Could not extract data from the invoice");
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      setError(`Error extracting data: ${error.message}`);
      setExtractionStatus("❌ Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  // Process Nanonets API response to extract relevant GST information
  const processNanonetsResponse = (data) => {
    try {
      // The structure depends on your Nanonets model configuration
      // This is a general example - adjust according to your specific model
      const predictions = data.result[0].prediction;

      // Extract fields from predictions
      const extractedData = {
        email: predictions.find(p => p.label === "email")?.ocr_text || "",
        gstin: predictions.find(p => p.label === "gstin")?.ocr_text || "",
        ctin: predictions.find(p => p.label === "ctin")?.ocr_text || "", // Added CTIN extraction
        invoiceDate: formatDateString(predictions.find(p => p.label === "invoice_date")?.ocr_text || ""),
        placeOfSupply: predictions.find(p => p.label === "place_of_supply")?.ocr_text || "",
        address: predictions.find(p => p.label === "address")?.ocr_text || "",
        cgst: predictions.find(p => p.label === "cgst_amount")?.ocr_text || "",
        sgst: predictions.find(p => p.label === "sgst_amount")?.ocr_text || "",
        totalAmount: predictions.find(p => p.label === "total_amount")?.ocr_text || ""
      };

      // Clean numeric values
      extractedData.cgst = cleanNumericValue(extractedData.cgst);
      extractedData.sgst = cleanNumericValue(extractedData.sgst);
      extractedData.totalAmount = cleanNumericValue(extractedData.totalAmount);
      
      // Clean email value if needed
      extractedData.email = cleanEmailValue(extractedData.email);

      return extractedData;
    } catch (error) {
      console.error("Error processing extracted data:", error);
      return {};
    }
  };

  // Helper function to format date string to YYYY-MM-DD
  const formatDateString = (dateStr) => {
    if (!dateStr) return "";

    try {
      // Try to parse various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }

      // If standard parsing fails, try to handle common Indian date formats (DD/MM/YYYY)
      const parts = dateStr.split(/[/.-]/);
      if (parts.length === 3) {
        // Assuming DD/MM/YYYY or similar format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
        const year = parseInt(parts[2], 10);

        // Add 2000 if the year is a 2-digit number
        const fullYear = year < 100 ? year + 2000 : year;

        const parsedDate = new Date(fullYear, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }

    return dateStr; // Return original if parsing fails
  };

  // Helper function to clean numeric values
  const cleanNumericValue = (value) => {
    if (!value) return "";

    // Remove currency symbols, commas, and other non-numeric characters
    return value.replace(/[^\d.-]/g, '');
  };

  // Helper function to clean email values
  const cleanEmailValue = (value) => {
    console.log("Raw email value:", value);
    if (!value) return "";
    
    // Remove spaces and common OCR errors in emails
    let cleanedValue = value.trim().replace(/\s+/g, "");
    
    // Replace common OCR errors
    cleanedValue = cleanedValue
      .replace(/[oO]0/g, "o") // Replace o0 with o
      .replace(/1l|l1/g, "l")  // Replace 1l or l1 with l
      .replace(/\[]/g, "i")    // Replace [] with i
      
    console.log("Cleaned email value:", cleanedValue);
    
    // More relaxed email validation - just check for @ symbol
    if (cleanedValue.includes("@")) {
      return cleanedValue;
    }
    
    return value; // Return original if no @ found
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
  
    // Validate all required fields
    const requiredFields = {
      email: "Email",
      gstin: "GSTIN",
      ctin: "CTIN",
      invoiceDate: "Invoice Date",
      placeOfSupply: "Place of Supply",
      address: "Address",
      cgst: "CGST",
      sgst: "SGST",
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
      // Format the date to YYYY-MM-DD format
      let formattedDate = formData.invoiceDate;
      
      // Special handling for format like "16 - JUL - 2024"
      if (formData.invoiceDate && formData.invoiceDate.includes('-')) {
        const dateParts = formData.invoiceDate.split('-').map(part => part.trim());
        
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = dateParts[1].trim().toUpperCase();
          const year = parseInt(dateParts[2], 10);
          
          // Map month names to numbers
          const monthMap = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
          };
          
          if (!isNaN(day) && monthMap[month] !== undefined && !isNaN(year)) {
            const dateObj = new Date(year, monthMap[month], day);
            formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        }
      } else {
        // Try standard date parsing as backup
        try {
          const dateObj = new Date(formData.invoiceDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (dateError) {
          console.error("Date formatting error:", dateError);
        }
      }
  
      // Use platform-specific API endpoint
      const apiUrl = Platform.OS === 'web' 
        ? 'http://localhost:5000/api/gst'
        : Platform.OS === 'android'
          ? 'http://10.0.2.2:5000/api/gst'
          : 'http://localhost:5000/api/gst';
  
      // Format data to match web version with correctly formatted date
      const postData = {
        ...formData,
        invoiceDate: formattedDate, // Use the formatted date
        // Convert numeric strings to numbers
        cgst: parseFloat(formData.cgst) || 0,
        sgst: parseFloat(formData.sgst) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
      };
  
      console.log("Sending data:", postData);
  
      const response = await axios.post(apiUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log("API Response:", response);
  
      if (Platform.OS === 'web') {
        alert("GST data submitted successfully!");
      } else {
        Alert.alert("Success", "GST data submitted successfully!");
      }

      // Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      // [Error handling remains the same]
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>GST Filing</Text>

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

        {/* Form to collect GST data */}
        <View style={styles.formContainer}>
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
            <Text style={styles.label}>GSTIN</Text>
            <TextInput
              style={styles.input}
              value={formData.gstin}
              onChangeText={(text) => handleChange("gstin", text)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CTIN</Text>
            <TextInput
              style={styles.input}
              value={formData.ctin}
              onChangeText={(text) => handleChange("ctin", text)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invoice Date</Text>
            <TextInput
              style={styles.input}
              value={formData.invoiceDate}
              onChangeText={(text) => handleChange("invoiceDate", text)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place of Supply</Text>
            <TextInput
              style={styles.input}
              value={formData.placeOfSupply}
              onChangeText={(text) => handleChange("placeOfSupply", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => handleChange("address", text)}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CGST</Text>
            <TextInput
              style={styles.input}
              value={formData.cgst}
              onChangeText={(text) => handleChange("cgst", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SGST</Text>
            <TextInput
              style={styles.input}
              value={formData.sgst}
              onChangeText={(text) => handleChange("sgst", text)}
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
    height: '100vh', // Add viewport height for web
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
    fontSize: 18, // Reduced from 22
    fontWeight: '600',
    marginBottom: 8, // Reduced from 16
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12, // Reduced from 16
    marginBottom: 10, // Reduced from 20
  },
  inputGroup: {
    marginBottom: 8, // Reduced from 16
  },
  label: {
    marginBottom: 4, // Reduced from 6
    fontSize: 12, // Reduced from 14
    color: '#4B5563',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8, // Reduced from 12
    fontSize: 14, // Reduced from 16
    minHeight: 36, // Added to maintain consistent height
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

export default GSTFiling;