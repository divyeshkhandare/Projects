const { Router } = require("express");
const userRouter = require("./user.routes");
const statusRouter = require("./status.routes");
const taskRouter = require("./task.routes");
const decodeToken = require("../middleware/decodeToken");
const router = Router();

router.use("/user", decodeToken,userRouter);
router.use("/status", decodeToken,statusRouter);
router.use("/task", decodeToken,taskRouter);

module.exports = router;
