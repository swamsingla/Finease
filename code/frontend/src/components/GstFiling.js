import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, IconButton, Button } from '@mui/material';
import { Home, Receipt, Upload, FileText, Bell, User, ArrowLeft } from 'lucide-react';

function GstFiling() {
  const navigate = useNavigate();
  const location = useLocation();

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
          height: '300px',
          textAlign: 'center'
        }}>
          <Typography variant="h5" style={{ marginBottom: '16px' }}>GST Filing</Typography>
          <Typography variant="body1">
            This feature will be available soon. You'll be able to submit your GST returns here.
          </Typography>
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