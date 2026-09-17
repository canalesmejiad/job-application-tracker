const { ObjectId } = require("mongodb");
const database = require("../data/database");

function getCollection() {
    return database.getDb().collection("companies");
}

function validateCompany(data) {
    const requiredFields = [
        "name",
        "website",
        "industry",
        "location",
        "contactName",
        "contactEmail",
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            typeof data[field] !== "string" ||
            data[field].trim() === ""
    );

    if (missingFields.length > 0) {
        return `Missing or invalid fields: ${missingFields.join(", ")}`;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(data.contactEmail)) {
        return "contactEmail must be a valid email address";
    }

    try {
        const website = new URL(data.website);

        if (!["http:", "https:"].includes(website.protocol)) {
            return "website must use http or https";
        }
    } catch {
        return "website must be a valid URL";
    }

    return null;
}

function buildCompany(data) {
    return {
        name: data.name.trim(),
        website: data.website.trim(),
        industry: data.industry.trim(),
        location: data.location.trim(),
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim().toLowerCase(),
        notes: typeof data.notes === "string" ? data.notes.trim() : "",
    };
}

async function getAllCompanies(req, res) {
    try {
        const companies = await getCollection()
            .find()
            .sort({ name: 1 })
            .toArray();

        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({
            error: "Unable to retrieve companies",
        });
    }
}

async function getCompanyById(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid company ID",
            });
        }

        const company = await getCollection().findOne({
            _id: new ObjectId(id),
        });

        if (!company) {
            return res.status(404).json({
                error: "Company not found",
            });
        }

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({
            error: "Unable to retrieve company",
        });
    }
}

async function createCompany(req, res) {
    try {
        const validationError = validateCompany(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const company = {
            ...buildCompany(req.body),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await getCollection().insertOne(company);

        res.status(201).json({
            _id: result.insertedId,
            ...company,
        });
    } catch (error) {
        res.status(500).json({
            error: "Unable to create company",
        });
    }
}

async function updateCompany(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid company ID",
            });
        }

        const validationError = validateCompany(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const updatedCompany = {
            ...buildCompany(req.body),
            updatedAt: new Date(),
        };

        const result = await getCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedCompany }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Company not found",
            });
        }

        const company = await getCollection().findOne({
            _id: new ObjectId(id),
        });

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({
            error: "Unable to update company",
        });
    }
}

async function deleteCompany(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid company ID",
            });
        }

        const result = await getCollection().deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Company not found",
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: "Unable to delete company",
        });
    }
}

module.exports = {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
};