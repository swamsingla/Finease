import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import EwayForm from "./EwayForm";
import EwayTemplate from "./EwayTemplate";
import axios from 'axios';

function EwayCreate() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const initialFormData = {
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
      enteredDate: "",
      enteredBy: "-"
    }]
  };

  const [formData, setFormData] = useState(initialFormData);
  const [ewayData, setEwayData] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Eway-${formData.documentNo || 'draft'}`,
    onBeforePrint: async () => {
      setIsPrinting(true);
      
      if (!ewayData) {
        console.error('No eway bill data to save');
        return;
      }
  
      try {
        const response = await axios.post(
          'http://localhost:5000/api/invoice/eway/create',
          ewayData
        );
        console.log('E-way bill saved:', response.data);
        alert('E-way bill saved successfully!');
      } 
      catch (error) {
        console.error('Error saving e-way bill:', error);
        alert('Failed to save e-way bill');
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
        const ewayBillNo = "EWB-" + Math.floor(Math.random() * 1000000);
        const documentNo = "DOC-" + Math.floor(Math.random() * 1000000);
        const today = new Date().toLocaleDateString("en-GB");
        
        // Handle valid until date properly
        let validUntil = "";
        if (formData.validFrom) {
        const validFromDate = new Date(formData.validFrom);
        if (!isNaN(validFromDate.getTime())) {
            const futureDate = new Date(validFromDate);
            futureDate.setMonth(futureDate.getMonth() + 3);
            validUntil = futureDate.toISOString().split('T')[0];
        }
        }

        const data = {
        ...formData,
        ewayBillNo,
        documentNo,
        ewayBillDate: today,
        validUntil: validUntil || ""
        };

        setEwayData(data);
        setTimeout(() => {
            if (printRef.current) {
              handlePrint();
            }
          }, 100);
        } catch (error) {
          console.error('Error generating EwayBill:', error);
        }
    };

    

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">E-Way Bill Generator</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <EwayForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={onGenerate}
          />
        </div>

        <div style={{ display: 'none' }}>
          <EwayTemplate 
            ref={printRef} 
            data={ewayData || formData} 
          />
        </div>
        
        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/invoice')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
          >
            Back to Invoice Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default EwayCreate;