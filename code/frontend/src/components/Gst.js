import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const GST = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    gstin: "",
    ctin: "", // Added CTIN field
    invoiceDate: "",
    placeOfSupply: "",
    address: "",
    cgst: "",
    sgst: "",
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
      extractDataFromInvoice(location.state.file);
    }
  }, [location.state]);

  // Function to extract data from invoice using Nanonets API
  const extractDataFromInvoice = async (fileUrl) => {
    setExtractionStatus("Extracting data from invoice...");
    setLoading(true);

    try {
      // Convert fileUrl to a File object
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], "invoice.png", { type: blob.type });

      // Prepare form data for Nanonets API
      const formData = new FormData();
      formData.append('file', file);
      // add a print statement for file here
      console.log("File to be sent to Nanonets:", file);

      // Call Nanonets API - REPLACE WITH YOUR ACTUAL MODEL ID AND API KEY
      const apiKey = "5aa26d66-fb76-11ef-a113-263262c841b0"; // Replace this
      const modelId = "ed880aeb-7171-4658-b4d0-cb8011604541"; // Replace this

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
        setError("Could not extract data from the invoice");
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

  // Process Nanonets API response to extract relevant GST information
  const processNanonetsResponse = (data) => {
    try {
      // The structure depends on your Nanonets model configuration
      // This is a general example - adjust according to your specific model
      const predictions = data.result[0].prediction;

      // Extract fields from predictions
      const extractedData = {
        email: predictions.find(p => p.label === "email")?.ocr_text || "",
        gstin: predictions.find(p => p.label === "gstin")?.ocr_text || "",
        ctin: predictions.find(p => p.label === "ctin")?.ocr_text || "", // Added CTIN extraction
        invoiceDate: formatDateString(predictions.find(p => p.label === "invoice_date")?.ocr_text || ""),
        placeOfSupply: predictions.find(p => p.label === "place_of_supply")?.ocr_text || "",
        address: predictions.find(p => p.label === "address")?.ocr_text || "",
        cgst: predictions.find(p => p.label === "cgst_amount")?.ocr_text || "",
        sgst: predictions.find(p => p.label === "sgst_amount")?.ocr_text || "",
        totalAmount: predictions.find(p => p.label === "total_amount")?.ocr_text || ""
      };

      // Clean numeric values
      extractedData.cgst = cleanNumericValue(extractedData.cgst);
      extractedData.sgst = cleanNumericValue(extractedData.sgst);
      extractedData.totalAmount = cleanNumericValue(extractedData.totalAmount);
      
      // Clean email value if needed
      extractedData.email = cleanEmailValue(extractedData.email);

      return extractedData;
    } catch (error) {
      console.error("Error processing extracted data:", error);
      return {};
    }
  };

  // Helper function to format date string to YYYY-MM-DD for input[type="date"]
  const formatDateString = (dateStr) => {
    if (!dateStr) return "";

    try {
      // Try to parse various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }

      // If standard parsing fails, try to handle common Indian date formats (DD/MM/YYYY)
      const parts = dateStr.split(/[/.-]/);
      if (parts.length === 3) {
        // Assuming DD/MM/YYYY or similar format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
        const year = parseInt(parts[2], 10);

        // Add 2000 if the year is a 2-digit number
        const fullYear = year < 100 ? year + 2000 : year;

        const parsedDate = new Date(fullYear, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }

    return dateStr; // Return original if parsing fails
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
      console.log("Submitting form data:", formData);
      await axios.post("http://localhost:5000/api/gst", formData);
      alert("GST data submitted successfully!");
      navigate("/"); // Navigate back to home or another page
    } catch (error) {
      console.error("Error submitting GST data:", error);
      setError("Failed to submit GST data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <h2 className="text-2xl font-bold mb-4">GST Filing</h2>

      {extractionStatus && (
        <div className={`mb-4 p-3 rounded ${extractionStatus.includes("failed") || extractionStatus.includes("❌") ? "bg-red-100 text-red-700" : extractionStatus.includes("Starting") ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
          {extractionStatus}
        </div>
      )}

      {/* Form to collect GST data */}
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
          <label className="block text-gray-700">GSTIN</label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">CTIN</label>
          <input
            type="text"
            name="ctin"
            value={formData.ctin}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Invoice Date</label>
          <input
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Place of Supply</label>
          <input
            type="text"
            name="placeOfSupply"
            value={formData.placeOfSupply}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">CGST</label>
          <input
            type="number"
            name="cgst"
            value={formData.cgst}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">SGST</label>
          <input
            type="number"
            name="sgst"
            value={formData.sgst}
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
          className="w-full bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md mb-2"
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

export default GST;
