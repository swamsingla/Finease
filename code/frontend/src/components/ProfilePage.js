import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '@mui/material';
import { Button } from '@mui/material';
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

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
            <Button variant="outlined" className="text-blue-600" onClick={() => handleNavigation('/edit-profile')}>
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
              {/* {console.log(user)} */}
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
          onClick={() => handleNavigation('/notifications')} 
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
          onClick={() => window.location.href = 'mailto:support@taxfile.com'} 
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
          onClick={() => handleNavigation('/support')} 
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
            label="Records" 
            onClick={() => handleNavigation('/records')}
            active={location.pathname === '/records'} 
          />
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, subtitle, onClick }) => (
  <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
    <CardContent className="p-4 flex items-center gap-4">
      <div className="text-gray-600">
        {icon}
      </div>
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

export default ProfilePage;