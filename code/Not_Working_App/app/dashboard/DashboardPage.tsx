import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Use useEffect to verify user data
  useEffect(() => {
    if (user) {
      console.log('User data loaded:', user);
    }
  }, [user]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
      router.replace('/auth/AuthPage');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  // Get display name from user object (handle both companyName and fallback)
  const displayName = user?.companyName || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome, {displayName}!</Text>
        <Text style={styles.subtitle}>This is your dashboard.</Text>

        {/* Placeholder for future dashboard content */}
        <View style={styles.card}>
          <Text style={styles.cardText}>Your dashboard content will appear here.</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/dashboard/FilePage')}>
              <Text style={styles.actionButtonText}>Start Filing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/dashboard/UploadPage')}>
              <Text style={styles.actionButtonText}>Upload Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/dashboard/InvoicePage')}>
              <Text style={styles.actionButtonText}>Create Invoice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Text style={styles.actionButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <BottomNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 80, // Add padding to account for bottom navbar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardPage;
