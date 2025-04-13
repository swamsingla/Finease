import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from '../components/common/BottomNavigation';
import GstFilingScreen from '../components/Filings/GstFilingScreen';
import ItrFilingScreen from '../components/Filings/ItrFilingScreen';
import EpfEcrScreen from '../components/Filings/EpfEcrScreen';
import FilingOptionsScreen from '../components/Filings/FilingOptionsScreen';
import GstFormScreen from '../components/Filings/GstFormScreen';
import ItrFormScreen from '../components/Filings/ItrFormScreen';
import EpfFormScreen from '../components/Filings/EpfFormScreen';
import ScanUploadScreen from '../components/ScanUpload/ScanUploadScreen';
import EditProfileModal from '../components/Profile/EditProfileModal';
import InvoiceScreen from '../components/Invoice/InvoiceScreen';
import InvoiceCreateScreen from '../components/Invoice/InvoiceCreateScreen';
import EWaybillCreateScreen from '../components/EWayBill/EWaybillCreateScreen.js';
import SupportScreen from '../components/Support/SupportScreen'; 
import ProfileScreen from '../components/Profile/ProfileScreen'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={BottomNavigation} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="FilingOptions" component={FilingOptionsScreen} options={{ title: 'Filing Options' }} />
      <Stack.Screen name="GstFiling" component={GstFilingScreen} options={{ title: 'GST Filing Data' }} />
      <Stack.Screen name="ItrFiling" component={ItrFilingScreen} options={{ title: 'ITR Filing Data' }} />
      <Stack.Screen name="EpfEcr" component={EpfEcrScreen} options={{ title: 'EPF ECR Generator' }} />
      <Stack.Screen name="GstForm" component={GstFormScreen} options={{ title: 'GST Filing Form' }} />
      <Stack.Screen name="ItrForm" component={ItrFormScreen} options={{ title: 'ITR Filing Form' }} />
      <Stack.Screen name="EpfForm" component={EpfFormScreen} options={{ title: 'EPF Filing Form' }} />
      <Stack.Screen name="ScanUpload" component={ScanUploadScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileModal} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="InvoiceCreate" component={InvoiceCreateScreen} />
      <Stack.Screen name="EWaybillCreate" component={EWaybillCreateScreen} />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: 'Support' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

