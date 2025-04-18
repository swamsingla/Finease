import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/AuthPage" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/DashboardPage" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/FilePage" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/UploadPage" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/InvoicePage" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
