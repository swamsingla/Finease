import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ITR = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    panNo: "",
    tan: "",
    addressEmployee: "",
    addressEmployer: "",
    period: {
      from: "",
      to: "",
    },
    grossTotalIncome: "",
    grossTaxableIncome: "",
    netTaxPayable: "",
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

  // Function to extract data from ITR document using Nanonets API
  const extractDataFromDocument = async (fileUrl) => {
    setExtractionStatus("Extracting data from ITR document...");
    setLoading(true);

    try {
      // Convert fileUrl to a File object
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], "itr_document.png", { type: blob.type });

      // Prepare form data for Nanonets API
      const formData = new FormData();
      formData.append('file', file);

      // Call Nanonets API - REPLACE WITH YOUR ACTUAL MODEL ID AND API KEY
      const apiKey = "5aa26d66-fb76-11ef-a113-263262c841b0"; // Replace this
      const modelId = "13bad529-fff3-4bb9-898b-8fe0f57cbfe1"; // Replace this - use appropriate model for ITR

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
        setError("Could not extract data from the ITR document");
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

  // Process Nanonets API response to extract relevant ITR information
  const processNanonetsResponse = (data) => {
    try {
      // The structure depends on your Nanonets model configuration
      // This is adapted for ITR documents - adjust according to your specific model
      const predictions = data.result[0].prediction;

      // Extract fields from predictions - update field names based on your model
      const extractedData = {
        email: predictions.find(p => p.label === "email")?.ocr_text || "",
        panNo: predictions.find(p => p.label === "pan_no")?.ocr_text || "",
        tan: predictions.find(p => p.label === "tan")?.ocr_text || "",
        addressEmployee: predictions.find(p => p.label === "address_employee")?.ocr_text || "",
        addressEmployer: predictions.find(p => p.label === "address_employer")?.ocr_text || "",
        grossTotalIncome: predictions.find(p => p.label === "gross_total_income")?.ocr_text || "",
        grossTaxableIncome: predictions.find(p => p.label === "gross_taxable_income")?.ocr_text || "",
        netTaxPayable: predictions.find(p => p.label === "net_tax_payable")?.ocr_text || ""
      };

      // Handle period dates
      const periodFrom = predictions.find(p => p.label === "period_from")?.ocr_text || "";
      const periodTo = predictions.find(p => p.label === "period_to")?.ocr_text || "";

      extractedData.period = {
        from: formatDateString(periodFrom),
        to: formatDateString(periodTo)
      };

      // Clean numeric values
      extractedData.grossTotalIncome = cleanNumericValue(extractedData.grossTotalIncome);
      extractedData.grossTaxableIncome = cleanNumericValue(extractedData.grossTaxableIncome);
      extractedData.netTaxPayable = cleanNumericValue(extractedData.netTaxPayable);
      
      // Clean email value if needed
      extractedData.email = cleanEmailValue(extractedData.email);
      
      // Clean PAN and TAN values
      extractedData.panNo = cleanPanValue(extractedData.panNo);
      extractedData.tan = cleanTanValue(extractedData.tan);

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
    if (!value) return "";
    
    // Remove spaces and common OCR errors in emails
    let cleanedValue = value.trim().replace(/\s+/g, "");
    
    // Replace common OCR errors
    cleanedValue = cleanedValue
      .replace(/[oO]0/g, "o") // Replace o0 with o
      .replace(/1l|l1/g, "l")  // Replace 1l or l1 with l
      .replace(/\[]/g, "i")    // Replace [] with i
      
    // More relaxed email validation - just check for @ symbol
    if (cleanedValue.includes("@")) {
      return cleanedValue;
    }
    
    return value; // Return original if no @ found
  };

  // Helper function to clean PAN values
  const cleanPanValue = (value) => {
    if (!value) return "";
    
    // Remove spaces and make uppercase
    let cleanedValue = value.trim().replace(/\s+/g, "").toUpperCase();
    
    // PAN format validation: AAAAA0000A (5 letters + 4 digits + 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    
    if (panRegex.test(cleanedValue)) {
      return cleanedValue;
    }
    
    // Try to fix common OCR errors in PAN
    cleanedValue = cleanedValue
      .replace(/0/g, "O") // Replace 0 with O at letter positions
      .replace(/1/g, "I") // Replace 1 with I at letter positions
      .replace(/8/g, "B") // Replace 8 with B at letter positions
      
    return cleanedValue;
  };

  // Helper function to clean TAN values
  const cleanTanValue = (value) => {
    if (!value) return "";
    
    // Remove spaces and make uppercase
    let cleanedValue = value.trim().replace(/\s+/g, "").toUpperCase();
    
    // TAN format validation: AAAA00000A (4 letters + 5 digits + 1 letter)
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
    
    if (tanRegex.test(cleanedValue)) {
      return cleanedValue;
    }
    
    // Try to fix common OCR errors in TAN
    cleanedValue = cleanedValue
      .replace(/0/g, "O") // Replace 0 with O at letter positions
      .replace(/1/g, "I") // Replace 1 with I at letter positions
      .replace(/8/g, "B") // Replace 8 with B at letter positions
      
    return cleanedValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "periodFrom") {
      setFormData({
        ...formData,
        period: {
          ...formData.period,
          from: value,
        },
      });
    } else if (name === "periodTo") {
      setFormData({
        ...formData,
        period: {
          ...formData.period,
          to: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send the form data to the backend
      await axios.post("http://localhost:5000/api/itr", formData);
      alert("ITR data submitted successfully!");
      navigate("/"); // Navigate back to home or another page
    } catch (error) {
      console.error("Error submitting ITR data:", error);
      setError("Failed to submit ITR data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <h2 className="text-2xl font-bold mb-4">ITR Filing</h2>

      {extractionStatus && (
        <div className={`mb-4 p-3 rounded ${extractionStatus.includes("failed") || extractionStatus.includes("❌") ? "bg-red-100 text-red-700" : extractionStatus.includes("Starting") ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
          {extractionStatus}
        </div>
      )}

      {/* Form to collect ITR data */}
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
          <label className="block text-gray-700">PAN Number</label>
          <input
            type="text"
            name="panNo"
            value={formData.panNo}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">TAN</label>
          <input
            type="text"
            name="tan"
            value={formData.tan}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Employee Address</label>
          <input
            type="text"
            name="addressEmployee"
            value={formData.addressEmployee}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Employer Address</label>
          <input
            type="text"
            name="addressEmployer"
            value={formData.addressEmployer}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Period From</label>
          <input
            type="date"
            name="periodFrom"
            value={formData.period.from}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Period To</label>
          <input
            type="date"
            name="periodTo"
            value={formData.period.to}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Gross Total Income</label>
          <input
            type="number"
            name="grossTotalIncome"
            value={formData.grossTotalIncome}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Gross Taxable Income</label>
          <input
            type="number"
            name="grossTaxableIncome"
            value={formData.grossTaxableIncome}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Net Tax Payable</label>
          <input
            type="number"
            name="netTaxPayable"
            value={formData.netTaxPayable}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded-md mb-2"
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

export default ITR;