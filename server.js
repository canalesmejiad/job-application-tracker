const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const database = require("./data/database");
const swaggerDocument = require("./swagger.json");
const companiesRoutes = require("./routes/companies");
const applicationsRoutes = require("./routes/applications");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.use("/companies", companiesRoutes);
app.use("/applications", applicationsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Job Application Tracker API",
        documentation: "/api-docs",
    });
});

async function startServer() {
    try {
        await database.initDb();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
}

startServer();