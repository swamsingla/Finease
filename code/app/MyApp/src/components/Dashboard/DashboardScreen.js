import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';




// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');





// =============================================================================
// MAIN DASHBOARD SCREEN COMPONENT
// =============================================================================
const DashboardScreen = () => {

  // ------------------------------
  // AUTHENTICATION & NAVIGATION
  // ------------------------------
  const { user, token, logout } = useAuth();
  const navigation = useNavigation();





  // ------------------------------
  // STATE DECLARATIONS
  // ------------------------------
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    netIncome: 0,
    totalGST: 0,
    totalDocuments: 0,
    potentialSavings: 0,
    daysRemaining: 0,
  });

  const [cardData, setCardData] = useState({
    tax: "0.00",
    income: "0.00",
    expenses: "0.00",
    debt: "0.00",
    investments: "0.00",
    savings: "0.00",
  });

  const [monthlyIncomeData, setMonthlyIncomeData] = useState({
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    values: Array(12).fill(0),
  });

  const [period, setPeriod] = useState("yearly");

  // ------------------------------
  // NOTIFICATIONS MODAL STATE
  // ------------------------------
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState("");





  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  /**
   * calculateDaysRemaining()
   *
   * Returns the number of days remaining until July 31st.
   */
  const calculateDaysRemaining = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let deadline = new Date(currentYear, 6, 31); // Month is 0-indexed; 6 means July.
    if (today > deadline) {
      deadline = new Date(currentYear + 1, 6, 31);
    }
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  };

  /**
   * formatCurrency(amount)
   *
   * Formats a number into an Indian Rupee currency string.
   */
  const formatCurrency = (amount) => {
    return "₹" + Number(amount).toLocaleString();
  };





  // =============================================================================
  // DATA FETCHING: DASHBOARD DATA
  // =============================================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const configStats = {
          headers: { Authorization: `Bearer ${token}` },
          params: period === "monthly" ? { year: currentYear, month: currentMonth } : { year: currentYear },
        };

        console.log("Fetching dashboard stats with config:", configStats);
        const statsResponse = await axios.get(
          `${BASE_URL}/dashboard/document-statistics`,
          configStats
        );

        const chartResponse = await axios.get(
          `${BASE_URL}/dashboard/monthly-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: currentYear },
          }
        );

        const statsData = statsResponse.data.statistics;
        console.log("Stats Data:", statsData);

        const monthlyData = chartResponse.data.monthlyData.data;
        console.log("Monthly Chart Data:", monthlyData);

        // Helper: Calculate yearly totals.
        const calcYearlyData = (data) => {
          let totalTax = 0, totalIncome = 0, totalDocs = 0;
          data.amounts.forEach((amount) => totalIncome += amount);
          data.taxes.forEach((tax) => totalTax += tax);
          data.totalCounts.forEach((count) => totalDocs += count);
          return { tax: totalTax, income: totalIncome, documents: totalDocs };
        };
        const yearlyData = calcYearlyData(monthlyData);

        // Helper: Calculate current month summary.
        const calcMonthlyData = (data, index) => ({
          tax: data.taxes[index],
          income: data.amounts[index],
          documents: data.totalCounts[index],
        });
        const monthlySummary = calcMonthlyData(monthlyData, currentMonth - 1);

        if (period === "yearly") {
          setDashboardStats({
            netIncome: yearlyData.income.toFixed(2),
            totalGST: yearlyData.tax.toFixed(2),
            totalDocuments: yearlyData.documents,
            potentialSavings: (yearlyData.tax * 0.1).toFixed(2),
            daysRemaining: calculateDaysRemaining(),
          });

          const yearlyIncome = yearlyData.income;
          const yearlyTax = yearlyData.tax;
          const expenses = yearlyIncome * 0.65;
          const debt = yearlyIncome * 0.28;
          const operatingProfit = yearlyIncome - expenses - yearlyTax;
          const investments = operatingProfit * 0.4;
          const savings = operatingProfit - investments;
          setCardData({
            tax: yearlyTax.toFixed(2),
            income: yearlyIncome.toFixed(2),
            expenses: expenses.toFixed(2),
            debt: debt.toFixed(2),
            investments: investments.toFixed(2),
            savings: savings.toFixed(2),
          });
        } else {
          setDashboardStats({
            netIncome: monthlySummary.income.toFixed(2),
            totalGST: monthlySummary.tax.toFixed(2),
            totalDocuments: monthlySummary.documents,
            potentialSavings: (monthlySummary.tax * 0.1).toFixed(2),
            daysRemaining: calculateDaysRemaining(),
          });

          const monthlyIncome = monthlySummary.income;
          const monthlyTax = monthlySummary.tax;
          const expenses = monthlyIncome * 0.65;
          const debt = monthlyIncome * 0.28;
          const operatingProfit = monthlyIncome - expenses - monthlyTax;
          const investments = operatingProfit * 0.4;
          const savings = operatingProfit - investments;
          setCardData({
            tax: monthlyTax.toFixed(2),
            income: monthlyIncome.toFixed(2),
            expenses: expenses.toFixed(2),
            debt: debt.toFixed(2),
            investments: investments.toFixed(2),
            savings: savings.toFixed(2),
          });
        }

        if (chartResponse.data && chartResponse.data.monthlyData) {
          const chartData = chartResponse.data.monthlyData;
          setMonthlyIncomeData({
            labels: chartData.labels || [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            values: chartData.data.amounts || Array(12).fill(0),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setMonthlyIncomeData({
          labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
          values: Array(12).fill(0),
        });
        setDashboardStats({
          netIncome: "0.00",
          totalGST: "0.00",
          totalDocuments: 0,
          potentialSavings: "0.00",
          daysRemaining: calculateDaysRemaining(),
        });
        setCardData({
          tax: "0.00",
          income: "0.00",
          expenses: "0.00",
          debt: "0.00",
          investments: "0.00",
          savings: "0.00",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, token]);





  // =============================================================================
  // DATA FETCHING: NOTIFICATIONS (MODAL)
  // =============================================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotifLoading(true);
        setNotifError("");
        const notifURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        console.log("Fetching notifications from:", `${notifURL}/auth/notifications`);
        const response = await fetch(`${notifURL}/auth/notifications`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch notifications");
        }
        const data = await response.json();
        console.log("Notifications fetched:", data.notifications);
        setNotifications(data.notifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifError(err.message);
      } finally {
        setNotifLoading(false);
      }
    };

    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, token]);





  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };





  // =============================================================================
  // RENDER: NOTIFICATIONS MODAL
  // =============================================================================
  const renderNotificationsModal = () => {
    return (
      <Modal
        transparent
        animationType="slide"
        visible={showNotifications}
        onRequestClose={toggleNotifications}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={toggleNotifications}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {notifLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : notifError ? (
              <Text style={styles.errorText}>{notifError}</Text>
            ) : notifications.length === 0 ? (
              <Text style={styles.infoText}>No notifications found.</Text>
            ) : (
              <ScrollView style={styles.notifList}>
                {notifications.map((notif, index) => (
                  <View key={index} style={styles.notifCard}>
                    <Text style={styles.notifType}>{notif.type}</Text>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={toggleNotifications}>
              <Text style={styles.closeButtonText}>Close Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };





  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="person-circle-outline" size={32} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.greeting}>
              Hey, {user?.companyName || user?.name || "User"}
            </Text>
          </View>
          {/* LOGOUT BUTTON */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* COMPANY INFO */}
        {user && user.companyName && (
          <View style={styles.companyCard}>
            <Ionicons name="business" size={24} color="#3b82f6" />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{user.companyName}</Text>
              {user.gstin && <Text style={styles.gstin}>GSTIN: {user.gstin}</Text>}
            </View>
          </View>
        )}

        {/* TOTAL BUSINESS VOLUME & CHART */}
        <View style={styles.netIncomeContainer}>
          <Text style={styles.netIncomeText}>
            Total Business Volume ({period}): {formatCurrency(dashboardStats.netIncome)}
          </Text>
        </View>
        <ScrollView horizontal contentContainerStyle={styles.chartContainer}>
          <BarChart
            data={{
              labels: monthlyIncomeData.labels,
              datasets: [{ data: monthlyIncomeData.values }],
            }}
            width={Dimensions.get("window").width * 0.9}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" },
            }}
            style={styles.chartStyle}
            fromZero
            showValuesOnTopOfBars
          />
        </ScrollView>

        {/* CENTERED FINANCIAL CARD BOXES */}
        <View style={styles.placardContainer}>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Tax (GST)</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.tax)}</Text>
          </View>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Income</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.income)}</Text>
          </View>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Savings</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.savings)}</Text>
          </View>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Expenses</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.expenses)}</Text>
          </View>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Investments</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.investments)}</Text>
          </View>
          <View style={[styles.placard, styles.centeredPlacard]}>
            <Text style={styles.placardTitle}>Debt</Text>
            <Text style={styles.placardValue}>{formatCurrency(cardData.debt)}</Text>
          </View>
        </View>

        {/* DEADLINES BUTTON (which opens the notifications modal) */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deadlinesButton} onPress={toggleNotifications}>
            <Text style={styles.deadlinesButtonText}>Deadlines</Text>
          </TouchableOpacity>
        </View>

        {/* SUPPORT CARD */}
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => navigation.navigate("Support")}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="white" />
          <Text style={styles.supportText}>Need help with tax filing?</Text>
          <Text style={styles.supportAction}>Ask questions to the support chatbot!</Text>
        </TouchableOpacity>
      </View>

      {/* RENDER NOTIFICATIONS MODAL */}
      {renderNotificationsModal()}
    </ScrollView>
  );
};





// =============================================================================
// NAVIGATION ITEM COMPONENT (IF USED ELSEWHERE)
// =============================================================================
const NavItem = ({ icon, label, onPress, active }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    {icon}
    <Text style={[styles.navLabel, { color: active ? "#2563eb" : "#4b5563" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);





// =============================================================================
// STYLES
// =============================================================================
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f7ff",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#3b82f6",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    marginLeft: 10,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
  },
  companyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#1f2937",
  },
  gstin: {
    fontSize: 14,
    color: "#6b7280",
  },
  netIncomeContainer: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  netIncomeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  chartStyle: {
    borderRadius: 16,
  },
  placardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 16,
  },
  placard: {
    width: 150,
    padding: 12,
    borderRadius: 8,
    margin: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredPlacard: {
    alignSelf: "center",
  },
  placardTitle: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    textAlign: "center",
  },
  placardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginVertical: 16,
  },
  deadlinesButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
  },
  deadlinesButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  supportText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "white",
  },
  supportAction: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  notifList: {
    maxHeight: 300,
  },
  notifCard: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  notifType: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
  },
  navItem: {
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

// Debugging Helpers:
const logDashboardStats = () => {
  console.log("Dashboard Stats:", dashboardStats);
  console.log("Card Data:", cardData);
  console.log("Monthly Income Data:", monthlyIncomeData);
};

// Refresh helper (to be integrated with a pull-to-refresh in the future)
const refreshDashboard = async () => {
  console.log("Refreshing dashboard data...");
  // Refresh logic can be added here.
  console.log("Dashboard data refreshed.");
};

export default DashboardScreen;
