const { test } = require("node:test");
const assert = require("node:assert/strict");

const database = require("../data/database");
const interviewsController = require("../controllers/interviews");

test("getAllInterviews returns interviews with status 200", async (t) => {
    const expectedInterviews = [
        {
            interviewer: "Jordan Smith",
            type: "video",
            status: "scheduled",
        },
    ];

    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "interviews");

            return {
                find() {
                    return {
                        async toArray() {
                            return expectedInterviews;
                        },
                    };
                },
            };
        },
    }));

    const req = {};
    const res = {
        statusCode: null,
        body: null,

        status(code) {
            this.statusCode = code;
            return this;
        },

        json(data) {
            this.body = data;
            return this;
        },
    };

    await interviewsController.getAllInterviews(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, expectedInterviews);
});

test("getInterviewById returns 404 when interview does not exist", async (t) => {
    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "interviews");

            return {
                async findOne(filter) {
                    assert.equal(
                        filter._id.toHexString(),
                        "000000000000000000000000"
                    );

                    return null;
                },
            };
        },
    }));

    const req = {
        params: {
            id: "000000000000000000000000",
        },
    };

    const res = {
        statusCode: null,
        body: null,

        status(code) {
            this.statusCode = code;
            return this;
        },

        json(data) {
            this.body = data;
            return this;
        },
    };

    await interviewsController.getInterviewById(req, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        error: "Interview not found",
    });
});