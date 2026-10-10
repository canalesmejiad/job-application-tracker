const express = require("express");
const contactsController = require("../controllers/contacts");
const { requireAuthentication } = require("../middleware/auth");

const router = express.Router();

router.get("/", contactsController.getAllContacts);
router.get("/:id", contactsController.getContactById);

router.post(
    "/",
    requireAuthentication,
    contactsController.createContact
);

router.put(
    "/:id",
    requireAuthentication,
    contactsController.updateContact
);

router.delete(
    "/:id",
    requireAuthentication,
    contactsController.deleteContact
);

module.exports = router;