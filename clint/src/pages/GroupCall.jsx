// import React, { useEffect, useRef, useState } from "react";
// import socket from "./socket";
// import "./GroupCall.css";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axios from "axios";

// function GroupCall({
//   roomId,
//   userId,
//   groupChat,
//   setGroupChat,
//   toggleUsers,
//   setToggleUsers,
// }) {
//   const [peers, setPeers] = useState({});
//   const [stream, setStream] = useState(null);
//   const streamRef = useRef(null); // ✅ for cleanup
//   const [mainStreamId, setMainStreamId] = useState("self");
//   const peerConnections = useRef({});
//   const screenTrackRef = useRef(null);
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [screenSharing, setScreenSharing] = useState(false);

//   const user = useSelector((state) => state.auth.user);
//   const room = useSelector((state) => state.room.currentRoom);

//   console.log(room, user);
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.title = "📹 Group Video Call"; // ✅ set tab icon

//     const startCall = async () => {
//       const localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       setStream(localStream);
//       streamRef.current = localStream; // ✅ store stream for cleanup
//       socket.emit("join-video-room", { roomId, userId });

//       socket.off("user-joined-video");
//       socket.on("user-joined-video", ({ socketId }) => {
//         const peer = createPeer(socketId, localStream);
//         peerConnections.current[socketId] = peer;
//       });

//       socket.off("offer");
//       socket.on("offer", ({ offer, from }) => {
//         const peer = acceptPeer(from, offer, localStream);
//         peerConnections.current[from] = peer;
//       });

//       socket.off("answer");
//       socket.on("answer", ({ answer, from }) => {
//         peerConnections.current[from]?.setRemoteDescription(
//           new RTCSessionDescription(answer)
//         );
//       });

//       socket.off("ice-candidate");
//       socket.on("ice-candidate", ({ candidate, from }) => {
//         peerConnections.current[from]?.addIceCandidate(
//           new RTCIceCandidate(candidate)
//         );
//       });

//       socket.off("user-left-video");
//       socket.on("user-left-video", ({ socketId }) => {
//         if (peerConnections.current[socketId]) {
//           peerConnections.current[socketId].close();
//           delete peerConnections.current[socketId];
//           setPeers((prev) => {
//             const updated = { ...prev };
//             delete updated[socketId];
//             return updated;
//           });
//         }
//       });
//     };

//     startCall();

//     return () => {
//       document.title = "Smart Chat App"; // ✅ reset tab title
//       socket.emit("leave-video-room", { roomId });
//       Object.values(peerConnections.current).forEach((pc) => pc.close());
//       peerConnections.current = {};

//       if (screenTrackRef.current) {
//         screenTrackRef.current.stop();
//         screenTrackRef.current = null;
//       }

//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop()); // ✅ proper cleanup
//       }

//       setPeers({});
//       setStream(null);
//       setMicOn(true);
//       setCamOn(true);
//       setScreenSharing(false);
//     };
//   }, []);

//   const createPeer = (targetSocketId, stream) => {
//     const peer = new RTCPeerConnection();
//     stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//     peer.onicecandidate = (e) => {
//       if (e.candidate) {
//         socket.emit("ice-candidate", {
//           targetSocketId,
//           candidate: e.candidate,
//         });
//       }
//     };

//     peer.ontrack = (e) => {
//       setPeers((prev) => ({
//         ...prev,
//         [targetSocketId]: e.streams[0],
//       }));
//       setMainStreamId((prev) => (prev === "self" ? targetSocketId : prev));
//     };

//     peer
//       .createOffer()
//       .then((offer) => peer.setLocalDescription(offer))
//       .then(() => {
//         socket.emit("offer", {
//           targetSocketId,
//           offer: peer.localDescription,
//           from: socket.id,
//         });
//       });

//     return peer;
//   };

//   const acceptPeer = (fromSocketId, offer, stream) => {
//     const peer = new RTCPeerConnection();
//     stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//     peer.onicecandidate = (e) => {
//       if (e.candidate) {
//         socket.emit("ice-candidate", {
//           targetSocketId: fromSocketId,
//           candidate: e.candidate,
//         });
//       }
//     };

//     peer.ontrack = (e) => {
//       setPeers((prev) => ({
//         ...prev,
//         [fromSocketId]: e.streams[0],
//       }));
//       setMainStreamId((prev) => (prev === "self" ? fromSocketId : prev));
//     };

//     peer
//       .setRemoteDescription(new RTCSessionDescription(offer))
//       .then(() => peer.createAnswer())
//       .then((answer) => peer.setLocalDescription(answer))
//       .then(() => {
//         socket.emit("answer", {
//           targetSocketId: fromSocketId,
//           answer: peer.localDescription,
//         });
//       });

//     return peer;
//   };

//   const toggleMic = () => {
//     stream
//       ?.getAudioTracks()
//       .forEach((track) => (track.enabled = !track.enabled));
//     setMicOn((prev) => !prev);
//   };

