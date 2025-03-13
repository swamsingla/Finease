import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, IconButton, Typography, Select, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Upload, FileText, Bell, User } from 'lucide-react';
import SwipeableViews from 'react-swipeable-views';
import { Bar } from 'react-chartjs-2'; // new import
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // new import
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // register scales

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0); // Track the active slide index
  const [netIncome, setNetIncome] = useState(0);  // New state for net income
  const [period, setPeriod] = useState("yearly"); // New state for period
  const [monthlyIncomeData, setMonthlyIncomeData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: Array(12).fill(0) // Start with zeros instead of random values
  });
  const [isLoading, setIsLoading] = useState(true);
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    gstAmount: 0,
    potentialSavings: 0,
    daysRemaining: 0
  });
  const [cardData, setCardData] = useState({
    tax: 0,
    income: 0,
    savings: 0,
    expenses: 0,
    investments: 0,
    debt: 0
  });
  // Add state for notifications modal
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Add handlers for notifications
  const handleOpenNotifications = () => {
    setShowNotifications(true);
  };
  
  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const chartData = {
    labels: monthlyIncomeData.labels,
    datasets: [
      {
        label: period === 'yearly' ? 'Monthly Income (₹)' : 'Income This Month (₹)',
        data: monthlyIncomeData.values,
        backgroundColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Use Effect Hook
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get the current year for yearly data filtering
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // API expects 1-12

        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        // Set up the authorization header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {}
        };

        // Fetch stats based on period (monthly or yearly)
        config.params = period === 'monthly' ?
          { year: currentYear, month: currentMonth } :
          { year: currentYear };

        const statsResponse = await axios.get(
          `http://localhost:5000/api/dashboard/document-statistics`,
          config
        );

        // Fetch monthly data for charts with same auth header
        const chartResponse = await axios.get(
          `http://localhost:5000/api/dashboard/monthly-data`,
          {
            ...config,
            params: { year: currentYear }
          }
        );

        // Rest of your code remains the same
        console.log('Stats response:', statsResponse.data);
        console.log('Chart response:', chartResponse.data);

        // Process stats data with proper structure handling
        const statsData = statsResponse.data.statistics;
        const financials = statsData.financials;
        const byType = statsData.byType;

        // Process Information from chartResponse.monthlyData
        const monthlyData = chartResponse.data.monthlyData.data;
        console.log('Monthly data:', monthlyData);
        const calculateYearlyData = (monthlyData) => {
          let totalTax = 0;
          let totalIncome = 0;
          let totalDocuments = 0;

          monthlyData.amounts.forEach(month => {
            totalIncome += month;
          });
          monthlyData.taxes.forEach(month => {
            totalTax += month;
          });
          monthlyData.totalCounts.forEach(month => {
            totalDocuments += month;
          });

          return { tax: totalTax, income: totalIncome, documents: totalDocuments };
        };

        const yearlyData = calculateYearlyData(monthlyData);
        console.log('Yearly data:', yearlyData);


        // Create a dictionary with amounts, taxes, and totalCounts
        const calculateMonthlyData = (monthlyData,index) => {
          let totalTax = monthlyData.taxes[index];
          let totalIncome = monthlyData.amounts[index];
          let totalDocuments = monthlyData.totalCounts[index];
          return { tax: totalTax, income: totalIncome, documents: totalDocuments };
        };
        console.log('Monthly Summary:', calculateMonthlyData(monthlyData, currentMonth - 1));

        const monthlySummaryData = calculateMonthlyData(monthlyData, currentMonth - 1);
        
        // Replace the yearly period calculations (around line 135)
        if (period === 'yearly') {
          setDocumentStats({
            totalDocuments: yearlyData.documents,
            gstAmount: yearlyData.tax,
            potentialSavings: yearlyData.tax * 0.1,
            daysRemaining: calculateDaysRemaining().days
          });

          // Improved formulas for yearly metrics
          const yearlyIncome = yearlyData.income;
          const yearlyTax = yearlyData.tax;
          
          // Expenses typically account for 60-70% of business revenue
          const expenses = yearlyIncome * 0.65;
          
          // Debt is often around 25-30% of annual revenue for small businesses
          const debt = yearlyIncome * 0.28;
          
          // Operating profit after expenses and taxes
          const operatingProfit = yearlyIncome - expenses - yearlyTax;
          
          // Investments would be a portion of operating profit
          const investments = operatingProfit * 0.4;
          
          // Savings would be remaining operating profit after investments
          const savings = operatingProfit - investments;

          setCardData({
            tax: yearlyTax.toFixed(2),
            income: yearlyIncome.toFixed(2),
            expenses: expenses.toFixed(2),
            debt: debt.toFixed(2),
            investments: investments.toFixed(2),
            savings: savings.toFixed(2)
          });
        } else {
          // Similarly for monthly data
          setDocumentStats({
            totalDocuments: monthlySummaryData.documents,
            gstAmount: monthlySummaryData.tax,
            potentialSavings: monthlySummaryData.tax * 0.1,
            daysRemaining: calculateDaysRemaining().days
          });

          // Improved formulas for monthly metrics
          const monthlyIncome = monthlySummaryData.income;
          const monthlyTax = monthlySummaryData.tax;
          
          // Monthly expenses
          const expenses = monthlyIncome * 0.65;
          
          // Monthly debt payments
          const debt = monthlyIncome * 0.28;
          
          // Operating profit
          const operatingProfit = monthlyIncome - expenses - monthlyTax;
          
          // Monthly investments
          const investments = operatingProfit * 0.4;
          
          // Monthly savings
          const savings = operatingProfit - investments;

          setCardData({
            tax: monthlyTax.toFixed(2),
            income: monthlyIncome.toFixed(2),
            expenses: expenses.toFixed(2),
            debt: debt.toFixed(2),
            investments: investments.toFixed(2),
            savings: savings.toFixed(2)
          });
        }

        // Set net income from the correct location
        setNetIncome(yearlyData.income.toFixed(2));

        // Process chart data properly from the API response
        if (chartResponse.data?.monthlyData) {
          const monthlyData = chartResponse.data.monthlyData;
          setMonthlyIncomeData({
            labels: monthlyData.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: monthlyData.data.amounts
          });
        }
      }
      catch (error) {
        console.error("Error fetching dashboard data:", error);

        // If we get a 401, the token might be expired - handle auth error
        if (error.response && error.response.status === 401) {
          console.log("Authentication error - you might need to log in again");
          // Optional: Redirect to login page
          // navigate('/login');
        }

        // Set placeholder data for the UI to avoid crashes
        setMonthlyIncomeData({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          values: Array(12).fill(0)
        });

        setDocumentStats({
          totalDocuments: 0,
          totalGenerated: 0,
          totalUploaded: 0,
          gstAmount: 0,
          potentialSavings: 0,
          daysRemaining: calculateDaysRemaining().days
        });

        setCardData({
          tax: "0.00",
          income: "0.00",
          savings: "0.00",
          expenses: "0.00",
          investments: "0.00",
          debt: "0.00"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  // Dashboard stats
  const dashboardStats = [
    `Total GST: ₹${(documentStats.gstAmount || 0).toFixed(2)} ${period === 'yearly' ? 'this year' : 'this month'}`,
    `Total Documents: ${documentStats.totalDocuments || 0}`,
    `Potential Savings: ₹${(documentStats.potentialSavings || 0).toFixed(2)} based on your filings`,
    `Days Remaining: ${documentStats.daysRemaining || 0} until July 31st tax filing deadline`
  ];

  // Replace the calculateDaysRemaining function
  const calculateDaysRemaining = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Set the tax filing deadline to July 31st of the current year
    const filingDeadline = new Date(currentYear, 6, 31); // July 31st (month is 0-indexed)

    // If today is already past July 31st, set deadline to next year
    if (today > filingDeadline) {
      filingDeadline.setFullYear(currentYear + 1);
    }

    // Calculate days difference
    const diffTime = filingDeadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays > 0 ? diffDays : 0,
      filingDate: filingDeadline
    };
  };

  const handleChangeIndex = (index) => {
    setActiveIndex(index); // Update the active index when the slide changes
  };

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '80px' }}>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Typography>Loading dashboard data...</Typography>
        </div>
      )}

      {!isLoading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconButton onClick={() => navigate('/profile')}><User /></IconButton>
              <Typography variant="h6">Hey, {user?.companyName}</Typography>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <IconButton onClick={handleOpenNotifications}><Bell /></IconButton>
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
                  padding: '8px',
                  textAlign: 'center',
                  borderRadius: '2px',
                  margin: '16px 0',
                  height: '80px',
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
                onClick={() => setActiveIndex(index)}
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
              Total Business Volume ({period}): ₹{netIncome}
            </Typography>
          </div>
          {/* New Monthly Income Bar Graph */}
          <div style={{ marginBottom: '32px', height: '400px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: period === 'yearly' ? 'Monthly Income Distribution' : 'Current Month Income',
                    font: {
                      size: 16
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return '₹ ' + context.parsed.y.toLocaleString();
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return '₹' + value.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          </div>
          {/* New Scrollable Placards Section */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', padding: '16px 0' }}>
            <div style={{ minWidth: '200px', backgroundColor: '#D1E8E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Tax (GST)</Typography>
              <Typography variant="h6">₹{cardData.tax}</Typography>
            </div>
            <div style={{ minWidth: '200px', backgroundColor: '#A9D6E5', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Income</Typography>
              <Typography variant="h6">₹{cardData.income}</Typography>
            </div>
            <div style={{ minWidth: '200px', backgroundColor: '#E2E2E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Savings</Typography>
              <Typography variant="h6">₹{cardData.savings}</Typography>
            </div>
            <div style={{ minWidth: '200px', backgroundColor: '#D1E8E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Expenses</Typography>
              <Typography variant="h6">₹{cardData.expenses}</Typography>
            </div>
            <div style={{ minWidth: '200px', backgroundColor: '#A9D6E5', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Investments</Typography>
              <Typography variant="h6">₹{cardData.investments}</Typography>
            </div>
            <div style={{ minWidth: '200px', backgroundColor: '#E2E2E2', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
              <Typography variant="subtitle1">Debt</Typography>
              <Typography variant="h6">₹{cardData.debt}</Typography>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
          <NavItem icon={<Home />} label="Home" onClick={() => navigate('/')} active={location.pathname === '/'} />
          <NavItem icon={<Receipt />} label="File" onClick={() => navigate('/file')} active={location.pathname === '/file'} />
          <NavItem icon={<Upload />} label="Upload" onClick={() => navigate('/upload')} active={location.pathname === '/upload'} />
          <NavItem icon={<FileText />} label="Invoice" onClick={() => navigate('/invoice')} active={location.pathname === '/invoice'} />
        </div>
      </div>
      
      {/* Add Notifications Modal */}
      {showNotifications && <NotificationsModal onClose={handleCloseNotifications} />}
    </Container>
  );
}

// Add the NotificationsModal component from ProfilePage.js
const NotificationsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal-content relative">
        <h2 className="text-center font-semibold text-lg mb-4">NOTIFICATIONS</h2>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-center">No notifications found.</p>
        ) : (
          <div className="flex flex-col space-y-3">
            {notifications.map((notif, index) => (
              <div key={index} className="notification-card">
                <p className="font-medium">{notif.type}</p>
                <p className="text-sm">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, onClick, active }) => (
  <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: active ? '#2563eb' : '#4b5563', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onClick}>
    {icon}
    <span style={{ fontSize: '0.75rem' }}>{label}</span>
  </button>
);

export default Dashboard;