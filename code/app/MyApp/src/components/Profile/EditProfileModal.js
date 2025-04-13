import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ visible, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    gstin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset formData each time the modal becomes visible.
  useEffect(() => {
    if (visible && user) {
      setFormData({
        email: user.email || '',
        companyName: user.companyName || '',
        gstin: user.gstin || '',
      });
    }
  }, [visible]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
      // Wait briefly to show the success message before closing.
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={formData.companyName}
          onChangeText={(value) => handleChange('companyName', value)}
          editable={true}
        />
        <TextInput
          style={styles.input}
          placeholder="GSTIN"
          value={formData.gstin}
          onChangeText={(value) => handleChange('gstin', value)}
          autoCapitalize="characters"
          editable={true}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 10 }} />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    alignSelf: 'center'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center'
  }
});

export default EditProfileModal;
