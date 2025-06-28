// =============== 🌐 Group Video Call Events ==================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const googleAuthRoutes = require("./routes/googleAuth");
const customAuthRoutes = require("./routes/customAuth");
const roomRoutes = require("./routes/roomRoute");
const messageRoutes = require("./routes/message");
const privateMessageRoutes = require("./routes/PrivateMessage");
const authenticated = require("./middleware/authMiddleware");
const Message = require("./models/message");
const PrivateMessage = require("./models/privateMessage");
require("./config/passport");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://confera-kwc0fdmy2-somu9008s-projects.vercel.app",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "https://confera-kwc0fdmy2-somu9008s-projects.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, sameSite: "none" },
  })
);

app.set("trust proxy", 1);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/auth", googleAuthRoutes);
app.use("/api/auth", customAuthRoutes);
app.use("/api/rooms", authenticated, roomRoutes);
app.use("/api/messages", authenticated, messageRoutes);
app.use("/api/private", authenticated, privateMessageRoutes);

app.set("io", io);

const userSocketMap = {}; // userId -> socket.id
const roomUsers = {}; // roomId -> list of users

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("userConnected", (userId) => {
    userSocketMap[userId] = socket.id;

    // 🔄 Notify all users about updated online users
    const onlineUserIds = Object.keys(userSocketMap);
    io.emit("onlineUsersUpdate", onlineUserIds);
  });

  socket.on("joinRoom", ({ roomId, user }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    const existingUser = roomUsers[roomId].find((u) => u.userId === user._id);
    if (!existingUser) {
      roomUsers[roomId].push({
        userId: user._id,
        displayName: user.displayName,
        socketId: socket.id,
      });
    }

    io.to(roomId).emit("membersUpdate", roomUsers[roomId]);

    socket.to(roomId).emit("userJoined", {
      userId: user._id,
      name: user.displayName,
    });
  });

  socket.on("roomDeleted", (roomId) => {
    io.to(roomId).emit("roomDeleted");
  });

  // Step 1: User joins video room
  socket.on("join-video-room", ({ roomId, userId }) => {
    socket.join(roomId);
    socket
      .to(roomId)
      .emit("user-joined-video", { userId, socketId: socket.id });
  });

  // Step 2: Send offer to other peer
  socket.on("offer", ({ targetSocketId, offer, from }) => {
    io.to(targetSocketId).emit("offer", { offer, from: socket.id });
  });

  // Step 3: Send answer to caller
  socket.on("answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("answer", { answer, from: socket.id });
  });

  // Step 4: ICE candidate exchange
  socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("ice-candidate", {
      candidate,
      from: socket.id,
    });
  });

  // Step 5: Handle user leaving video room
  socket.on("leave-video-room", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left-video", { socketId: socket.id });
  });

  socket.on("leaveRoom", ({ roomId, user }) => {
    socket.leave(roomId);

    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (u) => u.socketId !== socket.id
      );
      if (roomUsers[roomId].length === 0) delete roomUsers[roomId];
    }

    io.to(roomId).emit("membersUpdate", roomUsers[roomId] || []);

    socket.to(roomId).emit("userLeft", {
      userId: user._id,
      name: user.displayName,
    });
  });

  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("typing");
  });

  socket.on("stopTyping", ({ roomId }) => {
    socket.to(roomId).emit("stopTyping");
  });

  socket.on("sendMessage", async ({ roomId, content, user }) => {
    const message = new Message({
      roomId,
      sender: user._id,
      content,
    });

    await message.save();

    const fullMessage = await Message.findById(message._id).populate(
      "sender",
      "displayName"
    );

    io.to(roomId).emit("newMessage", fullMessage);
  });

  socket.on(
    "privateMessage",
    async ({ roomId, senderId, receiverId, message }) => {
      const msgData = {
        roomId,
        sender: senderId,
        receiver: receiverId,
        message,
        timestamp: new Date(),
      };

      try {
        const savedMsg = await PrivateMessage.create(msgData);

        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[receiverId];

        if (senderSocketId)
          io.to(senderSocketId).emit("receivePrivateMessage", savedMsg);
        if (receiverSocketId && receiverSocketId !== senderSocketId) {
          io.to(receiverSocketId).emit("receivePrivateMessage", savedMsg);
        }
      } catch (err) {
        console.error("Error saving private message:", err);
      }
    }
  );

  socket.on("markAsSeen", async ({ roomId, senderId, receiverId }) => {
    try {
      await PrivateMessage.updateMany(
        {
          roomId,
          sender: senderId, // messages sent by other user
          receiver: receiverId, // current logged-in user
          seen: false,
        },
        { $set: { seen: true } }
      );

      const updatedMessages = await PrivateMessage.find({
        roomId,
        sender: senderId,
        receiver: receiverId,
      });

      const senderSocket = userSocketMap[senderId];
      if (senderSocket) {
        io.to(senderSocket).emit("messagesSeen", {
          receiverId,
          roomId,
        });
      }
    } catch (err) {
      console.error("Error updating seen messages:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    let disconnectedUserId = null;

    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        disconnectedUserId = userId;
        delete userSocketMap[userId];
        break;
      }
    }

    // 🔄 Notify all users about updated online users
    const onlineUserIds = Object.keys(userSocketMap);
    io.emit("onlineUsersUpdate", onlineUserIds);

    for (const roomId in roomUsers) {
      const before = roomUsers[roomId].length;
      roomUsers[roomId] = roomUsers[roomId].filter(
        (u) => u.socketId !== socket.id
      );

      if (roomUsers[roomId].length !== before) {
        io.to(roomId).emit("membersUpdate", roomUsers[roomId]);
      }

      if (roomUsers[roomId].length === 0) delete roomUsers[roomId];
    }
  });
});

const Port = process.env.PORT || 9000;
server.listen(Port, "0.0.0.0", () => {
  console.log(`Server running on port ${Port}`);
});
