/**
 * Middleware to check if user has required role(s)
 * @param {string[]} roles - Array of allowed roles
 */
const Ability = (roles = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has a role
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        });
      }

      // Check if user's role is allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource"
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization"
      });
    }
  };
};

module.exports = Ability;
