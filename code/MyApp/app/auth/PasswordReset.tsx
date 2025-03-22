import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Update environment variable to use Expo's convention
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      Alert.alert('Success', 'OTP sent to your email.');
      setStep(2);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');

      Alert.alert('Success', 'OTP verified. You can now reset your password.');
      setStep(3);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');

      Alert.alert('Success', 'Password reset successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Auth') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Password Reset
      </Text>
      
      {step === 1 && (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TouchableOpacity
            onPress={handleRequestOTP}
            style={{
              backgroundColor: 'blue',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Request OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      {step === 2 && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TouchableOpacity
            onPress={handleVerifyOTP}
            style={{
              backgroundColor: 'blue',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      {step === 3 && (
        <>
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TouchableOpacity
            onPress={handleResetPassword}
            style={{
              backgroundColor: 'blue',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginTop: 20, alignItems: 'center' }}
      >
        <Text style={{ color: 'blue' }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordReset;
