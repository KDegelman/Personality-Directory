const express = require("express");
const path = require("node:path");
const { requireApiToken } = require("./middleware/authMiddleware");
const { errorHandler } = require("./middleware/errorHandler");
const { createCrudRouter } = require("./routes/crudRoutes");
const { personality, category, socialProfile } = require("./models");

function createApp({ store, apiToken }) { //Sets up the app using the storage system and token given by server.js
    const app = express(); //Creates the Express application

    // [AI-G6] Disables the X-Powered-By header to avoid advertising that the server uses Express.
    // Suggested by Express's security best practices to reduce basic server fingerprinting.
    // Source: https://expressjs.com/en/advanced/best-practice-security.html
    app.disable("x-powered-by");

    // [AI-G6] Uses a custom bearer-token check rather than the JWT/Passport approach
    // Suggested as a simpler authentication method for this project's API.
    // Source: https://expressjs.com/en/guide/using-middleware.html
    app.use(express.json()); //Allows Express to read JSON sent to the server

    app.get("/", function(req, res) {
        res.send("Personality Directory backend is running!");
    });

    app.get("/health", function(req, res) { //Reports the server status and which storage system is being used
        res.json({
            success: true,
            application: "Personality Directory",
            storage: store.mode
        });
    });

    // [AI-G6] The status routes are public, while requests under /api require a bearer token.
    // [AI-G6] Serves the basic website from /site without changing the existing API routes.
    // Source: https://expressjs.com/en/5x/starter/static-files/
    app.use("/site", express.static(path.join(__dirname, "../public")));

    app.use("/api", requireApiToken(apiToken)); //Checks for a valid token before allowing API requests

    //Sets up the URLs for each entity using the same CRUD functions
    app.use("/api/personalities", createCrudRouter(store, personality));
    app.use("/api/categories", createCrudRouter(store, category));
    app.use("/api/social-profiles", createCrudRouter(store, socialProfile));

    app.use(function(req, res) { //Handles requests to URLs that we haven't set up
        res.status(404).json({ error: "Endpoint not found" });
    });

    app.use(errorHandler); //Handles errors from the application and sends the appropriate response
    return (app); //Gives the finished Express app back to server.js
}

module.exports = { createApp }; //Makes createApp available to other files