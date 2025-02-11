import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ArrowRight, User, Mail, Building, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

const AnimatedForm = ({ children, isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isVisible ? 100 : -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isLogin) {
        const response = await loginUser({
          email: data.email,
          password: data.password,
        });
        
        login(response.user, response.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        const response = await registerUser({
          email: data.email,
          password: data.password,
          companyName: data.companyName,
          gstin: data.gstin,
        });
        
        setSuccess('Registration successful! Please login.');
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left Panel - Image/Info */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:w-2/5 flex flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold mb-6">Tax Filing Made Easy</h2>
            <p className="mb-4 opacity-90">Streamline your tax compliance with our intelligent platform.</p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Automated GST Filing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Smart Document Processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>24/7 Expert Support</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-8 inline-flex items-center text-sm hover:underline"
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:w-3/5">
          <AnimatedForm isVisible={isLogin}>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-6">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company Name</label>
                      <div className="relative">
                        <Building className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="companyName"
                          required
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">GSTIN</label>
                      <div className="relative">
                        <FileText className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="gstin"
                          required
                          pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter GSTIN"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {isLogin && (
  <p className="text-center mt-4">
    <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
      Forgot your password?
    </Link>
  </p>
)}
              </form>
            </div>
          </AnimatedForm>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;