import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EPF = () => {
  const navigate = useNavigate();

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
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
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