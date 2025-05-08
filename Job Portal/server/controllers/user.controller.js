const userService = require("../service/user.service");

exports.signupUser = async (req, res) => {
  try {
    const token = await userService.createUser(req.body);
    return res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      token 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const token = await userService.login(req.body);
    return res.status(200).json({ 
      success: true,
      message: "Login successful",
      token 
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userService.updateUser(userId, req.body);
    return res.status(200).json({ 
      success: true,
      message: "User updated successfully",
      data: user 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userService.deleteUser(userId);
    return res.status(200).json({ 
      success: true,
      message: "User deleted successfully",
      data: user 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userService.getUserById(userId);
    return res.status(200).json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    return res.status(404).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.findUsersByQuery = async (req, res) => {
  try {
    const users = await userService.UserByQuery(req.query);
    return res.status(200).json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.emailVerification = async (req, res) => {
  const { token, otp } = req.params;
  try {
    await userService.sendmail(token, otp);
    return res.status(200).json({ 
      success: true,
      message: "Email verified successfully" 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
