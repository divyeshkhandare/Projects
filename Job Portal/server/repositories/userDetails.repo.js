const UserDetails = require("../models/userDetails.model");

exports.getByUserId = async (userId) => {
  try {
    const userDetails = await UserDetails.findOne({ user: userId });
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to get user details: ${error.message}`);
  }
};

exports.updateUserDetails = async (userId, payload) => {
  try {
    const userDetails = await UserDetails.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true
    });
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to update user details: ${error.message}`);
  }
};

exports.createUserDetails = async (payload) => {
  try {
    const userDetails = await UserDetails.create(payload);
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to create user details: ${error.message}`);
  }
};
