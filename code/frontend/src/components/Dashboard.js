import React, { useState, useEffect } from 'react';
import { Container, IconButton, Typography, Select, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Upload, FileText, Bell, Search, User } from 'lucide-react';
import SwipeableViews from 'react-swipeable-views';
import { Bar } from 'react-chartjs-2'; // new import
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // new import
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // register scales

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0); // Track the active slide index
  const [netIncome, setNetIncome] = useState(0);  // New state for net income
  const [period, setPeriod] = useState("yearly"); // New state for period
  const [monthlyIncomeData, setMonthlyIncomeData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10000))
  });
  
  const chartData = {
    labels: monthlyIncomeData.labels,
    datasets: [
      {
        label: 'Monthly Income',
        data: monthlyIncomeData.values,
        backgroundColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  useEffect(() => {
    // Simulated fetch call to get total net income
    fetch(`/api/net-income?period=${period}`) // Updated fetch endpoint to include period
      .then(response => response.json())
      .then(data => setNetIncome(data.netIncome))
      .catch(error => console.error("Error fetching net income:", error));
  }, [period]); // Added dependency

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
    <Container maxWidth="lg" style={{ paddingBottom: '80px' }}>
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
    <div
      key={index}
      style={{
        background: 'black',
        color: 'white',
        padding: '8px',             // Reduced padding
        textAlign: 'center',
        borderRadius: '2px',        // Even more rectangular shape
        margin: '16px 0',
        height: '80px',             // Smaller height, similar to the placards
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
        {stat}
      </Typography>
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
      {/* New period selection */}
      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </Select>
      </div>
      {/* New Total Net Income Section */}
      <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
        <Typography variant="h6">
          Net Income ({period}): ₹{netIncome}
        </Typography>
      </div>
      {/* New Monthly Income Bar Graph */}
      <div style={{ marginBottom: '32px', height: '400px' }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      {/* New Scrollable Placards Section */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', padding: '16px 0' }}>
        <div style={{ minWidth: '200px', backgroundColor: '#D1E8E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Tax</Typography>
          <Typography variant="h6">₹12,000</Typography>
        </div>
        <div style={{ minWidth: '200px', backgroundColor: '#A9D6E5', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Income</Typography>
          <Typography variant="h6">₹50,000</Typography>
        </div>
        <div style={{ minWidth: '200px', backgroundColor: '#E2E2E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Savings</Typography>
          <Typography variant="h6">₹8,000</Typography>
        </div>
        <div style={{ minWidth: '200px', backgroundColor: '#D1E8E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Expenses</Typography>
          <Typography variant="h6">₹30,000</Typography>
        </div>
        <div style={{ minWidth: '200px', backgroundColor: '#A9D6E5', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Investments</Typography>
          <Typography variant="h6">₹20,000</Typography>
        </div>
        <div style={{ minWidth: '200px', backgroundColor: '#E2E2E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
          <Typography variant="subtitle1">Debt</Typography>
          <Typography variant="h6">₹15,000</Typography>
        </div>
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