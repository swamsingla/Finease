import React, { useState } from 'react';
import { Container, IconButton, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Upload, FileText, Bell, Search, User } from 'lucide-react';
import SwipeableViews from 'react-swipeable-views';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0); // Track the active slide index

  const dashboardStats = [
    'Total GST Saved in comparison to last year: ₹12,345',
    'Total Bills Uploaded: 45 this financial year',
    'Potential Savings: ₹8,765 based on your filings',
    'Days Remaining: 28 to file your taxes'
  ];

  const handleChangeIndex = (index) => {
    setActiveIndex(index); // Update the active index when the slide changes
  };

  return (
    <Container maxWidth="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={() => navigate('/profile')}><User /></IconButton>
          <Typography variant="h6">Hey, Kushagra</Typography>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <IconButton><Search /></IconButton>
          <IconButton><Bell /></IconButton>
        </div>
      </div>

      {/* Swipeable Views */}
      <SwipeableViews enableMouseEvents index={activeIndex} onChangeIndex={handleChangeIndex}>
        {dashboardStats.map((stat, index) => (
          <div key={index} style={{ background: 'black', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '12px', margin: '16px 0', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" style={{ fontWeight: 'bold' }}>{stat}</Typography>
          </div>
        ))}
      </SwipeableViews>

      {/* Indicator Dots */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {dashboardStats.map((_, index) => (
          <span
            key={index}
            style={{
              height: '10px',
              width: '10px',
              margin: '0 5px',
              backgroundColor: activeIndex === index ? '#2563eb' : '#e0e0e0',
              borderRadius: '50%',
              display: 'inline-block',
              cursor: 'pointer'
            }}
            onClick={() => setActiveIndex(index)} // Change slide on dot click
          ></span>
        ))}
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
  <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: active ? '#2563eb' : '#4b5563', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onClick}>
    {icon}
    <span style={{ fontSize: '0.75rem' }}>{label}</span>
  </button>
);

export default Dashboard;