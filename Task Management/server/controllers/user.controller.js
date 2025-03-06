const User = require("../models/userSchema");
const {
  hashPassword,
  generateToken,
  comparePassword,
} = require("../utils/helper");

exports.createUser = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    req.body.password = await hashPassword(req.body.password);

    user = await User.create(req.body);

    let token = await generateToken({
      name: user.name,
      role: user.role,
      id: user._id,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const isMatch = await comparePassword(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    let token = await generateToken({
      name: user.name,
      role: user.role,
      id: user._id,
    });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    const users = await User.find(query);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
