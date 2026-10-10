const { ObjectId } = require("mongodb");
const database = require("../data/database");

function validateContact(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "A JSON object is required";
    }

    const requiredFields = [
        "name",
        "email",
        "phone",
        "role",
        "companyId",
    ];

    const invalidFields = requiredFields.filter(
        (field) =>
            typeof data[field] !== "string" ||
            data[field].trim() === ""
    );

    if (invalidFields.length > 0) {
        return `Missing or invalid fields: ${invalidFields.join(", ")}`;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(data.email.trim())) {
        return "email must be a valid email address";
    }

    if (!ObjectId.isValid(data.companyId)) {
        return "companyId must be a valid MongoDB ID";
    }

    if (data.notes !== undefined && typeof data.notes !== "string") {
        return "notes must be a string";
    }

    return null;
}

async function getAllContacts(req, res) {
    try {
        const contacts = await database
            .getDb()
            .collection("contacts")
            .find()
            .toArray();

        return res.status(200).json(contacts);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to retrieve contacts",
        });
    }
}

async function getContactById(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid contact ID",
            });
        }

        const contact = await database
            .getDb()
            .collection("contacts")
            .findOne({ _id: new ObjectId(id) });

        if (!contact) {
            return res.status(404).json({
                error: "Contact not found",
            });
        }

        return res.status(200).json(contact);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to retrieve contact",
        });
    }
}

async function createContact(req, res) {
    try {
        const validationError = validateContact(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const companyId = new ObjectId(req.body.companyId);

        const company = await database
            .getDb()
            .collection("companies")
            .findOne({ _id: companyId });

        if (!company) {
            return res.status(400).json({
                error: "companyId does not reference an existing company",
            });
        }

        const contact = {
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            phone: req.body.phone.trim(),
            role: req.body.role.trim(),
            companyId,
            notes: req.body.notes?.trim() || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await database
            .getDb()
            .collection("contacts")
            .insertOne(contact);

        return res.status(201).json({
            ...contact,
            _id: result.insertedId,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Unable to create contact",
        });
    }
}

async function updateContact(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid contact ID",
            });
        }

        const validationError = validateContact(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const companyId = new ObjectId(req.body.companyId);

        const company = await database
            .getDb()
            .collection("companies")
            .findOne({ _id: companyId });

        if (!company) {
            return res.status(400).json({
                error: "companyId does not reference an existing company",
            });
        }

        const updatedContact = {
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            phone: req.body.phone.trim(),
            role: req.body.role.trim(),
            companyId,
            notes: req.body.notes?.trim() || "",
            updatedAt: new Date(),
        };

        const collection = database.getDb().collection("contacts");
        const filter = { _id: new ObjectId(id) };

        const result = await collection.updateOne(
            filter,
            { $set: updatedContact }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Contact not found",
            });
        }

        const contact = await collection.findOne(filter);

        return res.status(200).json(contact);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to update contact",
        });
    }
}
async function deleteContact(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid contact ID",
            });
        }

        const result = await database
            .getDb()
            .collection("contacts")
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Contact not found",
            });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({
            error: "Unable to delete contact",
        });
    }
}

module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
};