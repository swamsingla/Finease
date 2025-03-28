import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const FileScreen = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    // Fetch files from the server or local storage
    // This is a placeholder for the actual fetching logic
    const fetchedFiles = [
      { id: '1', name: 'Document1.pdf' },
      { id: '2', name: 'Document2.png' },
    ];
    setFiles(fetchedFiles);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>File Management</Text>
      <Button title="Fetch Files" onPress={fetchFiles} />
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fileItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FileScreen;