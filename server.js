// [AI-G6] Loads .env configuration into process.env, keeping machine-specific settings out of the code.
// Suggested for configurable database connections and authentication.
// Source: https://github.com/motdotla/dotenv#readme
require("dotenv").config();

const crypto = require("node:crypto"); //Gets the tools for generating an API token
const { createApp } = require("./src/app");
const { createMysqlStore } = require("./src/storage/mysqlStore");

async function start() { //Sets up storage and starts the server
    const port = Number(process.env.PORT || 3000); //Sets the server port
    const host = process.env.HOST || "127.0.0.1"; //Sets the server IP, defaults to this computer
    const store = await createMysqlStore(); //Sets up MySQL storage

    // [AI-G6] A development token is generated on startup and used when API_TOKEN isn't configured.
    const generatedToken = crypto.randomBytes(24).toString("hex"); //Creates and converts random bytes to hexadecimal text
    const apiToken = process.env.API_TOKEN || generatedToken; //Sets the token required to access the API
    const app = createApp({ store, apiToken }); //Gives app.js our storage system and token

    const server = app.listen(port, host, function() { //Starts the server and runs this function once it's listening
        console.log(("Personality Directory running at http://" + host + ":" + port));

        if (!process.env.API_TOKEN) {
            console.log(("Development API token: " + apiToken));
        }

        console.log("Stop the server with Ctrl+C.");
    });

    // [AI-G6] Stops accepting new HTTP connections before closing the storage system.
    // Suggested for controlled shutdown and resource cleanup.
    // Source: https://nodejs.org/api/net.html#serverclosecallback
    function shutdown() {
        server.close(function() {
            if (store.close) {
                store.close(); //Closes the storage system if it has a close function
            }
        });
    }

    // [AI-G6] Detects operating-system termination signals and calls our shutdown function.
    // Suggested for handling server termination instead of relying on the default process behaviour.
    // Source: https://nodejs.org/api/process.html#signal-events
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

//Catches errors during startup and reports that the server failed
start().catch(function(error) {
    console.error("Could not start the server:", error.message);
    process.exitCode = 1; //Marks the program as failed
});