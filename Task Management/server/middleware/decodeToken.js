const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const decodeToken = (req, res, next) => {
  const publicRoutes = ["/user/login", "/user/register"];
  if (publicRoutes.includes(req.url)) {
    return next();
  }

  let token = req.cookies.token;

  console.log("Token from cookies:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = decodeToken;
