import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, Button } from '@mui/material';
import { 
  Bell, 
  Lock, 
  Phone, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Home,
  Receipt,
  Upload,
  Building2,
  Mail,
  Clock
} from 'lucide-react';
import EditProfile from './EditProfile'; // Import the EditProfile component
import Support from './Support';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State to control the notifications modal (unchanged)
  const [showNotifications, setShowNotifications] = useState(false);
  // New state to control the Edit Profile modal popup
  const [showEditProfile, setShowEditProfile] = useState(false);
  // New state for Support modal
  const [showSupport, setShowSupport] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Open the notifications modal
  const handleOpenNotifications = () => {
    setShowNotifications(true);
  };

  // Close the notifications modal
  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // Open the Edit Profile modal
  const handleOpenEditProfile = () => {
    setShowEditProfile(true);
  };

  // Close the Edit Profile modal
  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  // Open the Support modal
  const handleOpenSupport = () => {
    setShowSupport(true);
  };

  // Close the Support modal
  const handleCloseSupport = () => {
    setShowSupport(false);
  };

  // Format date to readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-4 pb-20">
      {/* Profile Header */}
      <Card className="bg-white mb-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.52 0-10 2.24-10 5v2h20v-2c0-2.76-4.48-5-10-5z" />
              </svg>
            </div>
            <div className="flex-1">
              {user?.role === 'business' ? (
                <>
                  <h2 className="text-xl font-semibold">{user?.companyName || 'Company Name'}</h2>
                  <p className="text-sm text-gray-500">Business Account</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">Individual Account</h2>
                  <p className="text-sm text-gray-500">Personal Tax Filing</p>
                </>
              )}
            </div>
            {/* Instead of navigating to /edit-profile, we open the modal */}
            <Button variant="outlined" className="text-blue-600" onClick={handleOpenEditProfile}>
              Edit Profile
            </Button>
          </div>
          
          {/* User Details Section */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
            {user?.role === 'business' && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">GSTIN: {user?.gstin}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Member since {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Menu Items */}
      <div className="space-y-3">
        <MenuCard 
          icon={<Bell className="w-5 h-5" />} 
          title="Notifications" 
          subtitle="Manage your notifications"
          onClick={handleOpenNotifications} 
        />
        
        <MenuCard 
          icon={<Lock className="w-5 h-5" />} 
          title="Password" 
          subtitle="Change your password"
          onClick={() => handleNavigation('/reset-password')} 
        />
        
        <MenuCard 
          icon={<Phone className="w-5 h-5" />} 
          title="Contact Us" 
          subtitle="support@taxfile.com"
          onClick={() => (window.location.href = 'mailto:support@taxfile.com')} 
        />
        
        <MenuCard 
          icon={<FileText className="w-5 h-5" />} 
          title="Tax Reports" 
          subtitle="View your tax reports"
          onClick={() => handleNavigation('/reports')} 
        />
        
        <MenuCard 
          icon={<HelpCircle className="w-5 h-5" />} 
          title="Support" 
          subtitle="Need help?"
          onClick={handleOpenSupport}
        />
        
        <MenuCard 
          icon={<LogOut className="w-5 h-5" />} 
          title="Sign Out" 
          subtitle="Switch to a different account"
          onClick={handleSignOut} 
        />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex justify-between p-4">
          <NavItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            onClick={() => handleNavigation('/')}
            active={location.pathname === '/'} 
          />
          <NavItem 
            icon={<Receipt className="w-5 h-5" />} 
            label="File" 
            onClick={() => handleNavigation('/file')}
            active={location.pathname === '/file'} 
          />
          <NavItem 
            icon={<Upload className="w-5 h-5" />} 
            label="Upload" 
            onClick={() => handleNavigation('/upload')}
            active={location.pathname === '/upload'} 
          />
          <NavItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Invoice" 
            onClick={() => navigate('/invoice')}
            active={location.pathname === '/invoice'} 
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <EditProfile onClose={handleCloseEditProfile} />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseEditProfile}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && <NotificationsModal onClose={handleCloseNotifications} />}

      {/* Support Modal */}
      {showSupport && (
        <div className="modal-backdrop">
          <div className="modal-content relative">
            <Support />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseSupport}
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
      )}
    </div>
  );
};

const MenuCard = ({ icon, title, subtitle, onClick }) => (
  <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
    <CardContent className="p-4 flex items-center gap-4">
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
);

const NavItem = ({ icon, label, onClick, active }) => (
  <button 
    className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-600'}`}
    onClick={onClick}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

/* Notifications Modal Component */
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

export default ProfilePage;
