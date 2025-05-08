const userDetailsRepo = require("../repositories/userDetails.repo");

exports.getById = async (userId) => {
  try {
    const userDetails = await userDetailsRepo.getByUserId(userId);
    if (!userDetails) {
      throw new Error("User details not found");
    }
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to get user details: ${error.message}`);
  }
};

exports.updateUserDetails = async (userId, payload) => {
  try {
    const userDetails = await userDetailsRepo.updateUserDetails(userId, payload);
    if (!userDetails) {
      throw new Error("User details not found");
    }
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to update user details: ${error.message}`);
  }
};

exports.createUserDetails = async (payload) => {
  try {
    const userDetails = await userDetailsRepo.createUserDetails(payload);
    return userDetails;
  } catch (error) {
    throw new Error(`Failed to create user details: ${error.message}`);
  }
};
