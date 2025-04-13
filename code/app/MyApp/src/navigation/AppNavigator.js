import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from '../components/common/BottomNavigation';
import GstFilingScreen from '../components/Filings/GstFilingScreen';
import ItrFilingScreen from '../components/Filings/ItrFilingScreen';
import EpfEcrScreen from '../components/Filings/EpfEcrScreen';
import ScanUploadScreen from '../components/ScanUpload/ScanUploadScreen';
import EditProfileModal from '../components/Profile/EditProfileModal';
import InvoiceScreen from '../components/Invoice/InvoiceScreen';
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
      <Stack.Screen name="GstFiling" component={GstFilingScreen} />
      <Stack.Screen name="ItrFiling" component={ItrFilingScreen} />
      <Stack.Screen name="EpfEcr" component={EpfEcrScreen} />
      <Stack.Screen name="ScanUpload" component={ScanUploadScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileModal} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: 'Support' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;