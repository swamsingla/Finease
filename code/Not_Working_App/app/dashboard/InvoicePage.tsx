import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

const InvoicePage = () => {
  // Sample invoice data
  const recentInvoices = [
    { id: '001', customer: 'Acme Corp', amount: '₹12,500', date: '15 Aug 2023', status: 'paid' },
    { id: '002', customer: 'XYZ Industries', amount: '₹8,750', date: '10 Aug 2023', status: 'pending' },
    { id: '003', customer: 'TechStart Ltd', amount: '₹5,000', date: '05 Aug 2023', status: 'paid' },
    { id: '004', customer: 'Global Enterprises', amount: '₹15,000', date: '01 Aug 2023', status: 'overdue' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Invoices</Text>
          <TouchableOpacity style={styles.createButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>New Invoice</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹26,250</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹8,750</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹15,000</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
        </View>
        
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentInvoices.map((invoice) => (
            <TouchableOpacity key={invoice.id} style={styles.invoiceItem}>
              <View style={styles.invoiceMain}>
                <Text style={styles.invoiceCustomer}>{invoice.customer}</Text>
                <Text style={styles.invoiceId}>Invoice #{invoice.id}</Text>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>
              <View style={styles.invoiceDetails}>
                <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                  <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="wallet-outline" size={24} color="#007bff" />
            <Text style={styles.actionText}>Payment Options</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document-text-outline" size={24} color="#007bff" />
            <Text style={styles.actionText}>E-way Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="stats-chart-outline" size={24} color="#007bff" />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="settings-outline" size={24} color="#007bff" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <BottomNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#007bff',
    fontSize: 14,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceMain: {
    flex: 1,
  },
  invoiceCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  invoiceId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 13,
    color: '#888',
  },
  invoiceDetails: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginTop: 10,
    color: '#333',
    fontWeight: '500',
  },
});

export default InvoicePage;
