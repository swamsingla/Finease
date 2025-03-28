import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../components/Auth/AuthScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="Login" 
        component={AuthScreen} 
        options={{ title: 'Login' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;