//   const toggleCam = () => {
//     stream
//       ?.getVideoTracks()
//       .forEach((track) => (track.enabled = !track.enabled));
//     setCamOn((prev) => !prev);
//   };

//   const toggleScreenShare = async () => {
//     if (!stream) return;

//     if (!screenSharing) {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//         });
//         const screenTrack = screenStream.getVideoTracks()[0];
//         screenTrackRef.current = screenTrack;

//         Object.values(peerConnections.current).forEach((pc) => {
//           const sender = pc.getSenders().find((s) => s.track.kind === "video");
//           if (sender) sender.replaceTrack(screenTrack);
//         });

//         screenTrack.onended = stopScreenShare;
//         setScreenSharing(true);
//       } catch (err) {
//         console.error("Screen share error:", err);
//       }
//     } else {
//       stopScreenShare();
//     }
//   };

//   const stopScreenShare = () => {
//     const videoTrack = stream?.getVideoTracks()[0];
//     Object.values(peerConnections.current).forEach((pc) => {
//       const sender = pc.getSenders().find((s) => s.track.kind === "video");
//       if (sender && videoTrack) sender.replaceTrack(videoTrack);
//     });

//     screenTrackRef.current?.stop();
//     screenTrackRef.current = null;
//     setScreenSharing(false);
//   };

//   const leaveCall = () => {
//     navigate("/rooms"); // ✅ go to another page (dashboard or room list)
//   };

//   const handleFullscreen = () => {
//     const videoElement = document.querySelector(".main-video video");
//     if (videoElement.requestFullscreen) {
//       videoElement.requestFullscreen();
//     } else if (videoElement.webkitRequestFullscreen) {
//       videoElement.webkitRequestFullscreen();
//     } else if (videoElement.mozRequestFullScreen) {
//       videoElement.mozRequestFullScreen();
//     } else if (videoElement.msRequestFullscreen) {
//       videoElement.msRequestFullscreen();
//     }
//   };

//   return (
//     <div
//       className={`group-call-container `}
//       style={{ width: groupChat == false ? "100%" : "99%" }}
//     >
//       {stream && (
//         <>
//           <h3>📞 Group Call Room</h3>

//           <div className="zoom-layout">
//             <div className="main-video">
//               {mainStreamId === "self" ? (
//                 <video
//                   ref={(el) => {
//                     if (el) {
//                       el.srcObject = stream;
//                       el.muted = true;
//                     }
//                   }}
//                   autoPlay
//                   playsInline
//                   className="video-box"
//                 />
//               ) : (
//                 <video
//                   ref={(el) => {
//                     if (el) el.srcObject = peers[mainStreamId];
//                   }}
//                   autoPlay
//                   playsInline
//                   className="video-box"
//                 />
//               )}
//             </div>

//             <div className="side-thumbnails">
//               {mainStreamId !== "self" && (
//                 <video
//                   onClick={() => setMainStreamId("self")}
//                   ref={(el) => {
//                     if (el) {
//                       el.srcObject = stream;
//                       el.muted = true;
//                     }
//                   }}
//                   autoPlay
//                   playsInline
//                   className="thumbnail-video"
//                 />
//               )}

//               {Object.entries(peers).map(([id, remoteStream]) => {
//                 if (id === mainStreamId) return null;
//                 return (
//                   <video
//                     key={id}
//                     onClick={() => setMainStreamId(id)}
//                     ref={(el) => {
//                       if (el) el.srcObject = remoteStream;
//                     }}
//                     autoPlay
//                     playsInline
//                     className="thumbnail-video"
//                   />
//                 );
//               })}
//             </div>
//           </div>

//           <div className="controls">
//             <button
//               onClick={() => {
//                 setToggleUsers(!toggleUsers);
//               }}
//             >
//               {toggleUsers ? "close users" : "users"}
//             </button>
//             <button onClick={toggleMic}>
//               {micOn ? "🎙️ Mute" : "🔇 Unmute"}
//             </button>
//             <button onClick={toggleCam}>
//               {camOn ? "🎥 Cam Off" : "📷 Cam On"}
//             </button>
//             <button onClick={toggleScreenShare}>
//               {screenSharing ? "🛑 Stop Share" : "🖥️ Share Screen"}
//             </button>
//             <button
//               onClick={() => {
//                 setGroupChat(!groupChat);
//               }}
//             >
//               {groupChat ? "Close chat" : "🖥️ open Chat"}
//             </button>
//             <button
//               onClick={leaveCall}
//               style={{ background: "crimson", color: "#fff" }}
//             >
//               ❌ Leave room
//             </button>
//             <button onClick={handleFullscreen}>⛶</button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default GroupCall;

