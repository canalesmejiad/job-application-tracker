const { ObjectId } = require("mongodb");
const database = require("../data/database");

function validateInterview(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "A JSON object is required";
    }

    const requiredFields = [
        "applicationId",
        "scheduledAt",
        "type",
        "interviewer",
        "location",
        "status",
    ];

    const invalidFields = requiredFields.filter(
        (field) =>
            typeof data[field] !== "string" ||
            data[field].trim() === ""
    );

    if (invalidFields.length > 0) {
        return `Missing or invalid fields: ${invalidFields.join(", ")}`;
    }

    if (!ObjectId.isValid(data.applicationId)) {
        return "applicationId must be a valid MongoDB ID";
    }

    const dateTimePattern =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

    if (
        !dateTimePattern.test(data.scheduledAt) ||
        Number.isNaN(Date.parse(data.scheduledAt))
    ) {
        return "scheduledAt must be a valid ISO date-time with timezone";
    }

    const allowedTypes = ["phone", "video", "onsite"];

    if (!allowedTypes.includes(data.type)) {
        return "type must be phone, video, or onsite";
    }

    const allowedStatuses = ["scheduled", "completed", "cancelled"];

    if (!allowedStatuses.includes(data.status)) {
        return "status must be scheduled, completed, or cancelled";
    }

    if (data.notes !== undefined && typeof data.notes !== "string") {
        return "notes must be a string";
    }

    return null;
}

async function getAllInterviews(req, res) {
    try {
        const interviews = await database
            .getDb()
            .collection("interviews")
            .find()
            .toArray();

        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to retrieve interviews",
        });
    }
}

async function getInterviewById(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid interview ID",
            });
        }

        const interview = await database
            .getDb()
            .collection("interviews")
            .findOne({ _id: new ObjectId(id) });

        if (!interview) {
            return res.status(404).json({
                error: "Interview not found",
            });
        }

        return res.status(200).json(interview);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to retrieve interview",
        });
    }
}
async function createInterview(req, res) {
    try {
        const validationError = validateInterview(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const applicationId = new ObjectId(req.body.applicationId);

        const application = await database
            .getDb()
            .collection("applications")
            .findOne({ _id: applicationId });

        if (!application) {
            return res.status(400).json({
                error: "applicationId does not reference an existing application",
            });
        }

        const interview = {
            applicationId,
            scheduledAt: new Date(req.body.scheduledAt),
            type: req.body.type,
            interviewer: req.body.interviewer.trim(),
            location: req.body.location.trim(),
            status: req.body.status,
            notes: req.body.notes?.trim() || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await database
            .getDb()
            .collection("interviews")
            .insertOne(interview);

        return res.status(201).json({
            ...interview,
            _id: result.insertedId,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Unable to create interview",
        });
    }
}
async function updateInterview(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid interview ID",
            });
        }

        const validationError = validateInterview(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            });
        }

        const applicationId = new ObjectId(req.body.applicationId);

        const application = await database
            .getDb()
            .collection("applications")
            .findOne({ _id: applicationId });

        if (!application) {
            return res.status(400).json({
                error: "applicationId does not reference an existing application",
            });
        }

        const updatedInterview = {
            applicationId,
            scheduledAt: new Date(req.body.scheduledAt),
            type: req.body.type,
            interviewer: req.body.interviewer.trim(),
            location: req.body.location.trim(),
            status: req.body.status,
            notes: req.body.notes?.trim() || "",
            updatedAt: new Date(),
        };

        const collection = database.getDb().collection("interviews");
        const filter = { _id: new ObjectId(id) };

        const result = await collection.updateOne(
            filter,
            { $set: updatedInterview }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Interview not found",
            });
        }

        const interview = await collection.findOne(filter);

        return res.status(200).json(interview);
    } catch (error) {
        return res.status(500).json({
            error: "Unable to update interview",
        });
    }
}
async function deleteInterview(req, res) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid interview ID",
            });
        }

        const result = await database
            .getDb()
            .collection("interviews")
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Interview not found",
            });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({
            error: "Unable to delete interview",
        });
    }
}

module.exports = {
    getAllInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview,
};