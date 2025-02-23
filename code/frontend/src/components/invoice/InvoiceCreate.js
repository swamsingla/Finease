import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceForm from "./InvoiceForm";
import InvoiceTemplate from "./InvoiceTemplate";
import axios from 'axios';

function InvoiceCreate() {
  const printRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const initialFormData = {
    soldBy: "-",
    soldByAddress: {
      buildingNumber: "-",
      address: "-",
      landmark: "-",
      city: "-",
      state: "-",
      pincode: "-",
      countryCode: "IN"
    },
    billingName: "",
    billingAddress: {
      buildingNumber: "-",
      address: "-",
      landmark: "-",
      city: "-",
      state: "-",
      pincode: "-",
      countryCode: "IN"
    },
    shippingName: "-",
    shippingAddress: {
      buildingNumber: "-",
      address: "-",
      landmark: "-",
      city: "-",
      state: "-",
      pincode: "-",
      countryCode: "IN"
    },
    sameAsBilling: false,
    panNumber: "-",
    gstNumber: "-",
    stateUtCode: "-",
    orderDate: "",
    orderNumber: "-",
    items: [{
      name: "-",
      unitPrice: "0",
      discount: "0",
      qty: "1",
      taxType: "18",
      totalTax: "0",
      netAmount: "0"
    }],
    invoiceNumber: "-",
    invoiceDate: "",
    placeOfSupply: "-",
    placeOfDelivery: "-",
    netAmount: "0",
    taxAmount: "0",
    totalAmount: "0"
  };

  const [formData, setFormData] = useState(initialFormData);
  const [invoiceData, setInvoiceData] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${formData.orderNumber || 'draft'}`,
    onBeforePrint: async () => {
      setIsPrinting(true);
      
      if (!invoiceData) {
        console.error('No invoice data to save');
        return;
      }
    
      try {
      const response = await axios.post(
        'http://localhost:5000/api/invoice/create',
        invoiceData
      );
      console.log('Invoice saved:', response.data);
      alert('Invoice saved successfully!');
    } 
    catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice');
      throw error; // This will prevent printing if save fails
    }
      
      return new Promise((resolve) => {
        setTimeout(resolve, 250);
      });
    },

    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: (error) => {
      console.error('Failed to print:', error);
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
    removeAfterPrint: true
  });

  const onGenerate = async () => {
    try {
      const randomInvoiceNumber = "INV-" + Math.floor(Math.random() * 100000);
      const today = new Date().toLocaleDateString("en-GB");

      // Calculate net amount and tax for each item
      const itemsWithTax = formData.items.map(item => {
        const itemNet = parseFloat(item.netAmount) || 0;
        const itemTotalTax = (itemNet * parseFloat(item.taxType) / 100) || 0;
        return {
          ...item,
          totalTax: itemTotalTax.toFixed(2)
        };
      });

      const net = formData.items.reduce((acc, item) => {
        const itemNet = parseFloat(item.netAmount) || 0;
        return acc + itemNet;
      }, 0);
      
      const tax = itemsWithTax.reduce((acc, item) => {
        return acc + parseFloat(item.totalTax);
      }, 0);


      const total = net + tax;

      const data = {
        ...formData,
        items: itemsWithTax,
        invoiceNumber: randomInvoiceNumber,
        invoiceDate: today,
        placeOfSupply: formData.billingAddress.state || "",
        placeOfDelivery: formData.sameAsBilling ? 
          formData.billingAddress.state : 
          formData.shippingAddress.state || "",
        netAmount: net.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: total.toFixed(2),
        qrImage: "/assets/qr.png",
        logoImage: "/assets/logo.png"
      };

      setInvoiceData(data);
      
      // Delay printing to ensure state is updated
      setTimeout(() => {
        if (printRef.current) {
          handlePrint();
        }
      }, 100);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto"> {/* Added wrapper div with mx-auto */}
        <h1 className="text-2xl font-bold mb-4 text-center">Invoice Generator</h1>
  
        <div className="bg-white p-6 rounded-lg shadow-md">
          <InvoiceForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={onGenerate}
          />
        </div>
  
        <div style={{ display: 'none' }}>
          <InvoiceTemplate 
            ref={printRef} 
            data={invoiceData || formData} 
          />
        </div>
      </div>
    </div>
  );
}

export default InvoiceCreate;