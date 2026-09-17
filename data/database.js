const { MongoClient } = require("mongodb");

let database;

async function initDb() {
    if (database) {
        return database;
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    database = client.db(process.env.DATABASE_NAME);
    console.log("Connected to MongoDB");

    return database;
}

function getDb() {
    if (!database) {
        throw new Error("MongoDB has not been initialized");
    }

    return database;
}

module.exports = {
    initDb,
    getDb,
};