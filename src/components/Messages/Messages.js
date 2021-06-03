import React, { useRef, useEffect } from "react";

import Message from "./Message/Message";

function Messages({ messages, name }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="messages" style={{ pointerEvents: "auto" }}>
      {messages.map((message, i) => (
        <div key={i}>
          <Message message={message} name={name} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Messages;
