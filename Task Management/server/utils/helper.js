const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "../config/.env" });
const generateToken = async (data) => {
  try {
    let token = await jwt.sign(data, process.env.JWT_SECRET);
    return token;
  } catch (error) {
    throw new Error(error);
  }
};

const hashPassword = async (password) => {
  let hash = await bcrypt.hash(password, 10);
  return hash;
};

const comparePassword = async (hash, password) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { generateToken, comparePassword, hashPassword };
