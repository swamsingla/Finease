import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const EPF = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    trrnNo: "",
    establishmentId: "",
    establishmentName: "",
    wageMonth: "",
    member: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractionStatus, setExtractionStatus] = useState("");

  // Handle incoming file from Scan.js
  useEffect(() => {
    // Check if we have a file URL from the Scan page
    if (location.state?.file) {
      setExtractionStatus("Starting data extraction...");
      extractDataFromDocument(location.state.file);
    }
  }, [location.state]);

  // Function to extract data from EPF document using Nanonets API
  const extractDataFromDocument = async (fileUrl) => {
    setExtractionStatus("Extracting data from EPF document...");
    setLoading(true);

    try {
      // Convert fileUrl to a File object
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], "epf_document.png", { type: blob.type });

      // Prepare form data for Nanonets API
      const formData = new FormData();
      formData.append('file', file);

      // Call Nanonets API - REPLACE WITH YOUR ACTUAL MODEL ID AND API KEY
      const apiKey = "5aa26d66-fb76-11ef-a113-263262c841b0"; // Replace this
      const modelId = "3329200a-1e45-4c4b-93ea-a8efa65dc32e"; // Replace this

      const result = await axios.post(
        `https://app.nanonets.com/api/v2/OCR/Model/${modelId}/LabelFile/`,
        formData,
        {
          headers: {
            'Authorization': 'Basic ' + btoa(`${apiKey}:`),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Process the extracted data
      if (result.data && result.data.result) {
        const extractedData = processNanonetsResponse(result.data);
        setFormData(prevData => ({
          ...prevData,
          ...extractedData
        }));
        setExtractionStatus("✅ Data extracted successfully!");
      } else {
        setError("Could not extract data from the EPF document");
        setExtractionStatus("❌ Extraction failed");
      }
    } catch (error) {
      console.error("Error extracting data:", error);

      // Improved error handling to provide more specific feedback
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError("Authentication failed. Please check your Nanonets API key.");
        } else {
          setError(`Server responded with status: ${error.response.status}. Please check your configuration.`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response received from Nanonets API. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error preparing request: ${error.message}. Please fill the form manually.`);
      }

      setExtractionStatus("❌ Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  // Process Nanonets API response to extract relevant EPF information
  const processNanonetsResponse = (data) => {
    try {
      // The structure depends on your Nanonets model configuration
      // This is a general example - adjust according to your specific model
      const predictions = data.result[0].prediction;

      // Extract fields from predictions
      const extractedData = {
        email: predictions.find(p => p.label === "email")?.ocr_text || "",
        trrnNo: predictions.find(p => p.label === "trrn_no")?.ocr_text || "",
        establishmentId: predictions.find(p => p.label === "establishment_id")?.ocr_text || "",
        establishmentName: predictions.find(p => p.label === "establishment_name")?.ocr_text || "",
        wageMonth: formatWageMonth(predictions.find(p => p.label === "wage_month")?.ocr_text || ""),
        member: predictions.find(p => p.label === "member")?.ocr_text || "",
        totalAmount: predictions.find(p => p.label === "total_amount")?.ocr_text || ""
      };

      // Clean numeric values
      extractedData.member = cleanNumericValue(extractedData.member);
      extractedData.totalAmount = cleanNumericValue(extractedData.totalAmount);
      
      // Clean email value if needed
      extractedData.email = cleanEmailValue(extractedData.email);

      return extractedData;
    } catch (error) {
      console.error("Error processing extracted data:", error);
      return {};
    }
  };

  // Helper function to format wage month string
  const formatWageMonth = (monthStr) => {
    if (!monthStr) return "";

    try {
      // Try to parse various month formats
      // Common format: "April 2023" or "Apr-2023"
      monthStr = monthStr.trim();
      
      // If it's already in a good format, return as is
      if (/^[A-Za-z]+ [0-9]{4}$/.test(monthStr) || /^[A-Za-z]+-[0-9]{4}$/.test(monthStr)) {
        return monthStr;
      }
      
      // If it's a date format like "01/04/2023", try to convert to "April 2023"
      const dateParts = monthStr.split(/[/.-]/);
      if (dateParts.length === 3) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Try to determine month position based on common formats
        let month, year;
        
        // Assuming DD/MM/YYYY format for Indian documents
        month = parseInt(dateParts[1], 10) - 1; // 0-indexed in JS
        year = parseInt(dateParts[2], 10);
        
        if (month >= 0 && month < 12 && year > 2000) {
          return `${monthNames[month]} ${year}`;
        }
      }
    } catch (error) {
      console.error("Error formatting wage month:", error);
    }

    return monthStr; // Return original if parsing fails
  };

  // Helper function to clean numeric values
  const cleanNumericValue = (value) => {
    if (!value) return "";

    // Remove currency symbols, commas, and other non-numeric characters
    return value.replace(/[^\d.-]/g, '');
  };

  // Helper function to clean email values
  const cleanEmailValue = (value) => {
    console.log("Raw email value:", value);
    if (!value) return "";
    
    // Remove spaces and common OCR errors in emails
    let cleanedValue = value.trim().replace(/\s+/g, "");
    
    // Replace common OCR errors
    cleanedValue = cleanedValue
      .replace(/[oO]0/g, "o") // Replace o0 with o
      .replace(/1l|l1/g, "l")  // Replace 1l or l1 with l
      .replace(/\[]/g, "i")    // Replace [] with i
      
    console.log("Cleaned email value:", cleanedValue);
    
    // More relaxed email validation - just check for @ symbol
    if (cleanedValue.includes("@")) {
      return cleanedValue;
    }
    
    return value; // Return original if no @ found
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send the form data to the backend
      await axios.post("http://localhost:5000/api/epf", formData);
      alert("EPF data submitted successfully!");
      navigate("/"); // Navigate back to home or another page
    } catch (error) {
      console.error("Error submitting EPF data:", error);
      setError("Failed to submit EPF data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <h2 className="text-2xl font-bold mb-4">EPF Filing</h2>

      {extractionStatus && (
        <div className={`mb-4 p-3 rounded ${extractionStatus.includes("failed") || extractionStatus.includes("❌") ? "bg-red-100 text-red-700" : extractionStatus.includes("Starting") ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
          {extractionStatus}
        </div>
      )}

      {/* Form to collect EPF data */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">TRRN Number</label>
          <input
            type="text"
            name="trrnNo"
            value={formData.trrnNo}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Establishment ID</label>
          <input
            type="text"
            name="establishmentId"
            value={formData.establishmentId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Establishment Name</label>
          <input
            type="text"
            name="establishmentName"
            value={formData.establishmentName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Wage Month</label>
          <input
            type="text"
            name="wageMonth"
            value={formData.wageMonth}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Members</label>
          <input
            type="number"
            name="member"
            value={formData.member}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-2"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* Back to Home Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
        >
          Back to Home
        </button>
      </form>
    </div>
  );
};

export default EPF;