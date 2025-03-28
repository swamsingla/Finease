import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../components/Auth/AuthScreen';
import DashboardScreen from '../components/Dashboard/DashboardScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;