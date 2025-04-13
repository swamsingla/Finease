// src/components/Support.js
import React, { useState } from 'react';

const Support = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Append the user's question to the conversation
    const updatedConversation = [...conversation, { sender: 'user', text: question }];
    setConversation(updatedConversation);
    setLoading(true);

    // Extract the last 5 messages and format them as "User:" or "Bot:"
    const contextMessages = updatedConversation
      .slice(-5)
      .map(msg => `${msg.sender === 'bot' ? 'Bot' : 'User'}: ${msg.text}`)
      .join('\n');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the current question and the session context to the backend
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
      const botResponse = data.answer ? data.answer : 'No answer returned from server.';

      // Append the bot's answer to the conversation
      setConversation(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setConversation(prev => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to support.' },
      ]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        TaxFile Support
      </h1>
      
      <div className="border rounded-lg p-4 h-80 overflow-y-auto mb-4 bg-gray-50 shadow-inner">
        {conversation.length === 0 && (
          <div className="text-gray-500 italic text-center py-4">
            Ask me anything about TaxFile services, tax filing, or how to use the platform!
          </div>
        )}
        
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 p-2 rounded-lg ${
              msg.sender === 'bot' 
                ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                : 'bg-gray-200 text-gray-800 ml-8'
            }`}
          >
            <div className="font-semibold">
              {msg.sender === 'bot' ? 'Support Bot:' : 'You:'}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center text-blue-600 p-2">
            <div className="animate-bounce mr-2">●</div>
            <div className="animate-bounce mr-2" style={{animationDelay: '0.2s'}}>●</div>
            <div className="animate-bounce" style={{animationDelay: '0.4s'}}>●</div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask your question..."
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Support;
