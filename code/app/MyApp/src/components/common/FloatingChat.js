import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChatBubble } from 'lucide-react-native'; // Assuming you have a compatible icon library

const FloatingChat = () => {
  const handleChatPress = () => {
    // Logic to open chat or navigate to chat screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChatPress} style={styles.chatButton}>
        <ChatBubble color="white" size={24} />
        <Text style={styles.chatText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    elevation: 5,
  },
  chatButton: {
    backgroundColor: '#2563eb',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  chatText: {
    color: 'white',
    marginLeft: 5,
  },
});

export default FloatingChat;