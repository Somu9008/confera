import { io } from "socket.io-client";

const socket = io("https://confera.onrender.com", { withCredentials: true });

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("receiveMsg", (mes) => {
  console.log(mes);
});

export default socket;
