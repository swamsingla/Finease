import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EditProfile = () => {
  const { user, login } = useAuth(); // reuse "login" to update the context
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    gstin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill the form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        companyName: user.companyName || '',
        gstin: user.gstin || '',
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission (API call included here)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token'); // assuming token is stored at login
      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Update failed');
      }
      const data = await response.json();
      // Update AuthContext and localStorage with the new user data
      login(data.user, token);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2 className="edit-profile-header">Edit Profile</h2>
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Email Field */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your email"
          />
        </div>
        {/* Company Name Field */}
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter company name"
          />
        </div>
        {/* GSTIN Field */}
        <div className="form-group">
          <label className="form-label">GSTIN</label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
            className="form-input"
            placeholder="Enter GSTIN"
          />
        </div>
        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className={`form-button ${loading ? 'button-disabled' : ''}`}
        >
          {loading ? 'Saving...' : 'Save New Profile'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
