const User = require("../models/user.model");

exports.register = async (data) => {
  try {
    const user = await User.create(data);
    return user;
  } catch (error) {
    throw new Error(`Failed to register user: ${error.message}`);
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error(`Failed to get user by ID: ${error.message}`);
  }
};

exports.updateUser = async (id, user) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, { 
      new: true,
      runValidators: true 
    });
    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

exports.deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);
    return user;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(`Failed to get all users: ${error.message}`);
  }
};

exports.getUserQuery = async (query) => {
  try {
    const users = await User.find(query);
    return users;
  } catch (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};
