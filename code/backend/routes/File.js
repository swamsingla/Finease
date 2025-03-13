import React from 'react';
import { Container, Typography, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Upload, FileText, Bell, Search, User } from 'lucide-react';

function File() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '80px', backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={() => navigate('/profile')} sx={{ color: 'white' }}><User /></IconButton>
          <Typography variant="h6" sx={{ color: 'white' }}>File</Typography>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <IconButton sx={{ color: 'white' }}><Search /></IconButton>
          <IconButton sx={{ color: 'white' }}><Bell /></IconButton>
        </div>
      </div>
      
      {/* Coming Soon Message - Centered */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: 'calc(100vh - 160px)' // Adjust height to account for top and bottom nav
      }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center',width: '100%' }}>
          Coming Soon
        </Typography>
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #333' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
          <NavItem icon={<Home />} label="Home" onClick={() => navigate('/')} active={location.pathname === '/'} />
          <NavItem icon={<Receipt />} label="File" onClick={() => navigate('/file')} active={location.pathname === '/file'} />
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

export default File;