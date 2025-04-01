const { STRING } = require("sequelize");
const db = require("../config/db");

const User =db.define("user", {
  username: STRING,
  email: STRING,
  password: STRING,
});

module.exports = User;
