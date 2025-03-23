const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.generateToken = async (data) => {
  try {
    let token = await jwt.sign(data, process.env.JWT_KEY);
    return token;
  } catch (error) {
    throw new Error("Unable to sign toke", error);
  }
};

exports.hashPassword = async (password) => {
  let hash = await bcrypt.hash(password, 10);
  return hash;
};

exports.comparePassword = async (hash, password) => {
  return await bcrypt.compare(password, hash);
};

exports.decode = async(token) => {
  try {
    let Token = await jwt.verify(token, process.env.JWT_KEY);
    return Token;
  } catch (error) {
    throw new Error("Unable to decode token", error);
  }
}
