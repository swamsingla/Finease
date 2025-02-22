import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@mui/material';
import { Camera, Upload, Home, Receipt, FileText } from 'lucide-react';

const ScanUploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [fileURL, setFileURL] = useState(null);
  const [isPDF, setIsPDF] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);
      setIsPDF(file.type === "application/pdf");

      // Redirect to scan page and pass file as state
      navigate('/scan', { state: { file } });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-4 pb-20">
      <h2 className="text-xl font-semibold text-center mb-4">Scan or Upload</h2>
      
      {/* Scan Document */}
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer mb-4" onClick={() => navigate('/scan')}> 
        <CardContent className="p-6 flex items-center gap-4">
          <Camera className="w-6 h-6 text-gray-600" />
          <div className="flex-1">
            <h3 className="font-medium">Scan Document</h3>
            <p className="text-sm text-gray-500">Use your camera to scan a document</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Upload Files */}
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer mb-4" onClick={() => fileInputRef.current.click()}>
        <CardContent className="p-6 flex items-center gap-4">
          <Upload className="w-6 h-6 text-gray-600" />
          <div className="flex-1">
            <h3 className="font-medium">Upload files</h3>
            <p className="text-sm text-gray-500">Upload files from your device</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Display Uploaded File */}
        {fileURL && (
          <div className="mt-4 border rounded-lg p-2 shadow-md">
            {isPDF ? (
              <iframe 
                src={fileURL} 
                width="100%" 
                height="400px" 
                className="rounded-md"
                title="Uploaded PDF"
              />
            ) : (
              <img src={fileURL} alt="Uploaded file" className="w-full h-auto rounded-md" />
            )}
          </div>
        )}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex justify-between p-4">
          <NavItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            onClick={() => navigate('/')} 
            active={location.pathname === '/'} 
          />
          <NavItem 
            icon={<Receipt className="w-5 h-5" />} 
            label="File" 
            onClick={() => navigate('/file')} 
            active={location.pathname === '/file'} 
          />
          <NavItem 
            icon={<Upload className="w-5 h-5" />} 
            label="Upload" 
            onClick={() => navigate('/upload')} 
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
    </div>
  );
};

const NavItem = ({ icon, label, onClick, active }) => (
  <button 
    className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-600'}`} 
    onClick={onClick}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default ScanUploadPage;
