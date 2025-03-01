const { Router } = require("express");
const companyController = require("../controllers/company.controller");
const Ability = require("../middleware/Ability");
const router = Router();

router.post("/create", Ability(["HR"]),companyController.createCompany);
router.patch("/update/:id", Ability(["HR"]), companyController.updateCompany);
router.get("/", companyController.getAll);
router.delete("/:id", Ability(["HR"]) ,companyController.deleteCompany);
router.get("/:id" ,companyController.getCompanyById);
router.get("/admin/unverified", Ability(["Admin"]),companyController.getUnverifiedCompanies);

module.exports = router;
