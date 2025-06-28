import React, { useState, useRef } from "react";
import socket from "../pages/socket";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Chatinput.css";

function ChatInput({ roomId }) {
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      // Save message to DB
      await axios.post(
        `https://confera.onrender.com/api/messages/${roomId}`,
        { content: message },
        { withCredentials: true }
      );

      // Emit real-time message
      socket.emit("sendMessage", {
        roomId,
        content: message,
        user, // consider emitting only necessary data
      });

      // Stop typing
      socket.emit("stopTyping", { roomId });

      setMessage("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  const handleTyping = () => {
    if (!user) return;

    socket.emit("typing", { roomId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  return (
    <div className="chat-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="chat-input-field"
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} className="chat-input-send-btn">
        Send
      </button>
    </div>
  );
}

export default ChatInput;
