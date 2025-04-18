import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from '../components/common/BottomNavigation.js';
import GstFilingScreen from '../components/Filings/GstFilingScreen.js';
import ItrFilingScreen from '../components/Filings/ItrFilingScreen.js';
import EpfEcrScreen from '../components/Filings/EpfEcrScreen.js';
import FilingOptionsScreen from '../components/Filings/FilingOptionsScreen.js';
import GstFormScreen from '../components/Filings/GstFormScreen.js';
import ItrFormScreen from '../components/Filings/ItrFormScreen.js';
import EpfFormScreen from '../components/Filings/EpfFormScreen.js';
import ScanUploadScreen from '../components/ScanUpload/ScanUploadScreen.js';
import EditProfileModal from '../components/Profile/EditProfileModal.js';
import InvoiceScreen from '../components/Invoice/InvoiceScreen.js';
import InvoiceCreateScreen from '../components/Invoice/InvoiceCreateScreen.js';
import EcrEpfScreen from '../components/ECR/EcrEpfScreen.js';
import EWaybillCreateScreen from '../components/EWayBill/EWaybillCreateScreen.js';
import SupportScreen from '../components/Support/SupportScreen.js'; 
import ProfileScreen from '../components/Profile/ProfileScreen.js';
import GSTScreen from '../components/ScanUpload/Gst.js';
import ITRScreen from '../components/ScanUpload/Itr.js';
import EPFFiling from '../components/ScanUpload/Pf.js';  // Update import name

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
      <Stack.Screen name="GSTFiling" component={GSTScreen} />
      <Stack.Screen name="ITRFiling" component={ITRScreen} />
      <Stack.Screen 
        name="EPFFiling" 
        component={EPFFiling} 
        options={{ title: 'EPF Filing' }} 
      />
      <Stack.Screen name="EcrEpf" component={EcrEpfScreen} />
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

