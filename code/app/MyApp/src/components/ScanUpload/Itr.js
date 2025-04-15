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

const ITRFiling = ({ route, navigation }) => {
  const { fileURI, fileName, isPDF } = route.params || {};

  const [formData, setFormData] = useState({
    email: "",
    panNo: "",
    tan: "",
    addressEmployee: "",
    addressEmployer: "",
    period: {
      from: "",
      to: "",
    },
    grossTotalIncome: "",
    grossTaxableIncome: "",
    netTaxPayable: "",
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
    setExtractionStatus("Extracting data from ITR document...");
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
      const modelId = "13bad529-fff3-4bb9-898b-8fe0f57cbfe1"; // ITR-specific model ID
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
        throw new Error("Could not extract data from the ITR document");
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
        panNo: predictions.find(p => p.label === "pan_no")?.ocr_text || "",
        tan: predictions.find(p => p.label === "tan")?.ocr_text || "",
        addressEmployee: predictions.find(p => p.label === "address_employee")?.ocr_text || "",
        addressEmployer: predictions.find(p => p.label === "address_employer")?.ocr_text || "",
        grossTotalIncome: predictions.find(p => p.label === "gross_total_income")?.ocr_text || "",
        grossTaxableIncome: predictions.find(p => p.label === "gross_taxable_income")?.ocr_text || "",
        netTaxPayable: predictions.find(p => p.label === "net_tax_payable")?.ocr_text || ""
      };

      // Handle period dates
      const periodFrom = predictions.find(p => p.label === "period_from")?.ocr_text || "";
      const periodTo = predictions.find(p => p.label === "period_to")?.ocr_text || "";

      extractedData.period = {
        from: formatDateString(periodFrom),
        to: formatDateString(periodTo)
      };

      // Clean numeric values
      extractedData.grossTotalIncome = cleanNumericValue(extractedData.grossTotalIncome);
      extractedData.grossTaxableIncome = cleanNumericValue(extractedData.grossTaxableIncome);
      extractedData.netTaxPayable = cleanNumericValue(extractedData.netTaxPayable);
      
      // Clean email and identification numbers
      extractedData.email = cleanEmailValue(extractedData.email);
      extractedData.panNo = cleanPanValue(extractedData.panNo);
      extractedData.tan = cleanTanValue(extractedData.tan);

      return extractedData;
    } catch (error) {
      console.error("Error processing extracted data:", error);
      return {};
    }
  };

  // Helper functions for cleaning and formatting data
  const formatDateString = (dateStr) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      const parts = dateStr.split(/[/.-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const fullYear = year < 100 ? year + 2000 : year;
        const parsedDate = new Date(fullYear, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    return dateStr;
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

  const cleanPanValue = (value) => {
    if (!value) return "";
    let cleanedValue = value.trim().replace(/\s+/g, "").toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(cleanedValue) ? cleanedValue : value;
  };

  const cleanTanValue = (value) => {
    if (!value) return "";
    let cleanedValue = value.trim().replace(/\s+/g, "").toUpperCase();
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
    return tanRegex.test(cleanedValue) ? cleanedValue : value;
  };

  const handleChange = (name, value) => {
    if (name === "periodFrom") {
      setFormData(prev => ({
        ...prev,
        period: { ...prev.period, from: value }
      }));
    } else if (name === "periodTo") {
      setFormData(prev => ({
        ...prev,
        period: { ...prev.period, to: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validate all required fields
    const requiredFields = {
      email: "Email",
      panNo: "PAN Number",
      tan: "TAN",
      addressEmployee: "Employee Address",
      addressEmployer: "Employer Address",
      "period.from": "Period From",
      "period.to": "Period To",
      grossTotalIncome: "Gross Total Income",
      grossTaxableIncome: "Gross Taxable Income",
      netTaxPayable: "Net Tax Payable"
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!formData[parent][child]) {
          missingFields.push(label);
        }
      } else if (!formData[field]) {
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
      // Format the dates to YYYY-MM-DD format
      let formattedFromDate = formData.period.from;
      let formattedToDate = formData.period.to;
      
      // Special handling for format like "16 - JUL - 2024"
      const formatDate = (dateStr) => {
        if (dateStr && dateStr.includes('-')) {
          const dateParts = dateStr.split('-').map(part => part.trim());
          
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
              return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            }
          }
        } else {
          // Try standard date parsing as backup
          try {
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            }
          } catch (dateError) {
            console.error("Date formatting error:", dateError);
          }
        }
        return dateStr;
      };

      formattedFromDate = formatDate(formData.period.from);
      formattedToDate = formatDate(formData.period.to);

      const apiUrl = Platform.OS === 'web' 
        ? 'http://localhost:5000/api/itr'
        : Platform.OS === 'android'
          ? 'http://10.0.2.2:5000/api/itr'
          : 'http://localhost:5000/api/itr';

      const postData = {
        ...formData,
        period: {
          from: formattedFromDate,
          to: formattedToDate
        },
        grossTotalIncome: parseFloat(formData.grossTotalIncome) || 0,
        grossTaxableIncome: parseFloat(formData.grossTaxableIncome) || 0,
        netTaxPayable: parseFloat(formData.netTaxPayable) || 0,
      };

      await axios.post(apiUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (Platform.OS === 'web') {
        alert("ITR data submitted successfully!");
      } else {
        Alert.alert("Success", "ITR data submitted successfully!");
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
        <Text style={styles.title}>ITR Filing</Text>

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
          {/* Email Input */}
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

          {/* PAN Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Number</Text>
            <TextInput
              style={styles.input}
              value={formData.panNo}
              onChangeText={(text) => handleChange("panNo", text)}
              autoCapitalize="characters"
            />
          </View>

          {/* TAN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TAN</Text>
            <TextInput
              style={styles.input}
              value={formData.tan}
              onChangeText={(text) => handleChange("tan", text)}
              autoCapitalize="characters"
            />
          </View>

          {/* Period From Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Period From</Text>
            <TextInput
              style={styles.input}
              value={formData.period.from}
              onChangeText={(text) => handleChange("periodFrom", text)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Period To Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Period To</Text>
            <TextInput
              style={styles.input}
              value={formData.period.to}
              onChangeText={(text) => handleChange("periodTo", text)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Employee Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employee Address</Text>
            <TextInput
              style={styles.input}
              value={formData.addressEmployee}
              onChangeText={(text) => handleChange("addressEmployee", text)}
              multiline
            />
          </View>

          {/* Employer Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employer Address</Text>
            <TextInput
              style={styles.input}
              value={formData.addressEmployer}
              onChangeText={(text) => handleChange("addressEmployer", text)}
              multiline
            />
          </View>

          {/* Income Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gross Total Income</Text>
            <TextInput
              style={styles.input}
              value={formData.grossTotalIncome}
              onChangeText={(text) => handleChange("grossTotalIncome", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gross Taxable Income</Text>
            <TextInput
              style={styles.input}
              value={formData.grossTaxableIncome}
              onChangeText={(text) => handleChange("grossTaxableIncome", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Net Tax Payable</Text>
            <TextInput
              style={styles.input}
              value={formData.netTaxPayable}
              onChangeText={(text) => handleChange("netTaxPayable", text)}
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
  // Copy styles from GST.js
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
  // ...rest of styles from GST.js...
});

export default ITRFiling;
