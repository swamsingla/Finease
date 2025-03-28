import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Company Name: {user?.companyName}</Text>
      <Button title="Edit Profile" onPress={() => setShowEditProfile(true)} />
      <Button title="Logout" onPress={handleLogout} />

      <Modal
        visible={showEditProfile}
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ProfileScreen;