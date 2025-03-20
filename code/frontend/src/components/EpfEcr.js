import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import axios from "axios";

const EpfEcr = () => {
  const navigate = useNavigate();
  
  const [batches, setBatches] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(null);
  const { user, logout } = useAuth();

  // New batch form data
  const [newBatchForm, setNewBatchForm] = useState({
    establishmentId: "",
    establishmentName: "",
    wageMonth: ""
  });

  // Fetch batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch batches for current user
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const email = user?.email;

      if (!email) {
        throw new Error("User email not found. Please log in again.");
      }

      const response = await axios.get(`http://localhost:5000/api/epf/batches?email=${email}`);
      
      if (response.data.success) {
        setBatches(response.data.batches);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      setError("Failed to fetch EPF batches");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for a specific batch
  const fetchBatchEmployees = async (batchId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/epf/batch/${batchId}`);
      
      if (response.data.success) {
        setCurrentBatch(response.data.batch);
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error("Error fetching batch employees:", error);
      setError("Failed to fetch batch employees");
    } finally {
      setLoading(false);
    }
  };

  // Handle new batch form submission
  const handleNewBatchSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    
    try {
      const email = user?.email;
      
      if (!email) {
        throw new Error("User email not found. Please log in again.");
      }
      
      const response = await axios.post("http://localhost:5000/api/epf/batch", {
        ...newBatchForm,
        email
      });
      
      if (response.data.success) {
        setSuccess("Batch created successfully!");
        setNewBatchForm({
          establishmentId: "",
          establishmentName: "",
          wageMonth: ""
        });
        await fetchBatches();
        setCurrentBatch(null);
        // Set employees to empty array for new batch
        setEmployees([]);
        // Select the newly created batch
        fetchBatchEmployees(response.data.batchId);
      }
    } catch (error) {
      console.error("Error creating batch:", error);
      setError(error.response?.data?.error || error.message || "Failed to create batch");
    } finally {
      setCreating(false);
    }
  };

  // Open employee form
  const openEmployeeForm = (employee = null, index = null) => {
    setCurrentEmployee(employee || {
      uan: "",
      name: "",
      grossWages: 0,
      epfWages: 0,
      epsWages: 0,
      edliWages: 0,
      ncpDays: 0,
      refundOfAdvances: 0,
      epfContribution: 0,
      epsContribution: 0,
      epfEpsDifference: 0
    });
    setCurrentEmployeeIndex(index);
    setShowEmployeeForm(true);
  };

    // Save employees to batch
  const saveEmployees = async () => {
    if (!currentBatch) {
      setError("Please select or create a batch first");
      return;
    }
    
    if (employees.length === 0) {
      setError("Please add at least one employee");
      return;
    }
    
    setLoading(true);
    try {
      const email = user?.email;
      
      if (!email) {
        throw new Error("User email not found. Please log in again.");
      }
      
      // Validate all employees before sending to server
      const validatedEmployees = employees.map(emp => {
        const validEmp = { ...emp, email };
        
        // Ensure all numeric fields are valid numbers
        ['grossWages', 'epfWages', 'epsWages', 'edliWages', 
         'ncpDays', 'refundOfAdvances', 'epfContribution', 
         'epsContribution', 'epfEpsDifference'].forEach(field => {
          validEmp[field] = Number(validEmp[field]) || 0;
        });
        
        // Recalculate to ensure consistency
        validEmp.epfContribution = Math.round(validEmp.epfWages * 0.12);
        validEmp.epsContribution = Math.round(Math.min(validEmp.epsWages, 15000) * 0.0833);
        validEmp.epfEpsDifference = validEmp.epfContribution - validEmp.epsContribution;
        
        return validEmp;
      });
      
      const response = await axios.post("http://localhost:5000/api/epf/employees", {
        batchId: currentBatch._id,
        employees: validatedEmployees
      });
      
      if (response.data.success) {
        setSuccess("Employees saved successfully!");
        // Refresh batch data to reflect new totals
        fetchBatchEmployees(currentBatch._id);
      }
    } catch (error) {
      console.error("Error saving employees:", error);
      setError(error.response?.data?.error || error.message || "Failed to save employees");
    } finally {
      setLoading(false);
    }
  };

    // Add a new employee row
  const addEmployeeRow = () => {
    // Open the employee form with default values
    openEmployeeForm();
  };

    // Remove an employee row
    const removeEmployeeRow = async (index) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
        setLoading(true);
        try {
        const employeeToRemove = employees[index];
        
        // Only make API call if the employee has an ID (already saved in database)
        if (employeeToRemove._id && currentBatch) {
            await axios.delete(`http://localhost:5000/api/epf/employee/${employeeToRemove._id}?batchId=${currentBatch._id}`);
        }
        
        // Update local state
        const updatedEmployees = [...employees];
        updatedEmployees.splice(index, 1);
        setEmployees(updatedEmployees);
        
        setSuccess("Employee removed successfully");
        
        // Refresh batch data to update totals if employee was already saved
        if (employeeToRemove._id && currentBatch) {
            await fetchBatchEmployees(currentBatch._id);
        }
        } catch (error) {
        console.error("Error removing employee:", error);
        setError(error.response?.data?.error || error.message || "Failed to remove employee");
        } finally {
        setLoading(false);
        }
    }
    };

    // Handle field changes in the form
  const handleEmployeeFormChange = (field, value) => {
    const updatedEmployee = { ...currentEmployee };
    updatedEmployee[field] = value;
    
    // Auto calculations
    if (['epfWages', 'epsWages'].includes(field)) {
      // Ensure values are valid numbers
      const epfWages = Number(updatedEmployee.epfWages) || 0;
      const epsWages = Number(updatedEmployee.epsWages) || 0;
      
      // Calculate EPF contribution (12% of EPF wages)
      const epfContribution = Math.round(epfWages * 0.12);
      updatedEmployee.epfContribution = epfContribution;
      
      // If epsWages was not explicitly set but epfWages was updated
      if (field === 'epfWages' && !updatedEmployee.epsWages) {
        // Default epsWages to epfWages (capped at 15000)
        updatedEmployee.epsWages = Math.min(epfWages, 15000);
      }
      
      // Calculate EPS contribution (8.33% of EPS wages)
      const epsContribution = Math.round(Math.min(epsWages, 15000) * 0.0833);
      updatedEmployee.epsContribution = epsContribution;
      
      // Calculate EPF-EPS difference
      updatedEmployee.epfEpsDifference = epfContribution - epsContribution;
    }
    
    // If edliWages not set but epfWages is updated
    if (field === 'epfWages' && !updatedEmployee.edliWages) {
      updatedEmployee.edliWages = Number(value) || 0;
    }
    
    setCurrentEmployee(updatedEmployee);
  };

  // Handle form submission
  const handleEmployeeFormSubmit = () => {
    // Validate required fields and ensure all numbers are valid
    if (!currentEmployee.uan || !currentEmployee.uan.trim()) {
      setError("UAN is required");
      return;
    }
    
    if (!currentEmployee.name || !currentEmployee.name.trim()) {
      setError("Employee name is required");
      return;
    }
    
    // Ensure all numeric fields are valid numbers (not NaN)
    const numericFields = [
      'grossWages', 'epfWages', 'epsWages', 'edliWages', 
      'ncpDays', 'refundOfAdvances', 'epfContribution', 
      'epsContribution', 'epfEpsDifference'
    ];
    
    const validatedEmployee = { ...currentEmployee };
    
    numericFields.forEach(field => {
      // Convert to number and default to 0 if NaN
      validatedEmployee[field] = Number(validatedEmployee[field]) || 0;
    });
    
    // Re-calculate contributions to ensure they're correct
    validatedEmployee.epfContribution = Math.round(validatedEmployee.epfWages * 0.12);
    validatedEmployee.epsContribution = Math.round(Math.min(validatedEmployee.epsWages, 15000) * 0.0833);
    validatedEmployee.epfEpsDifference = validatedEmployee.epfContribution - validatedEmployee.epsContribution;
    
    if (currentEmployeeIndex !== null) {
      // Update existing employee
      const updatedEmployees = [...employees];
      updatedEmployees[currentEmployeeIndex] = validatedEmployee;
      setEmployees(updatedEmployees);
    } else {
      // Add new employee
      setEmployees([...employees, validatedEmployee]);
    }
    
    setShowEmployeeForm(false);
    setError(""); // Clear any errors
  };

  // Generate ECR file
  const generateECR = async () => {
    if (!currentBatch) {
      setError("Please select a batch first");
      return;
    }
    
    if (employees.length === 0) {
      setError("No employees found in this batch");
      return;
    }
    
    try {
      // First save any unsaved changes
      await saveEmployees();
      
      // Trigger file download
      window.location.href = `http://localhost:5000/api/epf/generate-ecr/${currentBatch._id}`;
      
      setSuccess("ECR file generated successfully!");
    } catch (error) {
      console.error("Error generating ECR:", error);
      setError("Failed to generate ECR file");
    }
  };

  // Handle batch form input changes
  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setNewBatchForm({
      ...newBatchForm,
      [name]: value
    });
  };

  // Select a batch
  const selectBatch = (batchId) => {
    fetchBatchEmployees(batchId);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-black p-4">
      <h2 className="text-2xl font-bold mb-4">EPF ECR Generation</h2>
      
      {error && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="w-full max-w-4xl mb-6">
        <div className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">Create New Batch</h3>
          <form onSubmit={handleNewBatchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Establishment ID</label>
                <input
                  type="text"
                  name="establishmentId"
                  value={newBatchForm.establishmentId}
                  onChange={handleBatchFormChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                  placeholder="e.g., MHBAN0012345678"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Establishment Name</label>
                <input
                  type="text"
                  name="establishmentName"
                  value={newBatchForm.establishmentName}
                  onChange={handleBatchFormChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                  placeholder="e.g., ABC Technologies Private Limited"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Wage Month</label>
                <input
                  type="text"
                  name="wageMonth"
                  value={newBatchForm.wageMonth}
                  onChange={handleBatchFormChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                  placeholder="e.g., Mar 2025"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Batch"}
            </button>
          </form>
        </div>
        
        <div className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">Select Existing Batch</h3>
          {loading && <p>Loading batches...</p>}
          {!loading && batches.length === 0 && <p>No batches found. Create one above.</p>}
          {!loading && batches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Establishment ID</th>
                    <th className="py-2 px-4 border-b text-left">Establishment Name</th>
                    <th className="py-2 px-4 border-b text-left">Wage Month</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch._id} className={currentBatch && currentBatch._id === batch._id ? "bg-blue-50" : ""}>
                      <td className="py-2 px-4 border-b">{batch.establishmentId}</td>
                      <td className="py-2 px-4 border-b">{batch.establishmentName}</td>
                      <td className="py-2 px-4 border-b">{batch.wageMonth}</td>
                      <td className="py-2 px-4 border-b">{batch.status}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => selectBatch(batch._id)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {currentBatch && (
        <div className="w-full max-w-4xl">
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">
              Batch: {currentBatch.establishmentName} - {currentBatch.wageMonth}
            </h3>
             
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="block text-gray-500 text-sm">Total Employees</span>
                <span className="font-semibold">{currentBatch.totalEmployees || 0}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Total EPF Wages</span>
                <span className="font-semibold">₹{(currentBatch.totalEpfWages || 0)}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Total EPF Contribution</span>
                <span className="font-semibold">₹{(currentBatch.totalEpfContribution || 0)}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Total EPS Contribution</span>
                <span className="font-semibold">₹{(currentBatch.totalEpsContribution || 0)}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={addEmployeeRow}
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                Add Employee
              </button>
              
              <div className="space-x-2">
                <button
                  onClick={saveEmployees}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Data"}
                </button>
                
                <button
                  onClick={generateECR}
                  className="bg-purple-600 hover:bg-purple-800 text-white py-2 px-4 rounded-md"
                  disabled={loading}
                >
                  Generate ECR File
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border-b text-left">UAN</th>
                  <th className="py-2 px-3 border-b text-left">Name</th>
                  <th className="py-2 px-3 border-b text-right">EPF Wages</th>
                  <th className="py-2 px-3 border-b text-right">EPS Wages</th>
                  <th className="py-2 px-3 border-b text-right">EPF Contrib</th>
                  <th className="py-2 px-3 border-b text-right">EPS Contrib</th>
                  <th className="py-2 px-3 border-b text-right">EPF-EPS Diff</th>
                  <th className="py-2 px-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-4 text-center text-gray-500">
                      No employees added. Click "Add Employee" to begin.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-3 border-b">{emp.uan}</td>
                      <td className="py-2 px-3 border-b">{emp.name}</td>
                      <td className="py-2 px-3 border-b text-right">₹{emp.epfWages}</td>
                      <td className="py-2 px-3 border-b text-right">₹{emp.epsWages}</td>
                      <td className="py-2 px-3 border-b text-right">₹{emp.epfContribution}</td>
                      <td className="py-2 px-3 border-b text-right">₹{emp.epsContribution}</td>
                      <td className="py-2 px-3 border-b text-right">₹{emp.epfEpsDifference}</td>
                      <td className="py-2 px-3 border-b text-center">
                        <button
                          onClick={() => openEmployeeForm(emp, index)}
                          className="text-blue-500 hover:text-blue-700 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeEmployeeRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {currentEmployeeIndex !== null ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">UAN (Universal Account Number)*</label>
                <input
                  type="text"
                  value={currentEmployee?.uan || ''}
                  onChange={(e) => handleEmployeeFormChange('uan', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Employee Name*</label>
                <input
                  type="text"
                  value={currentEmployee?.name || ''}
                  onChange={(e) => handleEmployeeFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Gross Wages</label>
                <input
                  type="number"
                  value={currentEmployee?.grossWages || 0}
                  onChange={(e) => handleEmployeeFormChange('grossWages', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">EPF Wages*</label>
                <input
                  type="number"
                  value={currentEmployee?.epfWages || 0}
                  onChange={(e) => handleEmployeeFormChange('epfWages', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">EPS Wages*</label>
                <input
                  type="number"
                  value={currentEmployee?.epsWages || 0}
                  onChange={(e) => handleEmployeeFormChange('epsWages', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Max limit: ₹15,000</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">EDLI Wages</label>
                <input
                  type="number"
                  value={currentEmployee?.edliWages || 0}
                  onChange={(e) => handleEmployeeFormChange('edliWages', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">NCP Days</label>
                <input
                  type="number"
                  value={currentEmployee?.ncpDays || 0}
                  onChange={(e) => handleEmployeeFormChange('ncpDays', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Refund of Advances</label>
                <input
                  type="number"
                  value={currentEmployee?.refundOfAdvances || 0}
                  onChange={(e) => handleEmployeeFormChange('refundOfAdvances', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-3 rounded">
              <div>
                <label className="block text-gray-700 mb-1">EPF Contribution (12%)</label>
                <div className="w-full px-3 py-2 border rounded bg-gray-100">
                  ₹{(currentEmployee?.epfContribution || 0)}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">EPS Contribution (8.33%)</label>
                <div className="w-full px-3 py-2 border rounded bg-gray-100">
                  ₹{(currentEmployee?.epsContribution || 0)}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">EPF-EPS Difference</label>
                <div className="w-full px-3 py-2 border rounded bg-gray-100">
                  ₹{(currentEmployee?.epfEpsDifference || 0)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowEmployeeForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={handleEmployeeFormSubmit}
              >
                {currentEmployeeIndex !== null ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Back button */}
      <div className="w-full max-w-4xl mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default EpfEcr;