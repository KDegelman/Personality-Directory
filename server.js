// Adapted from the author's Web Data Importer: create an Express app and listen locally.
require("dotenv").config();
const crypto = require("node:crypto");
const { createApp } = require("./src/app");
const { createMemoryStore } = require("./src/storage/memoryStore");
const { createMysqlStore } = require("./src/storage/mysqlStore");

async function start() {
    const port = Number(process.env.PORT || 3000);
    const host = process.env.HOST || "127.0.0.1";
    const dbMode = process.env.DB_MODE || "memory";
    const store = dbMode === "mysql" ? await createMysqlStore() : dbMode === "memory" ? createMemoryStore() : null;
    if (!store) throw new Error("DB_MODE must be 'memory' or 'mysql'.");

    // A new development token is generated on each start unless API_TOKEN is configured.
    const generatedToken = crypto.randomBytes(24).toString("hex");
    const apiToken = process.env.API_TOKEN || generatedToken;
    const app = createApp({ store, apiToken });

    const server = app.listen(port, host, () => {
        console.log(`Personality Directory running at http://${host}:${port}`);
        console.log(`Storage: ${dbMode}`);
        if (!process.env.API_TOKEN) console.log(`Development API token: ${apiToken}`);
        console.log("Stop the server with Ctrl+C.");
    });
    const shutdown = () => server.close(() => { if (store.close) store.close(); });
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start().catch(error => {
    console.error("Could not start the server:", error.message);
    process.exitCode = 1;
});
