// InvoiceScreen.js
import React, { useState, useRef } from 'react';
import { ScrollView, View, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';

import InvoiceForm from './InvoiceForm';
import InvoiceTemplate from './InvoiceTemplate';

const InvoiceScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    // Initial form data
    soldBy: '',
    soldByAddress: {
      buildingNumber: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      countryCode: '',
    },
    billingName: '',
    billingAddress: {
      buildingNumber: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      countryCode: '',
    },
    shippingName: '',
    shippingAddress: {
      buildingNumber: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      countryCode: '',
    },
    sameAsBilling: false,
    panNumber: '',
    gstNumber: '',
    stateUtCode: '',
    orderDate: new Date().toISOString().split('T')[0],
    orderNumber: '',
    items: [
      {
        name: '',
        unitPrice: '0',
        discount: '0',
        qty: '1',
        taxType: '18',
        netAmount: '0'
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const invoiceRef = useRef(null);

  const generateInvoiceNumber = () => {
    return `INV-${Math.floor(Math.random() * 100000)}`;
  };

  const handleGenerate = async () => {
    console.log('Generating invoice with data:', formData);
    // Basic validation
    // if (!formData.soldBy || !formData.billingName) {
    //   Alert.alert('Validation Error', 'Please fill in all required fields');
    //   return;
    // }

    try {
      setIsLoading(true);

      // Prepare invoice data with additional calculations
      const invoiceData = {
        ...formData,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toLocaleDateString('en-GB'),
        items: formData.items.map(item => ({
          ...item,
          totalTax: ((parseFloat(item.netAmount) || 0) * (parseFloat(item.taxType) / 100)).toFixed(2)
        }))
      };

      // Calculate totals
      const subtotal = invoiceData.items.reduce((total, item) => {
        return total + parseFloat(item.netAmount || 0);
      }, 0);

      const totalTax = invoiceData.items.reduce((total, item) => {
        return total + parseFloat(item.totalTax || 0);
      }, 0);

      const grandTotal = subtotal + totalTax;

      invoiceData.subtotal = subtotal.toFixed(2);
      invoiceData.totalTax = totalTax.toFixed(2);
      invoiceData.grandTotal = grandTotal.toFixed(2);

      // Show preview first
      setFormData(invoiceData);
      console.log('Invoice data for preview:', invoiceData);
      setShowPreview(true);

    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const generateHTML = (invoiceData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .company-details, .invoice-details {
            flex: 1;
          }
          .invoice-details {
            text-align: right;
          }
          .address-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .billing-address, .shipping-address {
            flex: 1;
          }
          .shipping-address {
            margin-left: 40px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
          }
          .totals {
            width: 40%;
            margin-left: auto;
            margin-bottom: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .bold {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-details">
              <h2>${invoiceData.soldBy}</h2>
              <p>${[
                invoiceData.soldByAddress.buildingNumber,
                invoiceData.soldByAddress.address,
                invoiceData.soldByAddress.landmark,
                invoiceData.soldByAddress.city,
                invoiceData.soldByAddress.state,
                invoiceData.soldByAddress.pincode,
                invoiceData.soldByAddress.countryCode
              ].filter(Boolean).join(', ')}</p>
              ${invoiceData.gstNumber ? `<p>GST: ${invoiceData.gstNumber}</p>` : ''}
              ${invoiceData.panNumber ? `<p>PAN: ${invoiceData.panNumber}</p>` : ''}
            </div>
            
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${invoiceData.invoiceDate}</p>
              <p><strong>Order Number:</strong> ${invoiceData.orderNumber}</p>
              <p><strong>Order Date:</strong> ${invoiceData.orderDate}</p>
            </div>
          </div>
          
          <div class="address-section">
            <div class="billing-address">
              <h3>Bill To:</h3>
              <p><strong>${invoiceData.billingName}</strong></p>
              <p>${[
                invoiceData.billingAddress.buildingNumber,
                invoiceData.billingAddress.address,
                invoiceData.billingAddress.landmark,
                invoiceData.billingAddress.city,
                invoiceData.billingAddress.state,
                invoiceData.billingAddress.pincode,
                invoiceData.billingAddress.countryCode
              ].filter(Boolean).join(', ')}</p>
            </div>
            
            <div class="shipping-address">
              <h3>Ship To:</h3>
              <p><strong>${invoiceData.shippingName || invoiceData.billingName}</strong></p>
              <p>${[
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).buildingNumber,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).address,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).landmark,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).city,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).state,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).pincode,
                (invoiceData.sameAsBilling ? invoiceData.billingAddress : invoiceData.shippingAddress).countryCode
              ].filter(Boolean).join(', ')}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Net Amount</th>
                <th>Tax Rate</th>
                <th>Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.unitPrice}</td>
                  <td>₹${item.discount}</td>
                  <td>₹${item.netAmount}</td>
                  <td>${item.taxType}%</td>
                  <td>₹${item.totalTax}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${invoiceData.subtotal}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>₹${invoiceData.totalTax}</span>
            </div>
            <div class="total-row bold">
              <span>Grand Total:</span>
              <span>₹${invoiceData.grandTotal}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment is due within 30 days of invoice date.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);

      const htmlContent = generateHTML(formData);
      
      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // Define a better filename with the invoice number
      const pdfName = `Invoice_${formData.invoiceNumber}.pdf`;
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
      Alert.alert('Error', 'Failed to export invoice as PDF');
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
          <ViewShot ref={invoiceRef} options={{ format: "jpg", quality: 0.9 }}>
            <InvoiceTemplate invoiceData={formData} />
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
      <InvoiceForm
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

export default InvoiceScreen;