const express = require("express");
const router = express.Router();
const PrivateMessage = require("../models/privateMessage");

// Get private messages between 2 users in a room
router.get("/:roomId/:user1/:user2", async (req, res) => {
  const { roomId, user1, user2 } = req.params;

  try {
    const messages = await PrivateMessage.find({
      roomId,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort("createdAt");

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error getting private messages:", err);
    res.status(500).json({ error: "Failed to fetch private messages" });
  }
});

router.post("/mark-seen", async (req, res) => {
  const { senderId, receiverId, roomId } = req.body;

  try {
    await PrivateMessage.updateMany(
      { sender: senderId, receiver: receiverId, roomId, seen: false },
      { $set: { seen: true } }
    );

    res.json({ message: "Messages marked as seen" });
  } catch (err) {
    console.error("Mark seen error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

module.exports = router;
