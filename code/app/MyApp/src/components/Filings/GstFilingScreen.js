import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GstFilingScreen = () => {
  const { user } = useAuth();
  const [gstData, setGstData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGSTData();
  }, []);

  const fetchGSTData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gst`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setGstData(response.data);
    } catch (err) {
      console.error("Error fetching GST data:", err);
      setError("Failed to fetch GST data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>GST Filing Data:</Text>
      {gstData ? (
        <Text>{JSON.stringify(gstData)}</Text>
      ) : (
        <Text>No GST data available.</Text>
      )}
      <Button title="Refresh" onPress={fetchGSTData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GstFilingScreen;