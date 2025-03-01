const { Router } = require("express");
const userController = require("../controllers/user.controller");
const userRouter = Router();

userRouter.post("/signup", userController.signupUser);
userRouter.post("/signin", userController.loginUser);
userRouter.patch("/:userId", userController.updateUser);
userRouter.delete("/userId", userController.deleteUser);
userRouter.get("/info/:userId", userController.getUserById);
userRouter.get("/", userController.findUsersByQuery);
userRouter.get("/verify/:token/:otp", userController.emailVerification);

module.exports = userRouter;
