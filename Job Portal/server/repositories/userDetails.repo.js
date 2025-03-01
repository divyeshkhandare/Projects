const UserDetails = require("../models/userDetails.model");

exports.getByUserId = async (userId) => {
  let userDetails = await UserDetails.findOne({ user: userId });
  return userDetails;
};

exports.updateUserDetails = async (userId, payload) => {
  const userDetails = await UserDetails.findByIdAndUpdate(userId, payload, {
    new: true,
  });
  return userDetails;
};

exports.createUserDetails = async (payload) => {
  const userDetails = await UserDetails.create(payload);
  return userDetails;
};
