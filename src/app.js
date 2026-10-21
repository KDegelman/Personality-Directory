const express = require("express");
const { requireApiToken } = require("./middleware/authMiddleware");
const { errorHandler } = require("./middleware/errorHandler");
const { createCrudRouter } = require("./routes/crudRoutes");
const { personality, category, socialProfile } = require("./models");

function createApp({ store, apiToken }) {
    const app = express();
    app.disable("x-powered-by");
    app.use(express.json({ limit: "64kb" }));

    // Same simple server-status endpoint pattern as the author's earlier EIDR project.
    app.get("/", (req, res) => res.send("Personality Directory backend is running!"));
    app.get("/health", (req, res) => res.json({ success: true, application: "Personality Directory", storage: store.mode }));

    // Only the status endpoints are public; all API routes require a bearer token.
    app.use("/api", requireApiToken(apiToken));
    app.use("/api/personalities", createCrudRouter(store, personality));
    app.use("/api/categories", createCrudRouter(store, category));
    app.use("/api/social-profiles", createCrudRouter(store, socialProfile));

    app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));
    app.use(errorHandler);
    return app;
}

module.exports = { createApp };
