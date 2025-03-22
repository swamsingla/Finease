import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, Container, Typography, IconButton } from '@mui/material';
import { Home, Receipt, Upload, FileText, Bell, User, FileBarChart, Briefcase, BarChart2 } from 'lucide-react';

function File() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '80px', backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={() => navigate('/profile')}><User /></IconButton>
          <Typography variant="h6">File Documents</Typography>
        </div>
      </div>
      
      <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Select Filing Type</h2>
        
        {/* GST Filing Option */}
        <Card className="hover:bg-gray-50 transition-colors cursor-pointer mb-4" onClick={() => navigate('/gst-filing')}>
          <CardContent className="p-6 flex items-center gap-4">
            <FileBarChart className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-medium">GST Filing</h3>
              <p className="text-sm text-gray-500">File your GST returns and invoices</p>
            </div>
          </CardContent>
        </Card>
        
        {/* ITR Filing Option */}
        <Card className="hover:bg-gray-50 transition-colors cursor-pointer mb-4" onClick={() => navigate('/itr-filing')}>
          <CardContent className="p-6 flex items-center gap-4">
            <BarChart2 className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-medium">ITR Filing</h3>
              <p className="text-sm text-gray-500">File your income tax returns</p>
            </div>
          </CardContent>
        </Card>
        
        {/* PF Filing Option */}
        <Card className="hover:bg-gray-50 transition-colors cursor-pointer mb-4" onClick={() => navigate('/epf-ecr')}>
          <CardContent className="p-6 flex items-center gap-4">
            <Briefcase className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-medium">EPF ECR Generator</h3>
              <p className="text-sm text-gray-500">Create and download ECR file for EPF submissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
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