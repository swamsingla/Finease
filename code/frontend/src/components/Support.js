// src/components/Support.js
import React, { useState } from 'react';

const Support = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user question to conversation
    setConversation((prev) => [...prev, { sender: 'user', text: question }]);
    setLoading(true);

    try {
      // TODO: Update the fetch URL to match your backend route and port
      // If your backend is running at http://localhost:5000 and the route is /api/chatbot:
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

      // Check for non-OK status
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
      console.error('Chatbot Error:', error); // Debug log
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
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Support Chat</h1>
      <div className="border p-4 h-80 overflow-y-scroll mb-4 bg-gray-50">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.sender === 'bot' ? 'text-blue-600' : 'text-gray-800'}`}
          >
            <strong>{msg.sender === 'bot' ? 'Support Bot:' : 'You:'}</strong> {msg.text}
          </div>
        ))}
        {loading && <p className="text-gray-500">Generating response...</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Ask your question..."
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default Support;
