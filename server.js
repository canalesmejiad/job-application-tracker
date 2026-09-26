const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const database = require("./data/database");
const { configurePassport, passport } = require("./config/passport");
const swaggerDocument = require("./swagger.json");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const applicationsRoutes = require("./routes/applications");

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
}

configurePassport();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(
    session({
        name: "job-tracker.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            dbName: process.env.DATABASE_NAME,
            collectionName: "sessions",
            ttl: 14 * 24 * 60 * 60,
        }),
        cookie: {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production" ||
                process.env.RENDER === "true",
            sameSite: "lax",
            maxAge: 14 * 24 * 60 * 60 * 1000,
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/applications", applicationsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Job Application Tracker API",
        documentation: "/api-docs",
        authentication: {
            authenticated: req.isAuthenticated(),
            login: "/auth/github",
            logout: "/auth/logout",
            status: "/auth/status",
        },
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        error: "Internal server error",
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
