// src/components/FloatingChat.js
import React, { useState } from 'react';
import Support from './Support'; // Import your Support component

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <>
      {/* Floating button with icon to open the chat */}
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50 flex items-center justify-center"
        title="Support Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="modal-content relative bg-white rounded-lg w-11/12 max-w-md p-4">
            {/* Close button (X) in the corner */}
            <button
              onClick={closeChat}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            {/* Render the existing Support component */}
            <Support />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
