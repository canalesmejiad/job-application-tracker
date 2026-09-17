const express = require("express");
const applicationsController = require("../controllers/applications");

const router = express.Router();

router.get("/", applicationsController.getAllApplications);
router.get("/:id", applicationsController.getApplicationById);
router.post("/", applicationsController.createApplication);
router.put("/:id", applicationsController.updateApplication);
router.delete("/:id", applicationsController.deleteApplication);

module.exports = router;