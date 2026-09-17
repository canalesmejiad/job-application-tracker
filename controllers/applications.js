const { ObjectId } = require("mongodb");
const database = require("../data/database");

function getCollection() {
    return database.getDb().collection("applications");
}

function validateApplication(data) {
    const requiredFields = [
        "position",
        "companyId",
        "appliedDate",
        "status",
        "workMode",
        "location",
        "salaryRange",
        "jobUrl",
        "description",
    ];

    const missingFields = requiredFields.filter(
        (field) =>
            typeof data[field] !== "string" ||
            data[field].trim() === ""
    );

    if (missingFields.length > 0) {
        return `Missing or invalid fields: ${missingFields.join(", ")}`;
    }

    if (!ObjectId.isValid(data.companyId)) {
        return "companyId must be a valid MongoDB ID";
    }

    if (Number.isNaN(Date.parse(data.appliedDate))) {
        return "appliedDate must be a valid date";
    }

    const allowedStatuses = [
        "saved",
        "applied",
        "interviewing",
        "offer",
        "rejected",
        "withdrawn",
    ];

    if (!allowedStatuses.includes(data.status.trim().toLowerCase())) {
        return `status must be one of: ${allowedStatuses.join(", ")}`;
    }

    const allowedWorkModes = ["remote", "hybrid", "onsite"];

    if (!allowedWorkModes.includes(data.workMode.trim().toLowerCase())) {
        return `workMode must be one of: ${allowedWorkModes.join(", ")}`;
    }

    if (
        !Array.isArray(data.technologies) ||
        data.technologies.length === 0 ||
        data.technologies.some(
            (technology) =>
                typeof technology !== "string" ||
                technology.trim() === ""
        )
    ) {
        return "technologies must be a non-empty array of strings";
    }

    try {
        const jobUrl = new URL(data.jobUrl);

        if (!["http:", "https:"].includes(jobUrl.protocol)) {
            return "jobUrl must use http or https";
        }
    } catch {
        return "jobUrl must be a valid URL";
    }

    return null;
}

function buildApplication(data) {
    return {
        position: data.position.trim(),
        companyId: new ObjectId(data.companyId),
        appliedDate: new Date(data.appliedDate),
        status: data.status.trim().toLowerCase(),
        workMode: data.workMode.trim().toLowerCase(),
        location: data.location.trim(),
        salaryRange: data.salaryRange.trim(),
        jobUrl: data.jobUrl.trim(),
        description: data.description.trim(),
        technologies: data.technologies.map((technology) =>
            technology.trim()
        ),
        notes: typeof data.notes === "string" ? data.notes.trim() : "",
    };
}

async function companyExists(companyId) {
    const company = await database
        .getDb()
        .collection("companies")
        .findOne({ _id: new ObjectId(companyId) });

    return Boolean(company);
}

async function getAllApplications(req, res) {
    try {
        const applications = await getCollection()
            .find()
            .sort({ appliedDate: -1 })
            .toArray();

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({
            error: "Unable to retrieve applications",
        });
    }
}

async function getApplicationById(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid application ID",
            });
        }

        const application = await getCollection().findOne({
            _id: new ObjectId(id),
        });

        if (!application) {
            return res.status(404).json({
                error: "Application not found",
            });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({
            error: "Unable to retrieve application",
        });
    }
}

async function createApplication(req, res) {
    try {
        const validationError = validateApplication(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        if (!(await companyExists(req.body.companyId))) {
            return res.status(400).json({
                error: "companyId does not reference an existing company",
            });
        }

        const application = {
            ...buildApplication(req.body),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await getCollection().insertOne(application);

        res.status(201).json({
            _id: result.insertedId,
            ...application,
        });
    } catch (error) {
        res.status(500).json({
            error: "Unable to create application",
        });
    }
}

async function updateApplication(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid application ID",
            });
        }

        const validationError = validateApplication(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        if (!(await companyExists(req.body.companyId))) {
            return res.status(400).json({
                error: "companyId does not reference an existing company",
            });
        }

        const updatedApplication = {
            ...buildApplication(req.body),
            updatedAt: new Date(),
        };

        const result = await getCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedApplication }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Application not found",
            });
        }

        const application = await getCollection().findOne({
            _id: new ObjectId(id),
        });

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({
            error: "Unable to update application",
        });
    }
}

async function deleteApplication(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid application ID",
            });
        }

        const result = await getCollection().deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Application not found",
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: "Unable to delete application",
        });
    }
}

module.exports = {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
};