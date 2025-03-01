const { hashPassword, generateToken } = require("../helper/authhelper");
const User = require("../models/userSchema");
const userRepo = require("../repositories/user.repo");

exports.createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hash = await hashPassword(password);
    req.body.password = hash;
    const newUser = new User(req.body);
    const token = await generateToken({
      id: newUser._id,
      name: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepo.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userRepo.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await userRepo.updateUser(id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userRepo.deleteUser(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
