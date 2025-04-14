import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EcrEpfScreen = () => {
  // State for company details
  const [companyForm, setCompanyForm] = useState({
    establishmentId: '',
    establishmentName: '',
    wageMonth: ''
  });

  // State for employees list
  const [employees, setEmployees] = useState([]);
  
  // State for modals and current employee editing
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(null);
  
  // State for error and success messages
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // Load saved batches on component mount
  useEffect(() => {
    loadSavedBatch();
  }, []);

  // Load saved batch data from AsyncStorage
  const loadSavedBatch = async () => {
    try {
      const savedCompany = await AsyncStorage.getItem('ecrCompany');
      const savedEmployees = await AsyncStorage.getItem('ecrEmployees');
      
      if (savedCompany) setCompanyForm(JSON.parse(savedCompany));
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    } catch (error) {
      showMessage('Error loading saved data', 'error');
    }
  };

  // Save current batch data to AsyncStorage
  const saveBatchData = async () => {
    try {
      await AsyncStorage.setItem('ecrCompany', JSON.stringify(companyForm));
      await AsyncStorage.setItem('ecrEmployees', JSON.stringify(employees));
      showMessage('Data saved successfully', 'success');
    } catch (error) {
      showMessage('Failed to save data', 'error');
    }
  };

  // Handle company form field changes
  const handleCompanyChange = (field, value) => {
    setCompanyForm({
      ...companyForm,
      [field]: value
    });
  };

  // Open employee form for adding/editing
  const openEmployeeForm = (employee = null, index = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      setCurrentEmployeeIndex(index);
    } else {
      setCurrentEmployee({
        uan: '',
        name: '',
        grossWages: '0',
        epfWages: '0',
        epsWages: '0',
        edliWages: '0',
        ncpDays: '0',
        refundOfAdvances: '0',
        epfContribution: '0',
        epsContribution: '0',
        epfEpsDifference: '0'
      });
      setCurrentEmployeeIndex(null);
    }
    setShowEmployeeModal(true);
  };

  // Handle employee form field changes
  const handleEmployeeChange = (field, value) => {
    const updatedEmployee = { ...currentEmployee };
    updatedEmployee[field] = value;
    
    // Auto calculations
    if (['epfWages', 'epsWages'].includes(field)) {
      // Ensure values are valid numbers
      const epfWages = Number(updatedEmployee.epfWages) || 0;
      const epsWages = field === 'epsWages' 
        ? Number(updatedEmployee.epsWages) || 0
        : Number(updatedEmployee.epsWages) || Math.min(epfWages, 15000);
      
      // Calculate EPF contribution (12% of EPF wages)
      const epfContribution = Math.round(epfWages * 0.12);
      updatedEmployee.epfContribution = epfContribution.toString();
      
      // If epsWages was not explicitly set but epfWages was updated
      if (field === 'epfWages' && !updatedEmployee.epsWages) {
        // Default epsWages to epfWages (capped at 15000)
        updatedEmployee.epsWages = Math.min(epfWages, 15000).toString();
      }
      
      // Calculate EPS contribution (8.33% of EPS wages capped at 15000)
      const epsContribution = Math.round(Math.min(epsWages, 15000) * 0.0833);
      updatedEmployee.epsContribution = epsContribution.toString();
      
      // Calculate EPF-EPS difference
      updatedEmployee.epfEpsDifference = (epfContribution - epsContribution).toString();
    }
    
    // If edliWages not set but epfWages is updated
    if (field === 'epfWages' && !updatedEmployee.edliWages) {
      updatedEmployee.edliWages = value;
    }
    
    setCurrentEmployee(updatedEmployee);
  };

  // Save employee form data
  const saveEmployeeForm = () => {
    // Validate required fields
    if (!currentEmployee.uan || !currentEmployee.uan.trim()) {
      showMessage('UAN is required', 'error');
      return;
    }
    
    if (!currentEmployee.name || !currentEmployee.name.trim()) {
      showMessage('Employee name is required', 'error');
      return;
    }
    
    // Ensure all numeric fields are valid numbers
    const validatedEmployee = { ...currentEmployee };
    
    // Re-calculate contributions to ensure they're correct
    const epfWages = Number(validatedEmployee.epfWages) || 0;
    const epsWages = Number(validatedEmployee.epsWages) || 0;
    
    validatedEmployee.epfContribution = Math.round(epfWages * 0.12).toString();
    validatedEmployee.epsContribution = Math.round(Math.min(epsWages, 15000) * 0.0833).toString();
    validatedEmployee.epfEpsDifference = (
      Number(validatedEmployee.epfContribution) - 
      Number(validatedEmployee.epsContribution)
    ).toString();
    
    if (currentEmployeeIndex !== null) {
      // Update existing employee
      const updatedEmployees = [...employees];
      updatedEmployees[currentEmployeeIndex] = validatedEmployee;
      setEmployees(updatedEmployees);
    } else {
      // Add new employee
      setEmployees([...employees, validatedEmployee]);
    }
    
    setShowEmployeeModal(false);
    showMessage('Employee saved successfully', 'success');
  };

  // Remove employee from list
  const removeEmployee = (index) => {
    Alert.alert(
      'Remove Employee',
      'Are you sure you want to remove this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updatedEmployees = [...employees];
            updatedEmployees.splice(index, 1);
            setEmployees(updatedEmployees);
            showMessage('Employee removed', 'success');
          }
        }
      ]
    );
  };

  // Generate ECR text file
  const generateECR = async () => {
    // Validate company details
    if (!companyForm.establishmentId || !companyForm.establishmentName || !companyForm.wageMonth) {
      showMessage('Please fill all company details', 'error');
      return;
    }
    
    if (employees.length === 0) {
      showMessage('Please add at least one employee', 'error');
      return;
    }
    
    // Generate ECR text content
    let ecrContent = `ECR FILE FOR: ${companyForm.establishmentName}\n`;
    ecrContent += `Establishment ID: ${companyForm.establishmentId}\n`;
    ecrContent += `Wage Month: ${companyForm.wageMonth}\n\n`;
    ecrContent += "UAN,Name,Gross Wages,EPF Wages,EPS Wages,EDLI Wages,EPF Contribution,EPS Contribution,EPF-EPS Diff\n";
    
    // Calculate totals
    let totalEpfWages = 0;
    let totalEpfContribution = 0;
    let totalEpsContribution = 0;
    
    // Add employee records
    employees.forEach(emp => {
      ecrContent += `${emp.uan},${emp.name},${emp.grossWages},${emp.epfWages},${emp.epsWages},`;
      ecrContent += `${emp.edliWages},${emp.epfContribution},${emp.epsContribution},${emp.epfEpsDifference}\n`;
      
      totalEpfWages += Number(emp.epfWages) || 0;
      totalEpfContribution += Number(emp.epfContribution) || 0;
      totalEpsContribution += Number(emp.epsContribution) || 0;
    });
    
    // Add totals
    ecrContent += `\nTotal Employees: ${employees.length}\n`;
    ecrContent += `Total EPF Wages: ₹${totalEpfWages}\n`;
    ecrContent += `Total EPF Contribution: ₹${totalEpfContribution}\n`;
    ecrContent += `Total EPS Contribution: ₹${totalEpsContribution}\n`;
    ecrContent += `Total EPF-EPS Difference: ₹${totalEpfContribution - totalEpsContribution}\n`;
    
    // Save the data first
    await saveBatchData();
    
    // Share the ECR file
    try {
      await Share.share({
        message: ecrContent,
        title: `ECR_${companyForm.establishmentId}_${companyForm.wageMonth.replace(/\s/g, '_')}.txt`
      });
    } catch (error) {
      showMessage('Error sharing ECR file', 'error');
    }
  };

  // Utility function to show messages
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // Calculate summary totals
  const calculateSummary = () => {
    let totalEmployees = employees.length;
    let totalEpfWages = 0;
    let totalEpfContribution = 0;
    let totalEpsContribution = 0;
    
    employees.forEach(emp => {
      totalEpfWages += Number(emp.epfWages) || 0;
      totalEpfContribution += Number(emp.epfContribution) || 0;
      totalEpsContribution += Number(emp.epsContribution) || 0;
    });
    
    return {
      totalEmployees,
      totalEpfWages,
      totalEpfContribution,
      totalEpsContribution,
      totalDifference: totalEpfContribution - totalEpsContribution
    };
  };

  const summary = calculateSummary();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>EPF ECR Generator</Text>
        
        {/* Message display */}
        {message ? (
          <View style={[
            styles.messageContainer, 
            messageType === 'error' ? styles.errorMessage : styles.successMessage
          ]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
        
        {/* Company Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Establishment ID*</Text>
            <TextInput
              style={styles.input}
              value={companyForm.establishmentId}
              onChangeText={(text) => handleCompanyChange('establishmentId', text)}
              placeholder="e.g., MHBAN0012345678"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Establishment Name*</Text>
            <TextInput
              style={styles.input}
              value={companyForm.establishmentName}
              onChangeText={(text) => handleCompanyChange('establishmentName', text)}
              placeholder="e.g., ABC Technologies Pvt Ltd"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wage Month*</Text>
            <TextInput
              style={styles.input}
              value={companyForm.wageMonth}
              onChangeText={(text) => handleCompanyChange('wageMonth', text)}
              placeholder="e.g., Apr 2025"
            />
          </View>
        </View>
        
        {/* Employees Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Employees</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openEmployeeForm()}
            >
              <Text style={styles.addButtonText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
          
          {employees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No employees added yet</Text>
              <Text style={styles.emptySubText}>Tap "Add Employee" to get started</Text>
            </View>
          ) : (
            <View>
              {/* Employee Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Employees:</Text>
                  <Text style={styles.summaryValue}>{summary.totalEmployees}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total EPF Wages:</Text>
                  <Text style={styles.summaryValue}>₹{summary.totalEpfWages}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total EPF Contribution:</Text>
                  <Text style={styles.summaryValue}>₹{summary.totalEpfContribution}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total EPS Contribution:</Text>
                  <Text style={styles.summaryValue}>₹{summary.totalEpsContribution}</Text>
                </View>
              </View>
              
              {/* Employee List */}
              <FlatList
                data={employees}
                keyExtractor={(_, index) => index.toString()}
                style={styles.employeeList}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={styles.employeeCard}>
                    <View style={styles.employeeHeader}>
                      <Text style={styles.employeeName}>{item.name}</Text>
                      <Text style={styles.employeeUan}>UAN: {item.uan}</Text>
                    </View>
                    
                    <View style={styles.employeeDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>EPF Wages:</Text>
                        <Text style={styles.detailValue}>₹{item.epfWages}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>EPF Contrib:</Text>
                        <Text style={styles.detailValue}>₹{item.epfContribution}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>EPS Contrib:</Text>
                        <Text style={styles.detailValue}>₹{item.epsContribution}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.employeeActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => openEmployeeForm(item, index)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeEmployee(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveBatchData}
          >
            <Text style={styles.saveButtonText}>Save Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateECR}
          >
            <Text style={styles.generateButtonText}>Generate ECR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Employee Form Modal */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {currentEmployeeIndex !== null ? 'Edit Employee' : 'Add Employee'}
            </Text>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>UAN*</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.uan || ''}
                  onChangeText={(text) => handleEmployeeChange('uan', text)}
                  placeholder="Universal Account Number"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Employee Name*</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.name || ''}
                  onChangeText={(text) => handleEmployeeChange('name', text)}
                  placeholder="Full Name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Gross Wages</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.grossWages || '0'}
                  onChangeText={(text) => handleEmployeeChange('grossWages', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>EPF Wages*</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.epfWages || '0'}
                  onChangeText={(text) => handleEmployeeChange('epfWages', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>EPS Wages*</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.epsWages || '0'}
                  onChangeText={(text) => handleEmployeeChange('epsWages', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.helperText}>Max limit: ₹15,000</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>EDLI Wages</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.edliWages || '0'}
                  onChangeText={(text) => handleEmployeeChange('edliWages', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>NCP Days</Text>
                <TextInput
                  style={styles.input}
                  value={currentEmployee?.ncpDays || '0'}
                  onChangeText={(text) => handleEmployeeChange('ncpDays', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.calculatedContainer}>
                <Text style={styles.calculatedTitle}>Calculated Contributions</Text>
                
                <View style={styles.calculatedRow}>
                  <Text style={styles.calculatedLabel}>EPF Contribution (12%):</Text>
                  <Text style={styles.calculatedValue}>
                    ₹{currentEmployee?.epfContribution || '0'}
                  </Text>
                </View>
                
                <View style={styles.calculatedRow}>
                  <Text style={styles.calculatedLabel}>EPS Contribution (8.33%):</Text>
                  <Text style={styles.calculatedValue}>
                    ₹{currentEmployee?.epsContribution || '0'}
                  </Text>
                </View>
                
                <View style={styles.calculatedRow}>
                  <Text style={styles.calculatedLabel}>EPF-EPS Difference:</Text>
                  <Text style={styles.calculatedValue}>
                    ₹{currentEmployee?.epfEpsDifference || '0'}
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowEmployeeModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={saveEmployeeForm}
              >
                <Text style={styles.modalSaveText}>
                  {currentEmployeeIndex !== null ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  messageText: {
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  summaryContainer: {
    backgroundColor: '#f0f4f8',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontWeight: '500',
    color: '#555',
  },
  summaryValue: {
    fontWeight: '600',
  },
  employeeList: {
    marginTop: 8,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  employeeHeader: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  employeeUan: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  employeeDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
  employeeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#f9fafb',
  },
  editButtonText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  removeButtonText: {
    color: '#f44336',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 32,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#673ab7',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginLeft: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  calculatedContainer: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  calculatedTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calculatedLabel: {
    color: '#555',
  },
  calculatedValue: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EcrEpfScreen;