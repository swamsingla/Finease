import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const [period, setPeriod] = useState("yearly");
  const [netIncome, setNetIncome] = useState("0");
  const [monthlyIncomeData, setMonthlyIncomeData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: Array(12).fill(0)
  });
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    gstAmount: 0,
    potentialSavings: 0,
    daysRemaining: 0
  });
  const [cardData, setCardData] = useState({
    tax: "0.00",
    income: "0.00",
    savings: "0.00",
    expenses: "0.00",
    investments: "0.00",
    debt: "0.00"
  });
  const [isLoading, setIsLoading] = useState(false);

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
  
  const calculateDaysRemaining = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const filingDeadline = new Date(currentYear, 6, 31);
    if (today > filingDeadline) {
      filingDeadline.setFullYear(currentYear + 1);
    }
    const diffTime = filingDeadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays > 0 ? diffDays : 0 };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {}
      };

      config.params = period === 'monthly'
        ? { year: currentYear, month: currentMonth }
        : { year: currentYear };
      
      const statsResponse = await axios.get(
        `http://localhost:5000/api/dashboard/document-statistics`,
        config
      );
      const chartResponse = await axios.get(
        `http://localhost:5000/api/dashboard/monthly-data`,
        { ...config, params: { year: currentYear } }
      );

      const statsData = statsResponse.data.statistics;
      const monthlyData = chartResponse.data.monthlyData.data;

      const calculateYearlyData = (monthlyData) => {
        let totalTax = 0;
        let totalIncome = 0;
        let totalDocuments = 0;
        monthlyData.amounts.forEach(val => totalIncome += val);
        monthlyData.taxes.forEach(val => totalTax += val);
        monthlyData.totalCounts.forEach(val => totalDocuments += val);
        return { tax: totalTax, income: totalIncome, documents: totalDocuments };
      };

      const yearlyData = calculateYearlyData(monthlyData);

      const calculateMonthlyData = (monthlyData, index) => {
        return { 
          tax: monthlyData.taxes[index], 
          income: monthlyData.amounts[index], 
          documents: monthlyData.totalCounts[index] 
        };
      };

      const monthlySummaryData = calculateMonthlyData(monthlyData, currentMonth - 1);
      
      if (period === 'yearly') {
        setDocumentStats({
          totalDocuments: yearlyData.documents,
          gstAmount: yearlyData.tax,
          potentialSavings: yearlyData.tax * 0.1,
          daysRemaining: calculateDaysRemaining().days
        });
        const expenses = yearlyData.income * 0.65;
        const debt = yearlyData.income * 0.28;
        const operatingProfit = yearlyData.income - expenses - yearlyData.tax;
        const investments = operatingProfit * 0.4;
        const savings = operatingProfit - investments;
        setCardData({
          tax: yearlyData.tax.toFixed(2),
          income: yearlyData.income.toFixed(2),
          expenses: expenses.toFixed(2),
          debt: debt.toFixed(2),
          investments: investments.toFixed(2),
          savings: savings.toFixed(2)
        });
        setNetIncome(yearlyData.income.toFixed(2));
      } else {
        setDocumentStats({
          totalDocuments: monthlySummaryData.documents,
          gstAmount: monthlySummaryData.tax,
          potentialSavings: monthlySummaryData.tax * 0.1,
          daysRemaining: calculateDaysRemaining().days
        });
        const expenses = monthlySummaryData.income * 0.65;
        const debt = monthlySummaryData.income * 0.28;
        const operatingProfit = monthlySummaryData.income - expenses - monthlySummaryData.tax;
        const investments = operatingProfit * 0.4;
        const savings = operatingProfit - investments;
        setCardData({
          tax: monthlySummaryData.tax.toFixed(2),
          income: monthlySummaryData.income.toFixed(2),
          expenses: expenses.toFixed(2),
          debt: debt.toFixed(2),
          investments: investments.toFixed(2),
          savings: savings.toFixed(2)
        });
        setNetIncome(monthlySummaryData.income.toFixed(2));
      }

      if (chartResponse.data?.monthlyData) {
        const monthlyChartData = chartResponse.data.monthlyData;
        setMonthlyIncomeData({
          labels: monthlyChartData.labels || monthlyIncomeData.labels,
          values: monthlyChartData.data.amounts || Array(12).fill(0)
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const formatCurrency = (amount) => {
    return '₹' + parseFloat(amount).toLocaleString();
  };

  const chartData = {
    labels: monthlyIncomeData.labels,
    datasets: [
      {
        data: monthlyIncomeData.values,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`
      }
    ]
  };

  if (isLoading) {
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
        {/* Header with Profile button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            {user && (
              <Text style={styles.nameText}>Hello, {user.name || user.email}</Text>
            )}
          </View>
          <View style={styles.headerButtons}>
            {/* Profile Button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <Ionicons name="person-circle-outline" size={30} color="#3b82f6" />
            </TouchableOpacity>
            {/* Logout Button */}
            <TouchableOpacity onPress={async () => {
              try {
                await logout();
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {user && user.companyName && (
          <View style={styles.companyCard}>
            <Ionicons name="business" size={24} color="#3b82f6" />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{user.companyName}</Text>
              {user.gstin && <Text style={styles.gstin}>GSTIN: {user.gstin}</Text>}
            </View>
          </View>
        )}

        <View style={styles.netIncomeContainer}>
          <Text style={styles.netIncomeText}>
            Total Business Volume ({period}): ₹{netIncome}
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`
            }}
            style={styles.chartStyle}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          <View style={[styles.card, { backgroundColor: '#D1E8E2' }]}>
            <Text style={styles.cardTitle}>Tax (GST)</Text>
            <Text style={styles.cardValue}>₹{cardData.tax}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#A9D6E5' }]}>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardValue}>₹{cardData.income}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#E2E2E2' }]}>
            <Text style={styles.cardTitle}>Savings</Text>
            <Text style={styles.cardValue}>₹{cardData.savings}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#D1E8E2' }]}>
            <Text style={styles.cardTitle}>Expenses</Text>
            <Text style={styles.cardValue}>₹{cardData.expenses}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#A9D6E5' }]}>
            <Text style={styles.cardTitle}>Investments</Text>
            <Text style={styles.cardValue}>₹{cardData.investments}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#E2E2E2' }]}>
            <Text style={styles.cardTitle}>Debt</Text>
            <Text style={styles.cardValue}>₹{cardData.debt}</Text>
          </View>
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.navigate('GstFiling')}
            >
              <Ionicons name="calculator-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>GST Filing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ItrFiling')}
            >
              <Ionicons name="receipt-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>ITR Filing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ScanUpload')}
            >
              <Ionicons name="scan-outline" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>Scan Doc</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          {dashboardData.upcomingDeadlines.map((deadline) => (
            <View key={deadline.id} style={styles.deadlineItem}>
              <View style={[
                styles.deadlineIconContainer, 
                deadline.type === 'GST' ? styles.gstIcon : styles.itrIcon
              ]}>
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
    padding: 16,
    paddingBottom: 100,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: 10,
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
  netIncomeContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  netIncomeText: {
    fontSize: 18,
    fontWeight: '600'
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  chartStyle: {
    borderRadius: 8,
  },
  cardScroll: {
    marginVertical: 16,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    marginRight: 16,
    minWidth: 150,
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 4
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold'
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
