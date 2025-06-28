// import React, { useEffect, useRef, useState } from "react";
// import ChatInput from "../components/ChatInput";
// import socket from "../socket";
// import { useSelector } from "react-redux";

// export default function ChatWindow({ roomId }) {
//   const reduxUser = useSelector((state) => state.auth.user);
//   const [messages, setMessages] = useState([]);
//   const bottomRef = useRef(null);
//   const [isTyping, setIsTyping] = useState(false);

//   // Scroll to bottom when messages update
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!reduxUser || !roomId) return;

//     // Join the room
//     socket.emit("joinRoom", { roomId, user: reduxUser });

//     // Load previous messages
//     fetch(`http://localhost:5000/api/messages/${roomId}`, {
//       credentials: "include",
//     })
//       .then((res) => res.json())
//       .then((data) => setMessages(data))
//       .catch((err) => console.error("Load messages failed:", err));

//     // Listen for new chat messages
//     socket.on("newMessage", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     // Append system message when user joins
//     socket.on("userJoined", ({ name }) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: `${name} joined the room`,
//           system: true,
//           timestamp: Date.now(),
//         },
//       ]);
//     });

//     // Append system message when user leaves
//     socket.on("userLeft", ({ name }) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: `${name} left the room`,
//           system: true,
//           timestamp: Date.now(),
//         },
//       ]);
//     });

//     // Typing status
//     socket.on("typing", () => {
//       setIsTyping(true);
//     });

//     socket.on("stopTyping", () => {
//       setIsTyping(false);
//     });

//     return () => {
//       socket.emit("leaveRoom", { roomId, user: reduxUser });

//       socket.off("newMessage");
//       socket.off("userJoined");
//       socket.off("userLeft");
//       socket.off("typing");
//       socket.off("stopTyping");
//     };
//   }, [roomId, reduxUser]);

//   return (
//     <div className="bg-gray-100 rounded-lg shadow p-4 h-[500px] flex flex-col">
//       <div className="flex-1 overflow-y-auto space-y-3 mb-3">
//         {messages.map((msg, index) => (
//           <div key={index}>
//             {msg.system ? (
//               <div className="text-center text-gray-500 text-sm italic">
//                 {msg.content}
//               </div>
//             ) : (
//               <div
//                 className={`p-2 rounded ${
//                   msg.sender?._id === reduxUser._id
//                     ? "bg-blue-500 text-white self-end"
//                     : "bg-white text-black self-start"
//                 } max-w-[70%]`}
//               >
//                 <div className="text-sm font-semibold">
//                   {msg.sender?.displayName}
//                 </div>
//                 <div>{msg.content}</div>
//                 <div className="text-xs text-gray-400 mt-1">
//                   {new Date(msg.timestamp).toLocaleTimeString()}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//         <div ref={bottomRef}></div>
//       </div>

//       {isTyping && (
//         <div className="text-gray-500 text-sm italic text-center">
//           Someone is typing...
//         </div>
//       )}

//       <ChatInput roomId={roomId} />
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import ChatInput from "../components/ChatInput";
// import socket from "./socket";
// import { useSelector } from "react-redux";
// import "./ChatWindow.css";

// export default function ChatWindow({ roomId }) {
//   const reduxUser = useSelector((state) => state.auth.user);
//   const [messages, setMessages] = useState([]);
//   const bottomRef = useRef(null);
//   const [isTyping, setIsTyping] = useState(false);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!reduxUser || !roomId) return;

//     socket.emit("joinRoom", { roomId, user: reduxUser });

//     fetch(`http://localhost:5000/api/messages/${roomId}`, {
//       credentials: "include",
//     })
//       .then((res) => res.json())
//       .then((data) => setMessages(data))
//       .catch((err) => console.error("Load messages failed:", err));

//     socket.on("newMessage", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     socket.on("userJoined", ({ name }) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: `${name} joined the room`,
//           system: true,
//           timestamp: Date.now(),
//         },
//       ]);
//     });

//     socket.on("userLeft", ({ name }) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: `${name} left the room`,
//           system: true,
//           timestamp: Date.now(),
//         },
//       ]);
//     });

//     socket.on("typing", () => setIsTyping(true));
//     socket.on("stopTyping", () => setIsTyping(false));

//     return () => {
//       socket.emit("leaveRoom", { roomId, user: reduxUser });

//       socket.off("newMessage");
//       socket.off("userJoined");
//       socket.off("userLeft");
//       socket.off("typing");
//       socket.off("stopTyping");
//     };
//   }, [roomId, reduxUser]);

//   return (
//     <div className="chat-window-container">
//       <div className="messages-container">
//         {messages.map((msg, index) => (
//           <div key={index} className="message-wrapper">
//             {msg.system ? (
//               <div className="system-message">{msg.content}</div>
//             ) : (
//               <div
//                 className={`message-bubble ${
//                   msg.sender?._id === reduxUser._id
//                     ? "message-outgoing"
//                     : "message-incoming"
//                 }`}
//               >
//                 <div className="message-sender">{msg.sender?.displayName}</div>
//                 <div className="message-content">{msg.content}</div>
//                 <div className="message-timestamp">
//                   {new Date(msg.timestamp).toLocaleTimeString()}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//         <div ref={bottomRef}></div>
//       </div>

//       {isTyping && <div className="typing-indicator">Someone is typing...</div>}

//       <ChatInput roomId={roomId} />
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import ChatInput from "../components/ChatInput";
import socket from "./socket";
import { useSelector } from "react-redux";
import "./ChatWindow.css";

export default function ChatWindow({ roomId }) {
  const reduxUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!reduxUser || !roomId) return;

    socket.emit("joinRoom", { roomId, user: reduxUser });

    fetch(`http://localhost:5000/api/messages/${roomId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Load messages failed:", err));

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("userJoined", ({ name }) => {
      setMessages((prev) => [
        ...prev,
        {
          content: `${name} joined the room`,
          system: true,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on("userLeft", ({ name }) => {
      setMessages((prev) => [
        ...prev,
        {
          content: `${name} left the room`,
          system: true,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.emit("leaveRoom", { roomId, user: reduxUser });
      socket.off("newMessage");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [roomId, reduxUser]);

  return (
    <div className="chat-window-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message-wrapper">
            {msg.system ? (
              <div className="system-message">{msg.content}</div>
            ) : (
              <div
                className={`message-bubble ${
                  msg.sender?._id === reduxUser._id
                    ? "message-outgoing"
                    : "message-incoming"
                }`}
              >
                <div className="message-sender">
                  {msg.sender?.displayName || "Anonymous"}
                </div>
                <div className="message-content">{msg.content}</div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {isTyping && <div className="typing-indicator">Someone is typing...</div>}

      <ChatInput roomId={roomId} />
    </div>
  );
}
