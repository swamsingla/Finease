import React, { useState, useRef } from 'react';
import { ScrollView, View, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';

import EWayBillForm from './EWayBillForm';
import EWayBillTemplate from './EWayBillTemplate';

import { useAuth } from '../../context/AuthContext';
import Constants from 'expo-constants';

const EWaybillCreateScreen = ({ navigation }) => {
  const { user, updateUser, token } = useAuth();
  const [formData, setFormData] = useState({
    generatedBy: "-",
    validFrom: "",
    validUntil: "",
    supplierGstin: "-",
    recipientGstin: "-",
    placeOfDelivery: "-",
    placeOfDispatch: "-",
    valueOfGoods: "0",
    transportReason: "Supply",
    transporter: "-",
    vehicles: [{
      mode: "Road",
      vehicleNo: "-",
      from: "-",
      enteredDate: new Date().toISOString(),
      enteredBy: "-"
    }]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [ewayBillData, setEwayBillData] = useState(null);
  const printRef = useRef(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);

      // Generate eway bill numbers
      const ewayBillNo = "EWB-" + Math.floor(Math.random() * 1000000);
      const documentNo = "DOC-" + Math.floor(Math.random() * 1000000);
      const today = new Date().toLocaleDateString("en-GB");
      
      // Prepare data for preview
      const data = {
        ...formData,
        ewayBillNo,
        documentNo,
        ewayBillDate: today
      };
      
      setEwayBillData(data);
      setShowPreview(true);
      
    } catch (error) {
      console.error('Error generating E-Way Bill:', error);
      Alert.alert('Error', 'Failed to generate E-Way Bill');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateHTML = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>E-Way Bill ${data.ewayBillNo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;ewayBillData
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .section {
            margin: 20px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 15px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>E-Way Bill</h1>
          </div>
          
          <div class="info-section">
            <div>
              <p><strong>E-way Bill No:</strong> ${data.ewayBillNo}</p>
              <p><strong>Document No:</strong> ${data.documentNo}</p>
              <p><strong>Date:</strong> ${data.ewayBillDate}</p>
            </div>
            <div>
              <p><strong>Valid From:</strong> ${formatDate(data.validFrom)}</p>
              <p><strong>Valid Until:</strong> ${formatDate(data.validUntil)}</p>
              <p><strong>Generated By:</strong> ${data.generatedBy}</p>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Part A - Basic Details</h2>
            <div class="grid">
              <p><strong>GSTIN of Supplier:</strong> ${data.supplierGstin}</p>
              <p><strong>GSTIN of Recipient:</strong> ${data.recipientGstin}</p>
              <p><strong>Place of Delivery:</strong> ${data.placeOfDelivery}</p>
              <p><strong>Place of Dispatch:</strong> ${data.placeOfDispatch}</p>
              <p><strong>Value of Goods:</strong> ₹${data.valueOfGoods}</p>
              <p><strong>Reason:</strong> ${data.transportReason}</p>
              <p><strong>Transporter:</strong> ${data.transporter}</p>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Part B - Vehicle Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Vehicle No</th>
                  <th>From</th>
                  <th>Entered Date</th>
                  <th>Entered By</th>
                </tr>
              </thead>
              <tbody>
                ${data.vehicles.map(vehicle => `
                  <tr>
                    <td>${vehicle.mode}</td>
                    <td>${vehicle.vehicleNo}</td>
                    <td>${vehicle.from}</td>
                    <td>${formatDate(vehicle.enteredDate)}</td>
                    <td>${vehicle.enteredBy}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Note: This is an electronically generated document.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Format dates for HTML
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString || "-";
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      
      // Save to backend first
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/invoice/eway/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ewayBillData),
      });
      console.log('Response from backend:', response);

      const htmlContent = generateHTML(ewayBillData);
      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // Define a better filename with the e-way bill number
      const pdfName = `Eway_${ewayBillData.ewayBillNo}.pdf`;
      const newUri = FileSystem.documentDirectory + pdfName;
      
      // Copy the file to the new location with better name
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(newUri);
      } else {
        Alert.alert(
          'Sharing not available',
          `PDF saved to ${newUri}`
        );
      }

    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export E-Way Bill as PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <ViewShot ref={printRef} options={{ format: "jpg", quality: 0.9 }}>
            <EWayBillTemplate data={ewayBillData} />
          </ViewShot>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button title="Back to Edit" onPress={handleBackToEdit} disabled={isLoading} />
          <Button title={isLoading ? 'Processing...' : 'Export PDF'} onPress={handleExportPDF} disabled={isLoading} />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <EWayBillForm
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  }
});

export default EWaybillCreateScreen;