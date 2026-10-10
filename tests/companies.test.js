const { test } = require("node:test");
const assert = require("node:assert/strict");

const database = require("../data/database");
const companiesController = require("../controllers/companies");

test("getAllCompanies returns companies with status 200", async (t) => {
    const expectedCompanies = [
        {
            name: "Acme Technology Group",
            industry: "Software",
        },
    ];

    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "companies");

            return {
                find() {
                    return {
                        sort(order) {
                            assert.deepEqual(order, { name: 1 });
                            return this;
                        },

                        async toArray() {
                            return expectedCompanies;
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

    await companiesController.getAllCompanies(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, expectedCompanies);
});

test("getCompanyById returns 404 when company does not exist", async (t) => {
    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "companies");

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

    await companiesController.getCompanyById(req, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        error: "Company not found",
    });
});