const EPF = require("../models/EPF");
const EPFEmployee = require("../models/EPFEmployee");
const EPFBatch = require("../models/EPFBatch");
const fs = require('fs');
const path = require('path');

// Submit EPF data
exports.submitEPFData = async (req, res) => {
  const { email, trrnNo, establishmentId, establishmentName, wageMonth, member, totalAmount } = req.body;

  try {
    // Create a new EPF document
    const epfData = new EPF({
      email,
      trrnNo,
      establishmentId,
      establishmentName,
      wageMonth,
      member,
      totalAmount,
    });

    // Save the document to MongoDB
    await epfData.save();

    // Send success response
    res.status(200).json({ message: "EPF data submitted successfully!" });
  } catch (error) {
    console.error("Error saving EPF data:", error);
    res.status(500).json({ error: "Failed to submit EPF data. Please try again." });
  }
};

// Create a new EPF batch
exports.createBatch = async (req, res) => {
  const { email, establishmentId, establishmentName, wageMonth } = req.body;

  try {
    const newBatch = new EPFBatch({
      email,
      establishmentId,
      establishmentName,
      wageMonth,
    });

    await newBatch.save();
    
    res.status(201).json({ 
      success: true, 
      message: "EPF batch created successfully", 
      batchId: newBatch._id 
    });
  } catch (error) {
    console.error("Error creating EPF batch:", error);
    res.status(500).json({ error: "Failed to create EPF batch" });
  }
};

// Add or update employees to a batch
exports.addEmployees = async (req, res) => {
  const { batchId, employees } = req.body;
  
  try {
    const batch = await EPFBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    // Initialize batch totals
    let batchTotals = {
      totalEmployees: 0,
      totalEpfWages: 0,
      totalEpsWages: 0,
      totalEpfContribution: 0,
      totalEpsContribution: 0,
      totalEpfEpsDifference: 0
    };
    
    // Process each employee
    for (const emp of employees) {
      // Calculate contributions
      const epfContribution = Math.round(emp.epfWages * 0.12);
      const epsContribution = Math.round(Math.min(emp.epsWages, 15000) * 0.0833);
      const epfEpsDifference = epfContribution - epsContribution;
      
      // Add to or update employee
      if (emp._id) {
        // Update existing employee
        await EPFEmployee.findByIdAndUpdate(emp._id, {
          ...emp,
          epfBatchId: batchId,
          epfContribution,
          epsContribution,
          epfEpsDifference
        });
      } else {
        // Create new employee
        const newEmployee = new EPFEmployee({
          ...emp,
          epfBatchId: batchId,
          epfContribution,
          epsContribution,
          epfEpsDifference
        });
        await newEmployee.save();
      }
      
      // Update batch totals
      batchTotals.totalEmployees++;
      batchTotals.totalEpfWages += emp.epfWages;
      batchTotals.totalEpsWages += emp.epsWages;
      batchTotals.totalEpfContribution += epfContribution;
      batchTotals.totalEpsContribution += epsContribution;
      batchTotals.totalEpfEpsDifference += epfEpsDifference;
    }
    
    // Update batch with new totals
    await EPFBatch.findByIdAndUpdate(batchId, batchTotals);
    
    res.status(200).json({ 
      success: true, 
      message: "Employees added to batch successfully" 
    });
  } catch (error) {
    console.error("Error adding employees to batch:", error);
    res.status(500).json({ error: "Failed to add employees to batch" });
  }
};

// Delete an employee from a batch
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const { batchId } = req.query;
  
  try {
    // Find the employee to be deleted
    const employee = await EPFEmployee.findById(id);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    // Check if employee belongs to the specified batch
    if (employee.epfBatchId.toString() !== batchId) {
      return res.status(400).json({ error: "Employee does not belong to the specified batch" });
    }
    
    // Delete the employee
    await EPFEmployee.findByIdAndDelete(id);
    
    // Recalculate batch totals
    const remainingEmployees = await EPFEmployee.find({ epfBatchId: batchId });
    
    // Initialize batch totals
    let batchTotals = {
      totalEmployees: remainingEmployees.length,
      totalEpfWages: 0,
      totalEpsWages: 0,
      totalEpfContribution: 0,
      totalEpsContribution: 0,
      totalEpfEpsDifference: 0
    };
    
    // Calculate new totals
    remainingEmployees.forEach(emp => {
      batchTotals.totalEpfWages += emp.epfWages;
      batchTotals.totalEpsWages += emp.epsWages;
      batchTotals.totalEpfContribution += emp.epfContribution;
      batchTotals.totalEpsContribution += emp.epsContribution;
      batchTotals.totalEpfEpsDifference += emp.epfEpsDifference;
    });
    
    // Update batch with new totals
    await EPFBatch.findByIdAndUpdate(batchId, batchTotals);
    
    res.status(200).json({ 
      success: true, 
      message: "Employee removed successfully" 
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// Get all batches for a user
exports.getBatches = async (req, res) => {
  const { email } = req.query;
  
  try {
    const batches = await EPFBatch.find({ email }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      batches 
    });
  } catch (error) {
    console.error("Error fetching EPF batches:", error);
    res.status(500).json({ error: "Failed to fetch EPF batches" });
  }
};

// Get employees for a specific batch
exports.getBatchEmployees = async (req, res) => {
  const { batchId } = req.params;
  
  try {
    const employees = await EPFEmployee.find({ epfBatchId: batchId });
    const batch = await EPFBatch.findById(batchId);
    
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      batch,
      employees 
    });
  } catch (error) {
    console.error("Error fetching batch employees:", error);
    res.status(500).json({ error: "Failed to fetch batch employees" });
  }
};

// Generate ECR text file
exports.generateECR = async (req, res) => {
  const { batchId } = req.params;
  
  try {
    const batch = await EPFBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    const employees = await EPFEmployee.find({ epfBatchId: batchId });
    
    // Format the ECR content
    let ecrContent = '';
    
    // Header line [Not Required]
    // ecrContent += `${batch.establishmentId}#~#${batch.establishmentName}#~#${batch.wageMonth}#~#${batch.totalEmployees}\n`;
    
    // Employee lines
    employees.forEach(emp => {
      ecrContent += `${emp.uan}#~#${emp.name}#~#${emp.grossWages}#~#${emp.epfWages}#~#${emp.epfWages}#~#`;
      ecrContent += `${emp.edliWages}#~#${emp.epfContribution}#~#${emp.epsContribution}#~#`;
      ecrContent += `${emp.epfEpsDifference}#~#${emp.ncpDays}#~#${emp.refundOfAdvances || 0}\n`;
    });
    
    // Create a temporary file
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileName = `ECR_${batch.establishmentId}_${batch.wageMonth.replace(/\s+/g, '_')}.txt`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, ecrContent);
    
    // Update batch status to FINAL
    await EPFBatch.findByIdAndUpdate(batchId, { status: 'FINAL' });
    
    // Send the file as attachment
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ error: "Failed to send ECR file" });
      }
      
      // Delete the temp file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error generating ECR file:", error);
    res.status(500).json({ error: "Failed to generate ECR file" });
  }
};