const { Router } = require("express");
const jobController = require("../controllers/job.controller");
const router = Router();

router.post("/", jobController.createJob);
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.patch("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);
router.get("/company/:companyId", jobController.getJobsByCompanyId);

module.exports = router;
