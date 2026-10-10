const express = require("express");
const applicationsController = require("../controllers/applications");
const { requireAuthentication } = require("../middleware/auth");

const router = express.Router();

router.get("/", applicationsController.getAllApplications);
router.get("/:id", applicationsController.getApplicationById);
router.post(
    "/",
    requireAuthentication,
    applicationsController.createApplication
);
router.put(
    "/:id",
    requireAuthentication,
    applicationsController.updateApplication
);
router.delete(
    "/:id",
    requireAuthentication,
    applicationsController.deleteApplication
);

module.exports = router;
