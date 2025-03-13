import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { Home, Receipt, Upload, FileText } from "lucide-react";

const NavItem = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center text-sm ${active ? "text-blue-500" : "text-gray-700"
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Scan = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [capturedFile, setCapturedFile] = useState(null);
  const [isPDF, setIsPDF] = useState(false);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [uploadedFromGallery, setUploadedFromGallery] = useState(false);

  // Determine if this is an upload mode (came from ScanUpload page)
  useEffect(() => {
    if (location.state?.file) {
      setCameraEnabled(false);
      setUploadedFromGallery(true);
      handleFile(location.state.file);
    }
  }, [location.state]);
  
  // Handle webcam cleanup on component unmount
  useEffect(() => {
    return () => {
      // Stop the webcam when component unmounts
      if (webcamRef.current && webcamRef.current.stream) {
        const tracks = webcamRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleFile = useCallback((file) => {
    const url = URL.createObjectURL(file);
    setCapturedFile(url);
    setIsPDF(file.type === "application/pdf");
    classifyDocument(file);
  }, []);

  const capture = () => {
    if (webcamRef.current && webcamRef.current.getScreenshot) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const file = dataURLtoFile(imageSrc, "scanned_document.png");
        handleFile(file);
      } else {
        console.error("Failed to capture screenshot");
        alert("Camera access issue. Please reload the page and allow camera access.");
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFromGallery(true);
      handleFile(file);
    }
  };

  const classifyDocument = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setClassification(data.classification);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to classify document. Please try again.");
    }
    setLoading(false);
  };

  function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Reset state to clear current capture and return to camera mode
  const resetCapture = () => {
    setCapturedFile(null);
    setClassification(null);
    setUploadedFromGallery(false);
    setCameraEnabled(true);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white text-black p-4 pb-24">
      <h2 className="text-2xl font-bold mb-4">
        {uploadedFromGallery ? "Document Preview" : "Scan or Upload Document"}
      </h2>

      <div className="relative w-80 h-96 border-4 border-gray-400 rounded-lg overflow-hidden shadow-lg">
        {capturedFile ? (
          <>
            {isPDF ? (
              <iframe
                src={capturedFile}
                width="100%"
                height="100%"
                className="rounded-md"
                title="Scanned Document Preview"
              />
            ) : (
              <img
                src={capturedFile}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
            {/* Add a reset button to clear capture and return to camera */}
            {!uploadedFromGallery && (
              <button 
                onClick={resetCapture}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 text-xs"
              >
                Back to Camera
              </button>
            )}
          </>
        ) : cameraEnabled ? (
          <div className="relative w-full h-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 320,
                height: 380,
                facingMode: "environment" // Use rear camera if available
              }}
            />
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-full h-2 bg-blue-500 opacity-70" />
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-500">Camera disabled. Upload a document instead.</p>
          </div>
        )}
      </div>

      {loading && <p className="mt-4 text-blue-500 animate-pulse">Classifying document...</p>}

      {/* Show classification and extracted date */}
      {classification && (
        <div className="mt-4 text-center">
          <p className="text-lg">📄 Document Type: <b>{classification}</b></p>
          
          {classification === "PF Filing" && (
            <button
              onClick={() => navigate("/epf", { state: { file: capturedFile } })}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Proceed to EPF Filing
            </button>
          )}

          {classification === "GST Filing" && (
            <button
              onClick={() => navigate("/gst", { state: { file: capturedFile } })}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Proceed to GST Filing
            </button>
          )}

          {classification === "ITR Filing" && (
            <button
              onClick={() => navigate("/itr", { state: { file: capturedFile } })}
              className="mt-4 bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
            >
              Proceed to ITR Filing
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center w-full max-w-md mt-6 mb-24">
        <label className="text-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer">
          📂 Documents
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Only show capture button if not in upload mode */}
        {!uploadedFromGallery && cameraEnabled && !capturedFile && (
          <button
            onClick={capture}
            className="bg-red-600 hover:bg-red-800 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-300"
          >
            📸 Capture
          </button>
        )}

        <label className="text-center bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md cursor-pointer">
          🖼 Gallery
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto flex justify-between p-4">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Home"
            onClick={() => navigate("/")}
            active={location.pathname === "/"}
          />
          <NavItem
            icon={<Receipt className="w-5 h-5" />}
            label="File"
            onClick={() => navigate("/file")}
            active={location.pathname === "/file"}
          />
          <NavItem
            icon={<Upload className="w-5 h-5" />}
            label="Upload"
            onClick={() => navigate("/upload")}
            active={location.pathname === "/upload"}
          />
          <NavItem
            icon={<FileText className="w-5 h-5" />}
            label="Invoice"
            onClick={() => navigate("/invoice")}
            active={location.pathname === "/invoice"}
          />
        </div>
      </div>
    </div>
  );
};

export default Scan;