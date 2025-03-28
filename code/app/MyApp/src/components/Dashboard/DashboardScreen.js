import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    pendingTasks: 2,
    upcomingDeadlines: [
      { id: 1, title: 'GST Filing', dueDate: '2025-04-15', type: 'GST' },
      { id: 2, title: 'ITR Filing', dueDate: '2025-07-31', type: 'ITR' },
    ],
    recentDocuments: [
      { id: 1, name: 'Invoice_1234.pdf', date: '2025-03-12', type: 'invoice' },
      { id: 2, name: 'GST_Receipt.pdf', date: '2025-03-10', type: 'gst' },
    ],
    taxSummary: {
      pendingAmount: 12500,
      paidAmount: 45000,
      savings: 8500,
    }
  });

  useEffect(() => {
    // In a real app, you would fetch dashboard data from an API
    setLoading(true);
    // Simulating API call delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            {user && (
              <Text style={styles.nameText}>Hello, {user.name || user.email}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Company Info */}
        {user && user.companyName && (
          <View style={styles.companyCard}>
            <Ionicons name="business" size={24} color="#3b82f6" />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{user.companyName}</Text>
              {user.gstin && <Text style={styles.gstin}>GSTIN: {user.gstin}</Text>}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigateTo('GstFiling')}
            >
              <Ionicons name="calculator-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>GST Filing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateTo('ItrFiling')}
            >
              <Ionicons name="receipt-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>ITR Filing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateTo('ScanUpload')}
            >
              <Ionicons name="scan-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>Scan Doc</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tax Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Summary</Text>
          <View style={styles.taxSummaryContainer}>
            <View style={styles.taxItem}>
              <Text style={styles.taxLabel}>Pending</Text>
              <Text style={[styles.taxValue, { color: '#ef4444' }]}>
                {formatCurrency(dashboardData.taxSummary.pendingAmount)}
              </Text>
            </View>
            <View style={styles.taxItem}>
              <Text style={styles.taxLabel}>Paid</Text>
              <Text style={[styles.taxValue, { color: '#10b981' }]}>
                {formatCurrency(dashboardData.taxSummary.paidAmount)}
              </Text>
            </View>
            <View style={styles.taxItem}>
              <Text style={styles.taxLabel}>Savings</Text>
              <Text style={[styles.taxValue, { color: '#3b82f6' }]}>
                {formatCurrency(dashboardData.taxSummary.savings)}
              </Text>
            </View>
          </View>
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          {dashboardData.upcomingDeadlines.map((deadline) => (
            <View key={deadline.id} style={styles.deadlineItem}>
              <View style={[styles.deadlineIconContainer, 
                deadline.type === 'GST' ? styles.gstIcon : styles.itrIcon]}>
                <Ionicons
                  name={deadline.type === 'GST' ? 'calculator-outline' : 'receipt-outline'}
                  size={20}
                  color="white"
                />
              </View>
              <View style={styles.deadlineInfo}>
                <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                <Text style={styles.deadlineDate}>Due: {deadline.dueDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
          ))}
        </View>
        
        {/* Recent Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          {dashboardData.recentDocuments.map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <Ionicons
                name={doc.type === 'invoice' ? 'document-text' : 'document'}
                size={24}
                color="#3b82f6"
              />
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentDate}>Uploaded: {doc.date}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="download-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Support Section */}
        <TouchableOpacity 
          style={styles.supportCard}
          onPress={() => navigation.navigate('Support')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="white" />
          <Text style={styles.supportText}>Need help with tax filing?</Text>
          <Text style={styles.supportAction}>Chat with our experts</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#3b82f6',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  nameText: {
    fontSize: 18,
    color: '#4b5563',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  companyInfo: {
    marginLeft: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  gstin: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  taxSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taxItem: {
    alignItems: 'center',
    flex: 1,
  },
  taxLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  taxValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deadlineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gstIcon: {
    backgroundColor: '#3b82f6',
  },
  itrIcon: {
    backgroundColor: '#10b981',
  },
  deadlineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  deadlineDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    color: '#1f2937',
  },
  documentDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  supportText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
  },
  supportAction: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});

export default DashboardScreen;