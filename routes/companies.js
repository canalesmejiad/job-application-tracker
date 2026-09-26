const express = require("express");
const companiesController = require("../controllers/companies");
const { requireAuthentication } = require("../middleware/auth");

const router = express.Router();

router.get("/", companiesController.getAllCompanies);
router.get("/:id", companiesController.getCompanyById);
router.post(
    "/",
    requireAuthentication,
    companiesController.createCompany
);
router.put(
    "/:id",
    requireAuthentication,
    companiesController.updateCompany
);
router.delete(
    "/:id",
    requireAuthentication,
    companiesController.deleteCompany
);

module.exports = router;
