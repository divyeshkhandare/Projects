const jwt = require("jsonwebtoken");
require("dotenv").config();

const PUBLIC_ROUTES = [
  "/user/signup",
  "/user/signin",
  "/user/verify"
];

const decodeToken = async (req, res, next) => {
  try {
    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => req.url.startsWith(route));
    if (isPublicRoute) {
      return next();
    }

    // Get and validate token
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided"
      });
    }

    // Extract and verify token
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use 'Bearer <token>'"
      });
    }

    try {
      const decoded = await jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};

module.exports = decodeToken;
