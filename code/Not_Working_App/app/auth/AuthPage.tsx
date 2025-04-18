import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

// Update environment variable to use Expo's convention
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleAuth = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (!isLogin && !companyName.trim()) {
      Alert.alert('Error', 'Company Name is required');
      return;
    }
    if (!isLogin && !gstin.trim()) {
      Alert.alert('Error', 'GSTIN is required');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, companyName, gstin };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');

      if (isLogin) {
        // Pass the full user object and token to the login function
        await login(data.user, data.token);
        Alert.alert('Success', 'Login successful!');
        navigation.navigate('dashboard/DashboardPage');
      } else {
        Alert.alert('Success', 'Registration successful! Please login.');
        setIsLogin(true);
        // Clear registration fields
        setCompanyName('');
        setGstin('');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? 'Login' : 'Register'}
      </Text>
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <TextInput
            style={styles.input}
            placeholder="GSTIN"
            value={gstin}
            onChangeText={setGstin}
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Login' : 'Register'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
      {isLogin && (
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => navigation.navigate('PasswordReset')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#2563eb',
    fontSize: 14,
  },
  forgotButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 14,
  }
});

export default AuthPage;
