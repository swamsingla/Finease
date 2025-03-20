import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import { Home, Receipt, Upload, FileText, User, ArrowLeft, Download } from 'lucide-react';
import axios from 'axios';

function ItrFiling() {
  const navigate = useNavigate();
  const location = useLocation();
  const [itrData, setItrData] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchITRData();
  }, []);

  const fetchITRData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/itr');
  
      // If the backend returns an array, pick the first element
      const record = Array.isArray(data) ? data[0] : data;
  
      if (!record) {
        setError("No ITR record found");
        setItrData(null);
        return;
      }
  
      setItrData(record);
      formatITRData(record);
    } catch (err) {
      console.error("Error fetching ITR data:", err);
      setError("Failed to fetch ITR data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };  

  // Format ITR data to include all details required for ITR-1 filing
  const formatITRData = (data) => {
    if (!data) {
      setFormattedData(null);
      return;
    }
    
    const formatted = {
      personalInfo: {
        name: data.name || "N/A",         // Assume these fields are available (from User model)
        dob: data.dob || "N/A",
        pan: data.panNo,
        aadhar: data.aadhar || "N/A",
        address: {
          line1: data.addressEmployee,    // using employee address as a base
          line2: "",
          city: data.city || "N/A",
          state: data.state || "N/A",
          pin: data.pin || "N/A"
        },
        residentialStatus: "Resident"
      },
      contactInfo: {
        email: data.email,
        phone: data.phone || "N/A"
      },
      bankInfo: {
        accountNumber: data.bankAccountNumber || "N/A",
        ifsc: data.ifsc || "N/A",
        bankName: data.bankName || "N/A",
        branch: data.branch || "N/A"
      },
      incomeDetails: {
        salary: {
          totalSalary: data.grossTotalIncome,
          taxableSalary: data.grossTaxableIncome,
          allowances: data.allowances || 0,
          perquisites: data.perquisites || 0,
          deductionsUnderSection16: data.deductionsUnderSection16 || 0
        },
        incomeFromOtherSources: {
          interestIncome: data.interestIncome || 0,
          rentalIncome: data.rentalIncome || 0,
          other: data.otherIncome || 0
        },
        totalIncome: data.totalIncome || data.grossTotalIncome
      },
      deductions: {
        "80C": data.deduction80C || 0,
        "80D": data.deduction80D || 0,
        "80TTA": data.deduction80TTA || 0,
        others: data.otherDeductions || 0,
        totalDeductions: data.totalDeductions || 0
      },
      taxComputation: {
        grossTax: data.grossTax || 0,
        rebate: data.rebate || 0,
        cess: data.cess || 0,
        netTaxPayable: data.netTaxPayable,
        taxPaid: {
          tds: data.tds || 0,
          advanceTax: data.advanceTax || 0,
          selfAssessmentTax: data.selfAssessmentTax || 0
        }
      },
      filingPeriod: {
        from: data.period.from,
        to: data.period.to
      },
      declaration: {
        place: data.declarationPlace || "N/A",
        date: data.declarationDate || new Date().toISOString(),
        status: data.declarationStatus || "Draft"
      },
      timestamps: {
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    };

    setFormattedData(formatted);
  };

  // Download the formatted ITR data as JSON
  const downloadJSON = () => {
    if (!formattedData) return;
    const dataStr = JSON.stringify(formattedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'itr_filing_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '80px', backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={() => navigate('/profile')}><User /></IconButton>
          <Typography variant="h6">ITR Filing</Typography>
        </div>
      </div>
      
      <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
        <Button 
          startIcon={<ArrowLeft />} 
          onClick={() => navigate('/file')}
          variant="text" 
          style={{ marginBottom: '20px' }}
        >
          Back to Filing Options
        </Button>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Typography variant="h5" style={{ marginBottom: '16px' }}>ITR Filing Data</Typography>
          
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : !itrData ? (
            <Typography>No ITR data found. Please submit your ITR details first.</Typography>
          ) : (
            <>
              <Typography variant="body1" style={{ marginBottom: '16px' }}>
                Your ITR data is ready for filing. Click the button below to download the comprehensive JSON file.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={downloadJSON}
                disabled={!formattedData}
              >
                Download ITR Filing JSON
              </Button>
              
              {formattedData && (
                <div style={{ marginTop: '20px', textAlign: 'left', width: '100%', overflow: 'auto' }}>
                  <Typography variant="subtitle1">Preview:</Typography>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(formattedData, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
          <NavItem icon={<Home />} label="Home" onClick={() => navigate('/')} active={location.pathname === '/'} />
          <NavItem icon={<Receipt />} label="File" onClick={() => navigate('/file')} active={location.pathname === '/file' || location.pathname === '/itr-filing'} />
          <NavItem icon={<Upload />} label="Upload" onClick={() => navigate('/upload')} active={location.pathname === '/upload'} />
          <NavItem icon={<FileText />} label="Invoice" onClick={() => navigate('/invoice')} active={location.pathname === '/invoice'} />
        </div>
      </div>
    </Container>
  );
}

const NavItem = ({ icon, label, onClick, active }) => (
  <button 
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '4px', 
      color: active ? '#2563eb' : 'grey', 
      backgroundColor: 'transparent', 
      border: 'none', 
      cursor: 'pointer' 
    }} 
    onClick={onClick}
  >
    {icon}
    <span style={{ fontSize: '0.75rem' }}>{label}</span>
  </button>
);

export default ItrFiling;
