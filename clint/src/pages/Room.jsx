// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ChatWindow from "./ChatWindow.jsx";
// import socket from "./socket";
// import PrivateChatBox from "../components/PrivateChatBox";
// import { useSelector } from "react-redux";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Room.css";
// import GroupCall from "./GroupCall.jsx";

// function Room() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const [room, setRoom] = useState(null);
//   const user = useSelector((state) => state.auth.user);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showChat, setShowChat] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   // const [showVideoCall, setShowVideoCall] = useState(false);
//   const [groupChat, setGroupChat] = useState(false);

//   useEffect(() => {
//     if (user?._id) {
//       socket.emit("userConnected", user._id);
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchRoom = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/rooms/join/${roomId}`,
//           { withCredentials: true }
//         );
//         setRoom(res.data);
//       } catch (error) {
//         console.error("Failed to load room", error);
//         navigate("/rooms");
//       }
//     };

//     fetchRoom();

//     socket.on("membersUpdate", (members) => {
//       setRoom((prevRoom) => {
//         if (!prevRoom) return prevRoom;
//         const formattedMembers = members.map((m) => ({
//           _id: m.userId,
//           displayName: m.displayName,
//         }));
//         return { ...prevRoom, members: formattedMembers };
//       });
//     });

//     socket.on("userJoined", ({ name }) => {
//       console.log(`${name} joined the room`);
//     });

//     socket.on("userLeft", ({ name }) => {
//       console.log(`${name} left the room`);
//     });

//     socket.on("onlineUsersUpdate", (userIds) => {
//       setOnlineUsers(userIds);
//     });

//     return () => {
//       socket.off("membersUpdate");
//       socket.off("userJoined");
//       socket.off("userLeft");
//       socket.off("onlineUsersUpdate");
//     };
//   }, [roomId, navigate]);

//   useEffect(() => {
//     if (!user) return;

//     const handlePrivateMessage = (msg) => {
//       const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;

//       if (!selectedUser || selectedUser._id !== otherUserId) {
//         setUnreadCounts((prev) => ({
//           ...prev,
//           [otherUserId]: (prev[otherUserId] || 0) + 1,
//         }));

//         const senderName =
//           room?.members.find((m) => m._id === msg.sender)?.displayName ||
//           "Someone";

//         toast.info(`📩 New message from ${senderName}`, {
//           toastId: `${otherUserId}-${Date.now()}`,
//           position: "top-right",
//           autoClose: 3000,
//           pauseOnHover: true,
//           closeOnClick: true,
//           draggable: true,
//         });
//       }
//     };

//     socket.on("receivePrivateMessage", handlePrivateMessage);

//     return () => {
//       socket.off("receivePrivateMessage", handlePrivateMessage);
//     };
//   }, [selectedUser, user, room]);

//   useEffect(() => {
//     if (selectedUser) {
//       setUnreadCounts((prev) => ({
//         ...prev,
//         [selectedUser._id]: 0,
//       }));
//     }
//   }, [selectedUser]);

//   if (!room) return <div className="room-loading">Loading room...</div>;

//   return (
//     <div className="room-container">
//       <header className="room-header">
//         <div className="room-info">
//           <h2 className="room-name">{room.name}</h2>
//           <p className="room-members">
//             <span>{room.members.length}</span> user
//             {room.members.length !== 1 ? "s" : ""} joined room:{" "}
//             {room.members.length > 0
//               ? room.members.map((m) => m.displayName).join(", ")
//               : "No members"}
//           </p>
//         </div>
//         <button
//           className="btn btn-back"
//           onClick={() => navigate("/rooms")}
//           aria-label="Back to Rooms"
//         >
//           🔙 Back to Rooms
//         </button>
//       </header>

//       <main className="room-main">
//         <aside className="room-users">
//           <h3 className="users-title">Users in Room</h3>
//           {room.members
//             .filter((m) => m._id !== user._id)
//             .map((m) => (
//               <div
//                 key={m._id}
//                 onClick={() => {
//                   setSelectedUser(m);
//                   setShowChat(true);
//                 }}
//                 className={`user-item ${
//                   selectedUser?._id === m._id ? "selected" : ""
//                 }`}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     setSelectedUser(m);
//                     setShowChat(true);
//                   }
//                 }}
//               >
//                 <div className="user-info">
//                   <span
//                     className={`status-dot ${
//                       onlineUsers.includes(m._id) ? "online" : "offline"
//                     }`}
//                     title={onlineUsers.includes(m._id) ? "Online" : "Offline"}
//                   ></span>
//                   {m.displayName}
//                 </div>
//                 {unreadCounts[m._id] > 0 && (
//                   <span className="unread-badge">{unreadCounts[m._id]}</span>
//                 )}
//               </div>
//             ))}
//         </aside>

//         <section className="room-chat">
//           {selectedUser && showChat ? (
//             <PrivateChatBox
//               selectedUser={selectedUser}
//               roomId={roomId}
//               onClose={() => setShowChat(false)}
//             />
//           ) : (
//             <></>
//           )}
//         </section>
//         <section className="room-video">
//           <GroupCall
//             username={user.displayName}
//             roomId={roomId}
//             socket={socket}
//             groupChat={groupChat}
//             setGroupChat={setGroupChat}
//           />
//           <div
//             className={`group-chat `}
//             style={{ display: groupChat == true ? "block" : "none" }}
//           >
//             <ChatWindow roomId={roomId} />
//           </div>
//         </section>
//       </main>

//       <ToastContainer />
//     </div>
//   );
// }

// export default Room;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ChatWindow from "./ChatWindow.jsx";
// import socket from "./socket";
// import PrivateChatBox from "../components/PrivateChatBox";
// import { useSelector } from "react-redux";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Room.css";
// import GroupCall from "./GroupCall.jsx";

// function Room() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const [room, setRoom] = useState(null);
//   const user = useSelector((state) => state.auth.user);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showChat, setShowChat] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [groupChat, setGroupChat] = useState(false);
//   const [showJoinedUsers, setShowJoinedUsers] = useState(true);

//   useEffect(() => {
//     if (user?._id) {
//       socket.emit("userConnected", user._id);
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchRoom = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/rooms/join/${roomId}`,
//           { withCredentials: true }
//         );
//         setRoom(res.data);
//       } catch (error) {
//         console.error("Failed to load room", error);
//         navigate("/rooms");
//       }
//     };

//     fetchRoom();

//     socket.on("membersUpdate", (members) => {
//       setRoom((prevRoom) => {
//         if (!prevRoom) return prevRoom;
//         const formatted = members.map((m) => ({
//           _id: m.userId,
//           displayName: m.displayName,
//         }));
//         return { ...prevRoom, members: formatted };
//       });
//     });

//     socket.on("userJoined", ({ name }) => {
//       console.log(`${name} joined the room`);
//     });

//     socket.on("userLeft", ({ name }) => {
//       console.log(`${name} left the room`);
//     });

//     socket.on("onlineUsersUpdate", (userIds) => {
//       setOnlineUsers(userIds);
//     });

//     return () => {
//       socket.off("membersUpdate");
//       socket.off("userJoined");
//       socket.off("userLeft");
//       socket.off("onlineUsersUpdate");
//     };
//   }, [roomId, navigate]);

//   useEffect(() => {
//     if (!user) return;

//     const handlePrivateMessage = (msg) => {
//       const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;

//       if (!selectedUser || selectedUser._id !== otherUserId) {
//         setUnreadCounts((prev) => ({
//           ...prev,
//           [otherUserId]: (prev[otherUserId] || 0) + 1,
//         }));

//         const senderName =
//           room?.members.find((m) => m._id === msg.sender)?.displayName ||
//           "Someone";

//         toast.info(`📩 New message from ${senderName}`, {
//           toastId: `${otherUserId}-${Date.now()}`,
//           position: "top-right",
//           autoClose: 3000,
//         });
//       }
//     };

//     socket.on("receivePrivateMessage", handlePrivateMessage);

//     return () => {
//       socket.off("receivePrivateMessage", handlePrivateMessage);
//     };
//   }, [selectedUser, user, room]);

//   useEffect(() => {
//     if (selectedUser) {
//       setUnreadCounts((prev) => ({
//         ...prev,
//         [selectedUser._id]: 0,
//       }));
//     }
//   }, [selectedUser]);

//   if (!room) return <div className="room-loading">Loading room...</div>;

//   return (
//     <div className="room-container">
//       {/* Header */}
//       <header className="room-header">
//         <div className="room-info">
//           <h2 className="room-name">{room.name}</h2>
//           <p className="room-members">
//             <span>{room.members.length}</span> user
//             {room.members.length !== 1 ? "s" : ""} joined room:
//             {room.members.map((m) => m.displayName).join(", ")}
//           </p>
//         </div>
//         <button className="btn btn-back" onClick={() => navigate("/rooms")}>
//           🔙 Back to Rooms
//         </button>
//       </header>

//       {/* Main Layout */}
//       <main className="room-main">
//         {/* Sidebar with Toggle */}
//         <aside className="room-sidebar">
//           <div className="toggle-section">
//             <button
//               className={`toggle-btn ${showJoinedUsers ? "active" : ""}`}
//               onClick={() => setShowJoinedUsers(true)}
//             >
//               👥 Joined Users
//             </button>
//             <button
//               className={`toggle-btn ${!showJoinedUsers ? "active" : ""}`}
//               onClick={() => setShowJoinedUsers(false)}
//             >
//               💬 All Users
//             </button>
//           </div>

//           <div className="user-list">
//             {room.members
//               .filter((m) => m._id !== user._id)
//               .map((m) => (
//                 <div
//                   key={m._id}
//                   onClick={() => {
//                     setSelectedUser(m);
//                     setShowChat(true);
//                   }}
//                   className={`user-item ${
//                     selectedUser?._id === m._id ? "selected" : ""
//                   }`}
//                 >
//                   <div className="user-info">
//                     <span
//                       className={`status-dot ${
//                         onlineUsers.includes(m._id) ? "online" : "offline"
//                       }`}
//                     ></span>
//                     {m.displayName}
//                   </div>
//                   {unreadCounts[m._id] > 0 && (
//                     <span className="unread-badge">{unreadCounts[m._id]}</span>
//                   )}
//                 </div>
//               ))}
//           </div>
//         </aside>

//         {/* Main Section (Video + Group Chat) */}
//         <section className="room-content">
//           <GroupCall
//             username={user.displayName}
//             roomId={roomId}
//             socket={socket}
//             groupChat={groupChat}
//             setGroupChat={setGroupChat}
//           />

//           <div
//             className="group-chat"
//             style={{ display: groupChat ? "block" : "none" }}
//           >
//             <ChatWindow roomId={roomId} />
//           </div>
//         </section>

//         {/* Private Chat Modal */}
//         {selectedUser && showChat && (
//           <PrivateChatBox
//             selectedUser={selectedUser}
//             roomId={roomId}
//             onClose={() => setShowChat(false)}
//           />
//         )}
//       </main>

//       <ToastContainer />
//     </div>
//   );
// }

// export default Room;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatWindow from "./ChatWindow.jsx";
import socket from "./socket";
import PrivateChatBox from "../components/PrivateChatBox";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Room.css";
import GroupCall from "./GroupCall.jsx";

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groupChat, setGroupChat] = useState(false);
  const [toggleUsers, setToggleUsers] = useState(false); // Toggle for joined users and private chat users
  const [activeTab, setActiveTab] = useState("joined"); // "joined" | "private"

  const [privateChatUsers, setPrivateChatUsers] = useState([]);

  useEffect(() => {
    if (user?._id) {
      socket.emit("userConnected", user._id);
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/rooms/join/${roomId}`,
          { withCredentials: true }
        );
        setRoom(res.data);
      } catch (error) {
        console.error("Failed to load room", error);
        navigate("/rooms");
      }
    };

    fetchRoom();

    socket.on("membersUpdate", (members) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return prevRoom;
        const formatted = members.map((m) => ({
          _id: m.userId,
          displayName: m.displayName,
        }));
        return { ...prevRoom, members: formatted };
      });
    });

    socket.on("userJoined", ({ name }) => {
      console.log(`${name} joined the room`);
    });

    socket.on("userLeft", ({ name }) => {
      console.log(`${name} left the room`);
    });

    socket.on("onlineUsersUpdate", (userIds) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("membersUpdate");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("onlineUsersUpdate");
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!user) return;

    const handlePrivateMessage = (msg) => {
      const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;

      if (!selectedUser || selectedUser._id !== otherUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [otherUserId]: (prev[otherUserId] || 0) + 1,
        }));

        const senderName =
          room?.members.find((m) => m._id === msg.sender)?.displayName ||
          "Someone";

        toast.info(`📩 New message from ${senderName}`, {
          toastId: `${otherUserId}-${Date.now()}`,
          position: "top-right",
          autoClose: 3000,
        });
      }

      // Track user for private chat tab
      if (!privateChatUsers.includes(otherUserId)) {
        setPrivateChatUsers((prev) => [...prev, otherUserId]);
      }
    };

    socket.on("receivePrivateMessage", handlePrivateMessage);

    return () => {
      socket.off("receivePrivateMessage", handlePrivateMessage);
    };
  }, [selectedUser, user, room, privateChatUsers]);
  console.log(toggleUsers);
  useEffect(() => {
    if (selectedUser) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedUser._id]: 0,
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    // ...existing socket.on handlers

    socket.on("roomDeleted", () => {
      alert("⚠️ This room has been  closed.");
      navigate("/rooms"); // redirect to room list
    });

    return () => {
      socket.off("roomDeleted");
    };
  }, []);

  if (!room) return <div className="room-loading">Loading room...</div>;

  const getUserById = (id) => room.members.find((m) => m._id === id);

  return (
    <div className="room-container">
      <main className="room-main">
        {/* Sidebar */}
        <aside
          className="room-sidebar"
          style={{ display: `${toggleUsers ? "block" : "none"}` }}
        >
          {/* Toggle buttons */}
          <div className="toggle-section">
            <button
              className={`toggle-btn ${activeTab === "joined" ? "active" : ""}`}
              onClick={() => setActiveTab("joined")}
            >
              👥 Joined Users
            </button>
            <button
              className={`toggle-btn ${
                activeTab === "private" ? "active" : ""
              }`}
              onClick={() => setActiveTab("private")}
            >
              💬 Private Chat Users
            </button>
          </div>

          {/* User list based on tab */}
          <div className="user-list">
            {activeTab === "joined" &&
              room.members
                .filter((m) => m._id !== user._id)
                .map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      setSelectedUser(m);
                      setShowChat(true);
                    }}
                    className={`user-item ${
                      selectedUser?._id === m._id ? "selected" : ""
                    }`}
                  >
                    <div className="user-info">
                      <span
                        className={`status-dot ${
                          onlineUsers.includes(m._id) ? "online" : "offline"
                        }`}
                      ></span>
                      {m.displayName}
                    </div>
                    {unreadCounts[m._id] > 0 && (
                      <span className="unread-badge">
                        {unreadCounts[m._id]}
                      </span>
                    )}
                  </div>
                ))}

            {activeTab === "private" &&
              privateChatUsers.map((userId) => {
                const userObj = getUserById(userId);
                if (!userObj) return null;

                return (
                  <div
                    key={userObj._id}
                    onClick={() => {
                      setSelectedUser(userObj);
                      setShowChat(true);
                    }}
                    className={`user-item ${
                      selectedUser?._id === userObj._id ? "selected" : ""
                    }`}
                  >
                    <div className="user-info">
                      <span
                        className={`status-dot ${
                          onlineUsers.includes(userObj._id)
                            ? "online"
                            : "offline"
                        }`}
                      ></span>
                      {userObj.displayName}
                    </div>
                    {unreadCounts[userObj._id] > 0 && (
                      <span className="unread-badge">
                        {unreadCounts[userObj._id]}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </aside>

        {/* Main Chat and Video */}
        <section className="room-content">
          <GroupCall
            username={user.displayName}
            roomId={roomId}
            socket={socket}
            groupChat={groupChat}
            setGroupChat={setGroupChat}
            toggleUsers={toggleUsers}
            setToggleUsers={setToggleUsers}
          />

          <div
            className="group-chat"
            style={{ display: groupChat ? "block" : "none" }}
          >
            <ChatWindow roomId={roomId} />
          </div>
        </section>

        {/* Private Chat Modal */}
        {selectedUser && showChat && (
          <PrivateChatBox
            selectedUser={selectedUser}
            roomId={roomId}
            onClose={() => setShowChat(false)}
          />
        )}
      </main>

      <ToastContainer />
    </div>
  );
}

export default Room;
