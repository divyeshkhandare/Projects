const Ability = (role = []) => {
  return (req, res, next) => {
    if (role.includes(req.user.role)) {
      next();
    } else {
      res.status(403).send("You are not authorized to access this resource");
    }
  };
};

module.exports = Ability;
