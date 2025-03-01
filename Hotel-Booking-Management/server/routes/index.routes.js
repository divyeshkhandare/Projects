const userRouter = require("./user.routes");
const { Router } = require("express");
const router = Router();

router.use("/users", userRouter);

module.exports = router;