import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("receiveMsg", (mes) => {
  console.log(mes);
});

export default socket;
