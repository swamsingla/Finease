import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import { Home, Receipt, Upload, FileText, User, ArrowLeft, Download } from 'lucide-react';
import axios from 'axios';

function GstFiling() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gstData, setGstData] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGSTData();
  }, []);

  // Fetch GST data from the backend
  const fetchGSTData = async () => {
    try {
      setLoading(true);
      // Assuming you have an endpoint to fetch GST data - you'll need to implement this on the backend
      const response = await axios.get('http://localhost:5000/api/gst');
      setGstData(response.data);
      
      // Format the data according to required structure
      formatGSTData(response.data);
    } catch (err) {
      console.error("Error fetching GST data:", err);
      setError("Failed to fetch GST data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Format GST data according to specified structure
  const formatGSTData = (data) => {
    if (!data || data.length === 0) {
      setFormattedData(null);
      return;
    }

    // Create the base structure
    const formatted = {
      gstin: data[0].gstin, // Using the first record's GSTIN
      fp: "032025",
      version: "GST3.2.1",
      hash: "hash",
      b2b: []
    };

    // Group by CTIN
    const ctinGroups = {};
    data.forEach(item => {
      if (!ctinGroups[item.ctin]) {
        ctinGroups[item.ctin] = [];
      }
      ctinGroups[item.ctin].push(item);
    });

    // Create b2b array
    let invoiceNumber = 1; // Initialize invoice number counter for this CTIN
    Object.keys(ctinGroups).forEach(ctin => {
      const ctinEntry = {
        ctin: ctin,
        inv: []
      };

      // Create invoices for each CTIN
      
      ctinGroups[ctin].forEach((item) => {
        const invoiceDate = new Date(item.invoiceDate);
        const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}-${
          (invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${
          invoiceDate.getFullYear()}`;
        
        const txval = (100/9) * parseFloat(item.cgst);
        
        ctinEntry.inv.push({
          inum: invoiceNumber.toString(), // Use the counter specific to this CTIN
          idt: formattedDate,
          val: parseFloat(item.totalAmount),
          pos: "36",
          rchrg: "N",
          inv_typ: "R",
          itms: [
            {
              num: 1801,
              itm_det: {
                txval: parseFloat(txval.toFixed(2)),
                rt: 18,
                camt: parseFloat(item.cgst),
                samt: parseFloat(item.sgst),
                csamt: 0
              }
            }
          ]
        });
        
        invoiceNumber++; // Increment invoice number for next invoice in this CTIN
      });

      formatted.b2b.push(ctinEntry);
    });

    setFormattedData(formatted);
  };

  // Download the formatted data as JSON
  const downloadJSON = () => {
    if (!formattedData) return;
    
    const dataStr = JSON.stringify(formattedData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gst_filing_data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '80px', backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={() => navigate('/profile')}><User /></IconButton>
          <Typography variant="h6">GST Filing</Typography>
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
          <Typography variant="h5" style={{ marginBottom: '16px' }}>GST Filing Data</Typography>
          
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : !gstData || gstData.length === 0 ? (
            <Typography>No GST data found. Please submit invoice data first.</Typography>
          ) : (
            <>
              <Typography variant="body1" style={{ marginBottom: '16px' }}>
                Your GST data is ready for filing. Click the button below to download the JSON file.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={downloadJSON}
                disabled={!formattedData}
              >
                Download GST Filing JSON
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
          <NavItem icon={<Receipt />} label="File" onClick={() => navigate('/file')} active={location.pathname === '/file' || location.pathname === '/gst-filing'} />
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

export default GstFiling;