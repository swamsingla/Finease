import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import SupportScreen from '../Support/SupportScreen'; // Adjust the path as needed
import Constants from 'expo-constants';

const ProfileScreen = () => {
  // Added token from useAuth so we can use it for the fetch call.
  const { user, logout, token } = useAuth();
  const navigation = useNavigation();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState('');

  // Fetch notifications on mount (or when modal opens for the first time)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        setErrorNotifications('');
        const response = await fetch(
          `${Constants.expoConfig.extra.apiUrl || 'http://localhost:5000/api'}/auth/notifications`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        setErrorNotifications(err.message);
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {user?.companyName || 'Individual User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setShowEditProfile(true)}
        >
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setShowNotifications(true)}
        >
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setShowSupport(true)}
        >
          <Text style={styles.menuText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleLogout}
        >
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      </Modal>

      {/* Support Modal */}
      <Modal
        visible={showSupport}
        animationType="slide"
        onRequestClose={() => setShowSupport(false)}
      >
        <View style={{ flex: 1 }}>
          <SupportScreen />
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowSupport(false)}
          >
            <Text style={styles.closeButtonText}>Close Support</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Notifications</Text>
          {loadingNotifications ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : errorNotifications ? (
            <Text style={styles.errorText}>{errorNotifications}</Text>
          ) : notifications.length === 0 ? (
            <Text style={styles.noNotifications}>No notifications found.</Text>
          ) : (
            notifications.map((notif, index) => (
              <View key={index} style={styles.notification}>
                <Text style={styles.notificationText}>{notif.message}</Text>
              </View>
            ))
          )}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowNotifications(false)}
          >
            <Text style={styles.closeButtonText}>Close Notifications</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  menu: {
    marginVertical: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 18,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noNotifications: {
    fontSize: 18,
    color: '#666',
  },
  notification: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  notificationText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default ProfileScreen;
