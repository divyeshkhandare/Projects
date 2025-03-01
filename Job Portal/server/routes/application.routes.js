const applicationController = require ("../controllers/application.controller")
const { Router } = require("express")
const router = Router()

router.get("/", applicationController.getAll);
router.post("/", applicationController.applyApplication);
router.patch("/:id", applicationController.updateApplication);
router.get("/user/:userId", applicationController.getApplicationsByUserId);
router.get("/job/:jobId", applicationController.getByJobId);

module.exports = router;