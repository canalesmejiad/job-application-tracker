const express = require("express");
const interviewsController = require("../controllers/interviews");
const { requireAuthentication } = require("../middleware/auth");

const router = express.Router();

router.get("/", interviewsController.getAllInterviews);
router.get("/:id", interviewsController.getInterviewById);

router.post(
    "/",
    requireAuthentication,
    interviewsController.createInterview
);

router.put(
    "/:id",
    requireAuthentication,
    interviewsController.updateInterview
);

router.delete(
    "/:id",
    requireAuthentication,
    interviewsController.deleteInterview
);

module.exports = router;