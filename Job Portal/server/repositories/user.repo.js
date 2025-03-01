const User = require("../models/user.model");

exports.register = async (data) => {
  const user = await User.create(data);
  return user;
};

exports.getUserByEmail = async (email) => {
  const user = await User.findOne({ email: email });
  return user;
};

exports.getUserById = async (id) => {
  const user = await User.findById(id);
  return user;
};

exports.updateUser = async (id, user) => {
  const updateUser = await User.findByIdAndUpdate(id, user, { new: true });
  return updateUser;
};

exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};

exports.getAllUsers = async () => {
  const user = await User.find();
  return user;
};

exports.getUserQuery = async (query) => {
  const user = await User.find(query);
  return user;
};
