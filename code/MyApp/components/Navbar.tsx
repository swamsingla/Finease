import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Navbar = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Logout failed.');
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', icon: 'home-outline', path: '/dashboard/DashboardPage' },
    { label: 'Profile', icon: 'person-outline', path: '/profile' },
    { label: 'File', icon: 'document-outline', path: '/file' },
    { label: 'Upload', icon: 'cloud-upload-outline', path: '/upload' },
    { label: 'Scan', icon: 'scan-outline', path: '/scan' },
    { label: 'GST', icon: 'calculator-outline', path: '/gst' },
    { label: 'ITR', icon: 'receipt-outline', path: '/itr' },
    { label: 'EPF', icon: 'briefcase-outline', path: '/epf' },
    { label: 'Invoice', icon: 'cash-outline', path: '/invoice' },
  ];

  return (
    <>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)}>
            <Ionicons name="menu-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.title}>TaxFile Pro</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {user?.email}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Drawer */}
      {drawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdrop} 
            onPress={() => setDrawerOpen(false)} 
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.drawerContent}>
              {navItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.drawerItem}
                  onPress={() => navigateTo(item.path)}
                >
                  <Ionicons name={item.icon} size={22} color="#007bff" />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.drawerFooter}>
              <TouchableOpacity onPress={handleLogout} style={styles.drawerLogoutButton}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
                <Text style={styles.drawerLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#fff',
    paddingTop: 45, // Account for status bar
    paddingBottom: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  email: {
    marginRight: 10,
    color: '#555',
    fontSize: 12,
    maxWidth: 120,
  },
  logoutButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '70%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50, // For status bar
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  drawerFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  drawerLogoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerLogoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Navbar;
