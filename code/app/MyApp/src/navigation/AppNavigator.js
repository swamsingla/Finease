import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../components/Auth/AuthScreen';
import DashboardScreen from '../components/Dashboard/DashboardScreen';
import ProfileScreen from '../components/Profile/ProfileScreen';
import EditProfileModal from '../components/Profile/EditProfileModal';
import FileScreen from '../components/FileManagement/FileScreen';
import GstFilingScreen from '../components/Filings/GstFilingScreen';
import ItrFilingScreen from '../components/Filings/ItrFilingScreen';
import EpfEcrScreen from '../components/Filings/EpfEcrScreen';
import InvoiceScreen from '../components/Invoice/InvoiceScreen';
import SupportScreen from '../components/Support/SupportScreen';
import ScanUploadScreen from '../components/ScanUpload/ScanUploadScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileModal} />
      <Stack.Screen name="Files" component={FileScreen} />
      <Stack.Screen name="GstFiling" component={GstFilingScreen} />
      <Stack.Screen name="ItrFiling" component={ItrFilingScreen} />
      <Stack.Screen name="EpfEcr" component={EpfEcrScreen} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="ScanUpload" component={ScanUploadScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;