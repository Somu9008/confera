// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import socket from "./socket";
// import "./RoomList.css";
// import { useDispatch } from "react-redux";
// import { setCurrentRoom } from "../features/room/roomSlice";

// function RoomList() {
//   const [roomName, setRoomName] = useState("");
//   const [roomIdInput, setRoomIdInput] = useState("");
//   const [myRooms, setMyRooms] = useState([]);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const fetchMyRooms = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/rooms/my-created",
//         {
//           withCredentials: true,
//         }
//       );
//       setMyRooms(res.data);
//     } catch (err) {
//       console.error("Failed to fetch my rooms", err);
//     }
//   };

//   useEffect(() => {
//     fetchMyRooms();

//     socket.on("roomDeleted", (deletedRoomId) => {
//       setMyRooms((prev) => prev.filter((room) => room._id !== deletedRoomId));
//     });

//     return () => {
//       socket.off("roomDeleted");
//     };
//   }, []);

//   const handleCreateRoom = async () => {
//     if (!roomName.trim()) return;
//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/rooms",
//         { name: roomName },
//         { withCredentials: true }
//       );
//       const newRoomId = res.data._id;
//       socket.emit("newRoom", res.data); // Notify others
//       dispatch(setCurrentRoom(res.data));
//       setRoomName("");
//       await fetchMyRooms(); // 🔄 Refresh the room list
//       navigate(`/rooms/${newRoomId}`);
//     } catch (error) {
//       console.error("Room creation failed", error);
//     }
//   };

//   const handleJoinById = async () => {
//     if (!roomIdInput.trim()) return;
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/rooms/join/${roomIdInput}`,
//         {
//           withCredentials: true,
//         }
//       );
//       dispatch(setCurrentRoom(res.data));
//       navigate(`/rooms/${roomIdInput}`);
//     } catch (error) {
//       alert("❌ Room not found or access denied!");
//     }
//   };

//   const handleDelete = async (roomId) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this room? This will remove all messages."
//     );
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
//         withCredentials: true,
//       });

//       setMyRooms((prev) => prev.filter((room) => room._id !== roomId));
//       socket.emit("roomDeleted", roomId);
//     } catch (error) {
//       console.error("Failed to delete room", error);
//     }
//   };

//   return (
//     <div className="room-entry-container">
//       <h2>🔐 Smart Chat & Video App</h2>

//       <div className="room-section">
//         <h3>🗃️ My Created Rooms</h3>
//         {myRooms.length === 0 ? (
//           <p>No rooms created yet.</p>
//         ) : (
//           <ul className="room-list">
//             {myRooms.map((room) => (
//               <li key={room._id} className="room-item">
//                 <span className="room-name">{room.name}</span>
//                 <button
//                   onClick={() => navigate(`/rooms/${room._id}`)}
//                   className="join-room-button"
//                 >
//                   🔁 Rejoin
//                 </button>
//                 <button
//                   onClick={() => handleDelete(room._id)}
//                   className="delete-room-button"
//                 >
//                   🗑️ Delete
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div className="room-section">
//         <h3>Create a Room</h3>
//         <input
//           type="text"
//           value={roomName}
//           onChange={(e) => setRoomName(e.target.value)}
//           placeholder="Enter Room Name"
//           className="room-input"
//         />
//         <button onClick={handleCreateRoom} className="room-button">
//           ➕ Create Room
//         </button>
//       </div>

//       <div className="room-section">
//         <h3>Join a Room</h3>
//         <input
//           type="text"
//           value={roomIdInput}
//           onChange={(e) => setRoomIdInput(e.target.value)}
//           placeholder="Enter Room ID"
//           className="room-input"
//         />
//         <button onClick={handleJoinById} className="room-button">
//           🔑 Join Room
//         </button>
//       </div>
//     </div>
//   );
// }

// export default RoomList;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import "./RoomList.css";
import { useDispatch } from "react-redux";
import { setCurrentRoom } from "../features/room/roomSlice";

function RoomList() {
  const [roomName, setRoomName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [myRooms, setMyRooms] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchMyRooms = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/rooms/my-created",
        {
          withCredentials: true,
        }
      );
      setMyRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch my rooms", err);
    }
  };

  useEffect(() => {
    fetchMyRooms();

    socket.on("roomDeleted", (deletedRoomId) => {
      setMyRooms((prev) => prev.filter((room) => room._id !== deletedRoomId));
    });

    return () => {
      socket.off("roomDeleted");
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/rooms",
        { name: roomName },
        { withCredentials: true }
      );
      const newRoomId = res.data._id;
      socket.emit("newRoom", res.data);
      dispatch(setCurrentRoom(res.data));
      setRoomName("");
      await fetchMyRooms();
      navigate(`/rooms/${newRoomId}`);
    } catch (error) {
      console.error("Room creation failed", error);
    }
  };

  const handleJoinById = async () => {
    if (!roomIdInput.trim()) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/rooms/join/${roomIdInput}`,
        { withCredentials: true }
      );
      dispatch(setCurrentRoom(res.data));
      navigate(`/rooms/${roomIdInput}`);
    } catch (error) {
      alert("❌ Room not found or access denied!");
    }
  };

  const handleDelete = async (roomId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room? All messages will be removed."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        withCredentials: true,
      });
      setMyRooms((prev) => prev.filter((room) => room._id !== roomId));
      socket.emit("roomDeleted", roomId);
    } catch (error) {
      console.error("Failed to delete room", error);
    }
  };

  return (
    <div className="room-page">
      <h1 className="app-title">🎥 Welcome to Confera</h1>

      <section className="room-section">
        <h2>🛠 My Created Rooms</h2>
        {myRooms.length === 0 ? (
          <p className="empty-msg">No rooms created yet.</p>
        ) : (
          <ul className="room-list">
            {myRooms.map((room) => (
              <li key={room._id} className="room-card">
                <div className="room-info">
                  <strong>{room.name}</strong>
                  <small>ID: {room._id}</small>
                </div>
                <div className="room-actions">
                  <button onClick={() => navigate(`/rooms/${room._id}`)}>
                    🔁 Rejoin
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="room-section">
        <h2>➕ Create a New Room</h2>
        <div className="form-row">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter Room Name"
          />
          <button onClick={handleCreateRoom}>Create</button>
        </div>
      </section>

      <section className="room-section">
        <h2>🔑 Join by Room ID</h2>
        <div className="form-row">
          <input
            type="text"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button onClick={handleJoinById}>Join</button>
        </div>
      </section>
    </div>
  );
}

export default RoomList;
