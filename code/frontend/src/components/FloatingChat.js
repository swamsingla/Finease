// src/components/FloatingChat.js
import React, { useState } from 'react';
import Support from './Support'; // Import your Support component

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <>
      {/* Floating button to open the chat */}
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        Chat
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
