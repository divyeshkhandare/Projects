const { request } = require("express");
const userDetailsService = require("../service/userDetails.service");

exports.createDetails = async (req, res) => {
  try {
    const user = req.user.id;
    req.body.user = user;
    const userDetails = await userDetailsService.createUserDetails(req.body);
    return res.status(201).json({
      success: true,
      message: "User details created successfully",
      data: userDetails
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const userDetails = await userDetailsService.updateUserDetails(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: userDetails
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserDetailsById = async (req, res) => {
  const { userId } = req.params;
  try {
    const userDetails = await userDetailsService.getUserDetailsById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found"
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
