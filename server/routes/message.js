const express = require("express");
const router = express.Router();
const Message = require("../models/message");

router.get("/:roomId", async (req, res) => {
  try {
    const message = await Message.find({ roomId: req.params.roomId }).populate(
      "sender",
      "displayName"
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "failed to fetch message" });
  }
});

// POST
router.post("/:roomId", async (req, res) => {
  try {
    const message = new Message({
      roomId: req.params.roomId,
      sender: req.user?.id || req.session.user?.id,
      content: req.body.content,
    });

    await message.save();
    res.status(200).json({ messageId: message._id });
  } catch (error) {
    res.status(500).json({ message: "failed to send message" });
  }
});

module.exports = router;
