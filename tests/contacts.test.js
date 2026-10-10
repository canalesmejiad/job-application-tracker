const { test } = require("node:test");
const assert = require("node:assert/strict");

const database = require("../data/database");
const contactsController = require("../controllers/contacts");

test("getAllContacts returns contacts with status 200", async (t) => {
    const expectedContacts = [
        {
            name: "Jordan Smith",
            email: "jordan@example.com",
        },
    ];

    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "contacts");

            return {
                find() {
                    return {
                        async toArray() {
                            return expectedContacts;
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

    await contactsController.getAllContacts(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, expectedContacts);
});

test("getContactById returns 404 when contact does not exist", async (t) => {
    t.mock.method(database, "getDb", () => ({
        collection(name) {
            assert.equal(name, "contacts");

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

    await contactsController.getContactById(req, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        error: "Contact not found",
    });
});