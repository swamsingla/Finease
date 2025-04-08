import React, { useState, useRef } from 'react';
import { ScrollView, View, Button, Alert, ActivityIndicator } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';

import InvoiceForm from './InvoiceForm'; // Using the converted form component
import InvoiceTemplate from './InvoiceTemplate';

const InvoiceCreateScreen = ({ navigation }) => {
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
    // Basic validation
    if (!formData.soldBy || !formData.billingName) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

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
      setShowPreview(true);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      
      // Capture the invoice template as an image
      const uri = await captureRef(invoiceRef, {
        format: 'jpg',
        quality: 0.9,
      });
      
      // Generate PDF from HTML that includes the captured image
      const html = `
        <html>
          <body style="padding: 0; margin: 0;">
            <img src="${uri}" style="width: 100%;" />
          </body>
        </html>
      `;
      
      const options = {
        html,
        fileName: `Invoice_${formData.invoiceNumber}`,
        directory: 'Documents',
      };
      
      const file = await RNHTMLtoPDF.convert(options);
      
      // Share the PDF
      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: `Invoice ${formData.invoiceNumber}`,
      });
      
      // Navigate back or to a success screen if needed
      // navigation.navigate('InvoiceSuccess', { invoiceNumber: formData.invoiceNumber });
      
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
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View ref={invoiceRef} collapsable={false}>
            <InvoiceTemplate invoiceData={formData} />
          </View>
        </ScrollView>
        
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Back to Edit" onPress={handleBackToEdit} disabled={isLoading} />
          <Button title={isLoading ? 'Processing...' : 'Export PDF'} onPress={handleExportPDF} disabled={isLoading} />
        </View>
        
        {isLoading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <InvoiceForm 
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate} 
      />
      
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
};

export default InvoiceCreateScreen;