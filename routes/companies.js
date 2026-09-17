const express = require("express");
const companiesController = require("../controllers/companies");

const router = express.Router();

router.get("/", companiesController.getAllCompanies);
router.get("/:id", companiesController.getCompanyById);
router.post("/", companiesController.createCompany);
router.put("/:id", companiesController.updateCompany);
router.delete("/:id", companiesController.deleteCompany);

module.exports = router;