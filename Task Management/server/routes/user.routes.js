const userController = require("../controllers/user.controller");
const { Router } = require("express");
const userRouter = Router();

userRouter.post("/signup", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/", userController.getUsers);

module.exports = userRouter;
