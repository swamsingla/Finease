import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ItrFilingScreen = () => {
  const { user } = useAuth();
  const [itrData, setItrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItrData();
  }, []);

  const fetchItrData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/itr/${user.id}`);
      setItrData(response.data);
    } catch (err) {
      console.error("Error fetching ITR data:", err);
      setError("Failed to fetch ITR data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ITR Filing</Text>
      {itrData ? (
        <View>
          <Text>ITR Data: {JSON.stringify(itrData)}</Text>
          {/* Add more details and functionalities as needed */}
        </View>
      ) : (
        <Text>No ITR data available.</Text>
      )}
      <Button title="Refresh" onPress={fetchItrData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ItrFilingScreen;