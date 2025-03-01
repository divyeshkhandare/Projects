const { Router } = require("express");
const userDetailsController = require("../controllers/userDetails.controller");
const router = Router();

router.get("/user/:userId", userDetailsController.getUserDetailsById);
router.patch("/:userId", userDetailsController.updateDetails);
router.post("/", userDetailsController.createDetails);

module.exports = router;
