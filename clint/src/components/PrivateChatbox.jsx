// import React, { useEffect, useState, useRef } from "react";
// import socket from "../socket";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import "./PrivateChatBox.css";

// export default function PrivateChatBox({ selectedUser, roomId, onClose }) {
//   const [allPrivateMessages, setAllPrivateMessages] = useState([]);
//   const [text, setText] = useState("");
//   const user = useSelector((state) => state.auth.user);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [allPrivateMessages]);

//   // Fetch messages
//   useEffect(() => {
//     if (!selectedUser || !user) {
//       setAllPrivateMessages([]);
//       return;
//     }

//     axios
//       .get(
//         `http://localhost:5000/api/private/${roomId}/${user._id}/${selectedUser._id}`,
//         { withCredentials: true }
//       )
//       .then((res) => {
//         if (Array.isArray(res.data)) {
//           setAllPrivateMessages(res.data);
//         } else {
//           setAllPrivateMessages([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching private messages:", err);
//         setAllPrivateMessages([]);
//       });
//   }, [selectedUser, roomId, user, onClose]);

//   // Listen for messages
//   useEffect(() => {
//     if (!user) return;

//     const handleReceivePrivateMessage = (msg) => {
//       const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;

//       if (selectedUser && otherUserId === selectedUser._id) {
//         setAllPrivateMessages((prev) => [...prev, msg]);

//         // Send seen status
//         if (msg.receiver === user._id) {
//           socket.emit("markAsSeen", {
//             messageId: msg._id,
//             roomId,
//             senderId: msg.sender,
//             receiverId: msg.receiver,
//           });
//         }
//       }
//     };

//     socket.on("receivePrivateMessage", handleReceivePrivateMessage);

//     // Seen mark listener
//     socket.on("messageSeen", ({ messageId }) => {
//       setAllPrivateMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, seen: true } : msg
//         )
//       );
//     });

//     return () => {
//       socket.off("receivePrivateMessage", handleReceivePrivateMessage);
//       socket.off("messageSeen");
//     };
//   }, [user, selectedUser]);

//   // Send message
//   const sendMessage = () => {
//     if (!text.trim() || !selectedUser || !user) return;

//     const msg = {
//       roomId,
//       senderId: user._id,
//       receiverId: selectedUser._id,
//       message: text,
//     };

//     socket.emit("privateMessage", msg);
//     setText("");
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
//         <button className="close-button" onClick={onClose}>
//           ×
//         </button>
//         <h2 className="chat-header">
//           Chat with {selectedUser?.displayName || "User"}
//         </h2>

//         <div
//           className="chat-messages"
//           style={{ overflowY: "auto", maxHeight: "400px" }}
//         >
//           {allPrivateMessages.length === 0 && (
//             <div className="no-messages">No messages yet</div>
//           )}

//           {allPrivateMessages.map((msg, i) => (
//             <div
//               key={i}
//               className={`chat-bubble ${
//                 msg.sender === user._id
//                   ? "chat-bubble-sent"
//                   : "chat-bubble-received"
//               }`}
//             >
//               {msg.message}
//               <div className="chat-timestamp">
//                 {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
//                 {msg.sender === user._id && msg.seen && (
//                   <span className="seen-check"> ✅</span>
//                 )}
//               </div>
//             </div>
//           ))}

//           <div ref={messagesEndRef} />
//         </div>

//         <div className="chat-input-area">
//           <input
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             className="chat-input"
//             placeholder="Type your message"
//             onKeyDown={(e) => {
//               if (e.key === "Enter") sendMessage();
//             }}
//           />
//           <button onClick={sendMessage} className="chat-send-button">
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import socket from "../pages/socket";
import axios from "axios";
import { useSelector } from "react-redux";
import "./PrivateChatBox.css";

export default function PrivateChatBox({ selectedUser, roomId, onClose }) {
  const [allPrivateMessages, setAllPrivateMessages] = useState([]);
  const [text, setText] = useState("");
  const user = useSelector((state) => state.auth.user);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allPrivateMessages]);

  // Fetch private messages
  useEffect(() => {
    if (!selectedUser || !user) {
      setAllPrivateMessages([]);
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/private/${roomId}/${user._id}/${selectedUser._id}`,
        { withCredentials: true }
      )
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllPrivateMessages(res.data);
        } else {
          setAllPrivateMessages([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching private messages:", err);
        setAllPrivateMessages([]);
      });
  }, [selectedUser, roomId, user, onClose]);

  // Emit markAsSeen once when chat opens
  useEffect(() => {
    if (selectedUser && user) {
      socket.emit("markAsSeen", {
        roomId,
        senderId: selectedUser._id, // sender is other user
        receiverId: user._id, // you are the receiver
      });
    }
  }, [selectedUser]);

  // Listen for new private messages
  useEffect(() => {
    if (!user) return;

    const handleReceivePrivateMessage = (msg) => {
      const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;

      if (selectedUser && otherUserId === selectedUser._id) {
        setAllPrivateMessages((prev) => [...prev, msg]);

        if (msg.receiver === user._id) {
          socket.emit("markAsSeen", {
            roomId,
            senderId: msg.sender,
            receiverId: msg.receiver,
          });
        }
      }
    };

    const handleMessagesSeen = ({ receiverId, roomId }) => {
      setAllPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.receiver === receiverId ? { ...msg, seen: true } : msg
        )
      );
    };

    socket.on("receivePrivateMessage", handleReceivePrivateMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("receivePrivateMessage", handleReceivePrivateMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [user, selectedUser]);

  // Send message
  const sendMessage = () => {
    if (!text.trim() || !selectedUser || !user) return;

    const msg = {
      roomId,
      senderId: user._id,
      receiverId: selectedUser._id,
      message: text,
    };

    socket.emit("privateMessage", msg);
    setText("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2 className="chat-header">
          Chat with {selectedUser?.displayName || "User"}
        </h2>

        <div
          className="chat-messages"
          style={{ overflowY: "auto", maxHeight: "400px" }}
        >
          {allPrivateMessages.length === 0 && (
            <div className="no-messages">No messages yet</div>
          )}

          {allPrivateMessages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${
                msg.sender === user._id
                  ? "chat-bubble-sent"
                  : "chat-bubble-received"
              }`}
            >
              {msg.message}
              <div className="chat-timestamp">
                {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                {msg.sender === user._id && (
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      color: msg.seen ? "#0b93f6" : "gray",
                    }}
                  >
                    ✓✓
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="chat-input"
            placeholder="Type your message"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage} className="chat-send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
