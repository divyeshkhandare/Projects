const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.generateToken = async (data) => {
  try {
    return await jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
  } catch (error) {
    throw new Error(error);
  }
};

exports.decodeToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(error);
  }
};

exports.hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error(error);
  }
};

exports.comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(error);
  }
};
