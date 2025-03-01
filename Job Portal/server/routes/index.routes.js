const { Router } = require("express");
const userRouter = require("./user.routes");
const userDetailsRouter = require("./userDetail.routes");
const companyRouter = require("./company.routes");
const jobRouter = require("./job.routes");
const applicationRouter = require("./application.routes");
const router = Router();

router.use("/user", userRouter);
router.use("/user-detail", userDetailsRouter);
router.use("/company", companyRouter);
router.use("/job", jobRouter);
router.use("/application", applicationRouter);

module.exports = router;
