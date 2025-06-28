const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, default: null },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    password: { type: String }, // For custom login
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
