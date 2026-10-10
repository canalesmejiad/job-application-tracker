const { test } = require("node:test");
const assert = require("node:assert/strict");

const database = require("../data/database");
const applicationsController = require("../controllers/applications");

test("getAllApplications returns applications with status 200", async (t) => {
    const expectedApplications = [
        {
            position: "Junior Web Developer",
            status: "applied",
        },
    ];

    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "applications");

            return {
                find() {
                    return {
                        sort(order) {
                            assert.deepEqual(order, { appliedDate: -1 });
                            return this;
                        },

                        async toArray() {
                            return expectedApplications;
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

    await applicationsController.getAllApplications(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, expectedApplications);
});

test("getApplicationById returns 404 when application does not exist", async (t) => {
    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "applications");

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

    await applicationsController.getApplicationById(req, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        error: "Application not found",
    });
});