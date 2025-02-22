import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@mui/material";
import { Home, Receipt, Upload, FileText } from "lucide-react";

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-4 pb-20">
      <h2 className="text-xl font-semibold text-center mb-6">Generate Document</h2>

      <Card 
        className="hover:bg-gray-100 transition-colors cursor-pointer mb-4"
        onClick={() => navigate('/invoice-format')}  // Updated this line
        >
        <CardContent className="p-6 flex items-center gap-4">
            �
            <div className="flex-1">
            <h3 className="font-medium">Generate Invoice</h3>
            <p className="text-sm text-gray-500">Create an invoice for your records</p>
            </div>
        </CardContent>
        </Card>

      <Card 
        className="hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => navigate('/generate-ewaybill')}
      >
        <CardContent className="p-6 flex items-center gap-4">
          📜
          <div className="flex-1">
            <h3 className="font-medium">Generate E-Way Bill</h3>
            <p className="text-sm text-gray-500">Create an e-way bill for transport</p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex justify-between p-4">
          <NavItem icon={<Home className="w-5 h-5" />} label="Home" onClick={() => navigate('/')} active={location.pathname === '/'} />
          <NavItem icon={<Receipt className="w-5 h-5" />} label="File" onClick={() => navigate('/file')} active={location.pathname === '/file'} />
          <NavItem icon={<Upload className="w-5 h-5" />} label="Upload" onClick={() => navigate('/upload')} active={location.pathname === '/upload'} />
          <NavItem icon={<FileText className="w-5 h-5" />} label="Invoice" onClick={() => navigate('/invoice')} active={location.pathname === '/invoice'} />
        </div>
      </div>
    </div>
  );
};

// Navigation Button Component
const NavItem = ({ icon, label, onClick, active }) => (
  <button 
    className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-600'}`} 
    onClick={onClick}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default Invoice;
