const bcrypt = require("bcrypt");
const User = require("../models/user");

const register = async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      displayName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    req.session.user = newUser; // create session
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Register error", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, existingUser.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = existingUser;
    res.status(200).json(existingUser);
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

module.exports = { register, login };
