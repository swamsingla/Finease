import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Import permission-related packages
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        const { status: cameraStatus } = await Camera.Camera.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        const { status: contactStatus } = await Contacts.requestPermissionsAsync();

        if (
          cameraStatus !== 'granted' ||
          locationStatus !== 'granted' ||
          mediaStatus !== 'granted' ||
          notificationStatus !== 'granted' ||
          contactStatus !== 'granted'
        ) {
          Alert.alert('Permissions not granted', 'Some permissions were not granted.');
        }
      } catch (error) {
        console.error('Error requesting permissions', error);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
