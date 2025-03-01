const { request } = require("express");
const userDetailsService = require("../service/userDetails.service");

exports.createDetails = async (req, res) => {
  try {
    const user = req.user.id;
    req.body.user = user;
    const userDetails = await userDetailsService.createUserDetails(req.body);
    return res.send(userDetails);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.updateDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const userDetails = await userDetailsService.updateUserDetails(userId);
    if (!userDetails) {
      return res.status(404).send({ message: "User Details not found" });
    }
    return res.send(userDetails);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getUserDetailsById = async (req, res) => {
  const { userId } = req.params;
  try {
    const userDetails = await userDetailsService.getUserDetailsById(userId);
    if (!userDetails) {
      return res.status(404).send({ message: "User Details not found" });
    }
    return res.send(userDetails);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};
