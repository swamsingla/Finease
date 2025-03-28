import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../Dashboard/DashboardScreen';
import ScanUploadScreen from '../ScanUpload/ScanUploadScreen';
import FileScreen from '../FileManagement/FileScreen';
import InvoiceScreen from '../Invoice/InvoiceScreen';
import ProfileScreen from '../Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'File') {
          iconName = 'document-text';
        } else if (route.name === 'Upload') {
          iconName = 'cloud-upload';
        } else if (route.name === 'Invoice') {
          iconName = 'receipt';
        }
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isFocused ? '#2563eb' : '#6b7280'} 
            />
            <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomNavigation = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
      />
      <Tab.Screen 
        name="File" 
        component={FileScreen} 
      />
      <Tab.Screen 
        name="Upload" 
        component={ScanUploadScreen} 
      />
      <Tab.Screen 
        name="Invoice" 
        component={InvoiceScreen} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 2,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
});

export default BottomNavigation;