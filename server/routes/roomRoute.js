const express = require("express");
const authenticated = require("../middleware/authMiddleware");
const Room = require("../models/room");
const Message = require("../models/message");
const privateMessage = require("../models/privateMessage");
const router = express.Router();

// POST /api/rooms

//get all rooms
router.get("/", authenticated, async (req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "id");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server errro" });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    let room = await Room.findOne({ name });

    if (!room) {
      // If no room exists, create a new one
      if (req.session.user) {
        room = await Room.create({
          name,
          createdBy: req.session.user._id,
          members: [req.session.user._id],
        });
      } else {
        room = await Room.create({
          name,
          createdBy: req.user._id,
          members: [req.user._id],
        });
      }
    }

    const io = req.app.get("io");
    io.emit("newRoom", room);
    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Room join/create failed" });
  }
});

router.get("/my-created", async (req, res) => {
  const userId = req.session.user?._id || req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const myRooms = await Room.find({ createdBy: userId }).sort({
      createdAt: -1,
    });
    res.json(myRooms);
  } catch (err) {
    console.error("Failed to fetch created rooms", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.delete("/:roomId", authenticated, async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.roomId);
//     const userId = req.session.user ? req.session.user._id : req.user._id;

//     if (!room) return res.status(404).json({ message: "Room not found" });

//     if (room.createdBy.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "You are not the creator" });
//     }

//     await Room.findByIdAndDelete(req.params.roomId);

//     const io = req.app.get("io");
//     io.emit("roomDeleted", req.params.roomId);

//     res.status(200).json({ message: "Room deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

//join a room

router.delete("/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  const userId =
    (req.session?.user && req.session.user._id) || (req.user && req.user._id);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized - no user found" });
  }
  // from auth middleware
  // for session-based auth
  try {
    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🧹 Delete group messages
    await Message.deleteMany({ roomId });

    // 🧹 Delete private messages
    await privateMessage.deleteMany({ roomId });

    // 🧹 Delete the room
    await room.deleteOne();

    return res.status(200).json({ message: "Room and messages deleted" });
  } catch (err) {
    console.error("Delete room failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/join/:roomId", async (req, res) => {
  try {
    let room = await Room.findById(req.params.roomId)
      .populate("members", "displayName")
      .exec();

    if (!room) return res.status(404).json({ message: "Room not found" });

    const userId = req.session.user ? req.session.user._id : req.user._id;

    if (
      !room.members.some(
        (member) => member._id.toString() === userId.toString()
      )
    ) {
      room.members.push(userId);
      await room.save();

      room = await Room.findById(req.params.roomId)
        .populate("members", "displayName")
        .exec();
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/rooms/my-created

module.exports = router;