import React, { useEffect, useRef, useState } from "react";
import socket from "./socket";
import "./GroupCall.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function GroupCall({
  roomId,
  userId,
  groupChat,
  setGroupChat,
  toggleUsers,
  setToggleUsers,
}) {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const [mainStreamId, setMainStreamId] = useState("self");
  const peerConnections = useRef({});
  const screenTrackRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const room = useSelector((state) => state.room.currentRoom);

  useEffect(() => {
    const startCall = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(localStream);
      streamRef.current = localStream;
      socket.emit("join-video-room", { roomId, userId });

      socket.on("user-joined-video", ({ socketId }) => {
        const peer = createPeer(socketId, localStream);
        peerConnections.current[socketId] = peer;
      });

      socket.on("offer", ({ offer, from }) => {
        const peer = acceptPeer(from, offer, localStream);
        peerConnections.current[from] = peer;
      });

      socket.on("answer", ({ answer, from }) => {
        peerConnections.current[from]?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket.on("ice-candidate", ({ candidate, from }) => {
        peerConnections.current[from]?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });

      socket.on("user-left-video", ({ socketId }) => {
        if (peerConnections.current[socketId]) {
          peerConnections.current[socketId].close();
          delete peerConnections.current[socketId];
          setPeers((prev) => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
          });
        }
      });
    };

    startCall();

    return () => {
      socket.emit("leave-video-room", { roomId });
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setPeers({});
      setStream(null);
    };
  }, []);

  const createPeer = (targetSocketId, stream) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      setPeers((prev) => ({
        ...prev,
        [targetSocketId]: e.streams[0],
      }));
      setMainStreamId((prev) => (prev === "self" ? targetSocketId : prev));
    };

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit("offer", {
          targetSocketId,
          offer: peer.localDescription,
          from: socket.id,
        });
      });

    return peer;
  };

  const acceptPeer = (fromSocketId, offer, stream) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId: fromSocketId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      setPeers((prev) => ({
        ...prev,
        [fromSocketId]: e.streams[0],
      }));
      setMainStreamId((prev) => (prev === "self" ? fromSocketId : prev));
    };

    peer
      .setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peer.createAnswer())
      .then((answer) => peer.setLocalDescription(answer))
      .then(() => {
        socket.emit("answer", {
          targetSocketId: fromSocketId,
          answer: peer.localDescription,
        });
      });

    return peer;
  };

  const toggleMic = () => {
    stream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setMicOn((prev) => !prev);
  };

  const toggleCam = () => {
    stream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setCamOn((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    if (!stream) return;

    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = stopScreenShare;
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });

    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setScreenSharing(false);
  };

  const leaveCall = () => {
    navigate("/rooms");
  };

  const goFullScreen = () => {
    const videoEl = document.querySelector(".main-video video");
    if (videoEl && videoEl.requestFullscreen) {
      videoEl.requestFullscreen();
    }
  };

  return (
    <div className="group-call-container">
      <div className="zoom-layout">
        <div className="main-video">
          <video
            ref={(el) => {
              if (el) {
                el.srcObject =
                  mainStreamId === "self" ? stream : peers[mainStreamId];
                el.muted = mainStreamId === "self";
              }
            }}
            autoPlay
            playsInline
            className="video-box"
          />
          <button onClick={goFullScreen} className="fullscreen-btn">
            ⛶
          </button>
        </div>

        <div className="side-thumbnails">
          {mainStreamId !== "self" && (
            <video
              onClick={() => setMainStreamId("self")}
              ref={(el) => {
                if (el) {
                  el.srcObject = stream;
                  el.muted = true;
                }
              }}
              autoPlay
              playsInline
              className="thumbnail-video"
            />
          )}

          {Object.entries(peers).map(([id, remoteStream]) => {
            if (id === mainStreamId) return null;
            return (
              <video
                key={id}
                onClick={() => setMainStreamId(id)}
                ref={(el) => {
                  if (el) el.srcObject = remoteStream;
                }}
                autoPlay
                playsInline
                className="thumbnail-video"
              />
            );
          })}
        </div>
      </div>

      <div className="controls">
        <button onClick={() => setToggleUsers(!toggleUsers)}>
          {toggleUsers ? "Close Users" : "Show Users"}
        </button>
        <button onClick={toggleMic}>{micOn ? "🎙️ Mute" : "🔇 Unmute"}</button>
        <button onClick={toggleCam}>
          {camOn ? "🎥 Cam Off" : "📷 Cam On"}
        </button>
        <button onClick={toggleScreenShare}>
          {screenSharing ? "🛑 Stop Share" : "🖥️ Share Screen"}
        </button>
        <button onClick={() => setGroupChat(!groupChat)}>
          {groupChat ? "Close Chat" : "🖥️ Open Chat"}
        </button>
        <button
          onClick={leaveCall}
          style={{ background: "crimson", color: "#fff" }}
        >
          ❌ Leave room
        </button>
      </div>
    </div>
  );
}

export default GroupCall;
