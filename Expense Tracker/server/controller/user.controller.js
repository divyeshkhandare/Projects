const User = require("../models/user.model");

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};
