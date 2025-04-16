import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';

const SupportScreen = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    // Add user question to conversation
    const updatedConversation = [...conversation, { sender: 'user', text: question }];
    setConversation(updatedConversation);
    setLoading(true);

    // Extract and format the last 5 messages as context (prefixed with "User:" or "Bot:")
    const contextMessages = updatedConversation
      .slice(-5)
      .map(msg => `${msg.sender === 'bot' ? 'Bot' : 'User'}: ${msg.text}`)
      .join('\n');

    try {
      const response = await fetch(
        `${Constants.expoConfig.extra.apiUrl || 'http://localhost:5000/api'}/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send both the question and context in the payload
          body: JSON.stringify({ 
            question, 
            context: contextMessages 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
      }

      const data = await response.json();
      if (data.answer) {
        setConversation((prev) => [...prev, { sender: 'bot', text: data.answer }]);
      } else {
        setConversation((prev) => [
          ...prev,
          { sender: 'bot', text: 'No answer returned from server.' },
        ]);
      }
    } catch (error) {
      console.error('Chatbot Error:', error);
      setConversation((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to support.' },
      ]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaxFile Support</Text>
      <ScrollView style={styles.conversation} contentContainerStyle={{ paddingVertical: 8 }}>
        {conversation.length === 0 && (
          <Text style={styles.hint}>
            Ask me anything about TaxFile services, tax filing, or how to use the platform!
          </Text>
        )}
        {conversation.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.sender === 'bot' ? styles.botMessage : styles.userMessage,
            ]}
          >
            <Text style={styles.senderText}>{msg.sender === 'bot' ? 'Support Bot:' : 'You:'}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your question..."
          value={question}
          onChangeText={setQuestion}
          editable={!loading}
        />
        <Button title="Send" onPress={handleSubmit} disabled={loading} />
      </View>
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
    color: '#007AFF',
  },
  conversation: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  hint: {
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D1E7DD',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8D7DA',
  },
  senderText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
});

export default SupportScreen;
