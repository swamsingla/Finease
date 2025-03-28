import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ visible, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    gstin: '',
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        companyName: user.companyName || '',
        gstin: user.gstin || '',
      });
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    await updateUser(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={formData.companyName}
          onChangeText={(value) => handleChange('companyName', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="GSTIN"
          value={formData.gstin}
          onChangeText={(value) => handleChange('gstin', value)}
        />
        <Button title="Save" onPress={handleSubmit} />
        <Button title="Cancel" onPress={onClose} color="red" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default EditProfileModal;