const userRepo = require("../repositories/user.repo");
const {
  hashPassword,
  generateToken,
  comparePassword,
  decode,
} = require("../utils/helper");
const sendMail = require("../utils/mail");
const userDetailsService = require("./userDetails.service");

// Store OTPs in memory (consider using Redis in production)
const otpMap = new Map();

exports.createUser = async (data) => {
  try {
    const existingUser = await userRepo.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists!");
    }

    const hash = await hashPassword(data.password);
    data.password = hash;

    const user = await userRepo.register(data);

    const token = await generateToken({
      name: user.name,
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const otp = Math.round(1000 + Math.random() * 8999);
    otpMap.set(token, otp);

    const verificationLink = `http://localhost:8090/api/v1/user/verify/${token}/${otp}`;
    const html = `<div><a href="${verificationLink}">Click to verify</a></div>`;
    
    await sendMail(user.email, "Verification Email", html);
    return token;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

exports.login = async (data) => {
  try {
    const user = await userRepo.getUserByEmail(data.email);
    if (!user) {
      throw new Error("User does not exist");
    }

    const isValid = await comparePassword(user.password, data.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = await generateToken({
      email: user.email,
      name: user.name,
      id: user.id,
      role: user.role,
    });

    return token;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

exports.updateUser = async (id, data) => {
  try {
    const user = await userRepo.getUserById(id);
    if (!user) {
      throw new Error("Invalid user ID");
    }

    const updatedUser = await userRepo.updateUser(id, data);
    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

exports.deleteUser = async (id) => {
  try {
    const user = await userRepo.getUserById(id);
    if (!user) {
      throw new Error("Invalid user ID");
    }

    const deletedUser = await userRepo.deleteUser(id);
    return deletedUser;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await userRepo.getUserById(id);
    if (!user) {
      throw new Error("Invalid user ID");
    }

    const userDetails = await userDetailsService.getById(id);
    return { user, userDetails };
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await userRepo.getAllUsers();
    return users;
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

exports.UserByQuery = async (query) => {
  try {
    const users = await userRepo.getUserQuery(query);
    return users;
  } catch (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

exports.sendmail = async (token, otp) => {
  try {
    const storedOTP = otpMap.get(token);
    if (storedOTP === otp) {
      const user = await decode(token);
      const updatedUser = await userRepo.updateUser(user.id, { isVerified: true });
      return updatedUser;
    }
    throw new Error("Invalid OTP");
  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
};