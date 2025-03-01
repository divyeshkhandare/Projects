const userRepo = require("../repositories/user.repo");
const {
  hashPassword,
  generateToken,
  comparePassword,
  decode,
} = require("../utils/helper");
const sendMail = require("../utils/mail");
const userDetailsService = require("./userDetails.service");

let map = new Map();

exports.createUser = async (data) => {
  let user = await userRepo.getUserByEmail(data.email);
  if (user) {
    throw new Error("User already exists!");
  }
  const hash = await hashPassword(data.password);
  data.password = hash;

  user = await userRepo.register(data);

  let token = await generateToken({
    name: user.name,
    email: user.email,
    id: user.id,
    role: user.role,
  });

  let otp = Math.round(1000 + Math.random() * 8999);
  map.set(token, otp);
  let html = `<div> <a href=http://localhost:8090/api/v1/user/verify/${token}/${otp} > click to verify </a> </div>`;
  await sendMail(user.email, "Verification Email", html);
  return token;
};

exports.login = async (data) => {
  const user = await userRepo.getUserByEmail(data.email);
  if (!user) {
    throw new Error("User does not exists");
  }
  const isValid = await comparePassword(user.password,data.password);
  if (!isValid) {
    throw new Error("Invalid Password");
  }
  const token = await generateToken({
    email: user.email,
    name: user.name,
    id: user.id,
    role: user.role,
  });

  return token;
};

exports.updateUser = async (id, data) => {
  let user = await userRepo.getUserById(id);
  if (!user) {
    throw new Error("Invalid User ID!!");
  }

  user = await userRepo.updateUser(id, data);
  return user;
};

exports.deleteUser = async (id) => {
  let user = await userRepo.getUserById(id);
  if (!user) {
    throw new Error("Invalid User ID!!");
  }
  user = await userRepo.deleteUser(id);
  return user;
};

exports.getUserById = async (id) => {
  let user = await userRepo.getUserById(id);
  let userDetails = await userDetailsService.getById(id);
  console.log(userDetails);
  if (!user) {
    throw new Error("Invalid User ID!!");
  }
  return {
    user,
    userDetails,
  };
};

exports.getAllUsers = async () => {
  let user = await userRepo.getAllUsers();
  return user;
};

exports.UserByQuery = async (query) => {
  let user = await userRepo.getUserQuery(query);
  return user;
};

exports.sendmail = async (token, otp) => {
 try {
   let OTP = map.get(token)
   if (OTP === otp) {
     let user = await decode(token);
     let updateUser = await userRepo.updateUser(user.id, { isVerified: true });
     return updateUser;
   } else {
     return "Invalid OTP";
   }
 } catch (error) {
    throw new Error("Unable to verify user", error);
 }
}