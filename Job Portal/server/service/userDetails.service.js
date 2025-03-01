const userDetailsRepo = require("../repositories/userDetails.repo");

exports.getById = async (userId) => {
  try {
    let userDetails = await userDetailsRepo.getByUserId(userId);
    return userDetails;
  } catch (error) {
    throw new Error("Failed to get user details.");
  }
};

exports.updateUserDetails = async (userId, payload) => {
  try {
    const userDetails = await userDetailsRepo.updateUserDetails(
      userId,
      payload
    );
    return userDetails;
  } catch (error) {
    throw new Error("Failed to update user details.");
  }
};

exports.createUserDetails = async (payload) => {
  try {
    const userDetails = await userDetailsRepo.createUserDetails(payload);
    return userDetails;
  } catch (error) {
    throw new Error("Failed to create user details.");
  }
};
