import React, { useEffect, useState } from 'react';

const MessageDisplay = ({ websocket }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.onmessage = (event) => {
        // Logic for handling incoming messages
      };
    }
  
    return () => {
      if (websocket) {
        websocket.onmessage = null;
      }
    };
  }, [websocket]);

  return (
    <div className="message-display">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default MessageDisplay;
