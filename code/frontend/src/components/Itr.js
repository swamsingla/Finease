import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ITR = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "periodFrom" || name === "periodTo") {
      setFormData({
        ...formData,
        period: {
          ...formData.period,
          [name === "periodFrom" ? "from" : "to"]: value,
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
          className="w-full bg-purple-500 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ITR;