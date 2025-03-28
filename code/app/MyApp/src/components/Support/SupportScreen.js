import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SupportScreen = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    // Add user question to conversation
    setConversation((prev) => [...prev, { sender: 'user', text: question }]);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
      }

      const data = await response.json();
      if (data.answer) {
        setConversation((prev) => [...prev, { sender: 'bot', text: data.answer }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support</Text>
      <View style={styles.conversation}>
        {conversation.map((msg, index) => (
          <Text key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
            {msg.text}
          </Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Ask a question..."
        value={question}
        onChangeText={setQuestion}
      />
      <Button title="Send" onPress={handleSubmit} disabled={loading} />
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
  conversation: {
    flex: 1,
    marginBottom: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
});

export default SupportScreen;