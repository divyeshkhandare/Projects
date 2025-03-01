const jwt = require("jsonwebtoken");
require("dotenv").config();

const decodeToken = async (req, res, next) => {
  const publicRoutes = ["/user/signup", "/user/signin"];
  let url = req.url;
  if (url.includes("/user/verify")) {
    return next();
  }
  if (publicRoutes.includes(req.url)) {
    return next();
  }
  let token = req.headers["authorization"];
  if (token) {
    try {
      token = token.split(" ")[1];
      let decode = await jwt.verify(token, process.env.JWT_KEY);
      req.user = decode;
      next();
    } catch (error) {
      return res.status(403).send({ message: error.message });
    }
  } else {
    return res.status(403).send({ message: "Invalid authorization token." });
  }
};

module.exports = decodeToken;
