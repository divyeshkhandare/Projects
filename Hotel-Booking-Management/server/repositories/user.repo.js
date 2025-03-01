const User = require("../models/userSchema");

exports.createUser = async (data) => {
  try {
    const user = await User.create(data);
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateUser = async (id, user) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    return updatedUser;
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndUpdate(id, { isActive: false });
    return user;
  } catch (error) {
    throw new Error(error);
  }
};
