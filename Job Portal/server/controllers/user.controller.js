const userService = require("../service/user.service");

exports.signupUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return res.send({ token: user });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    let token = await userService.login(req.body);
    return res.send({ token: token });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  let { userId } = req.params;
  try {
    let user = await userService.updateUser(userId, req.body);
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  let { userId } = req.params;
  try {
    let user = await userService.deleteUser(userId);
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  let { userId } = req.params;
  try {
    let user = await userService.getUserById(userId);
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let user = await userService.getAllUsers();
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.findUsersByQuery = async (req, res) => {
  try {
    let user = await userService.UserByQuery(req.query);
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.emailVerification = async (req, res) => {
  const { token, otp } = req.params;
  try {
    let user = await userService.sendmail(token, otp);
    return res.send({ message: "User verified successfully" });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};
