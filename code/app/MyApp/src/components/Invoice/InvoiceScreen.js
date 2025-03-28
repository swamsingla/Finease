import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InvoiceScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice Management</Text>
      <Text style={styles.description}>Manage your invoices here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: 'gray',
  },
});

export default InvoiceScreen;