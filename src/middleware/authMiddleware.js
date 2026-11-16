const crypto = require("node:crypto"); //Loads a node.js module

/**
 * [AI-G6] Protects the API routes using the token provided by server.js.
 * Rejects missing/incorrect tokens with HTTP 401 and lets valid requests continue.
 * This custom check was suggested instead.
 * Source: https://expressjs.com/en/guide/writing-middleware/
 */
function requireApiToken(expectedToken) { //Gets supplied with an API token
    return function(req, res, next) { //Checks the token before allowing access to the API
        const header = req.get("authorization") || ""; //Gets the token header, or leaves it blank if missing

        // [AI-G6] Checks for "Bearer <token>" and extracts the token using a regular expression.
        // The /i allows different capitalization of "Bearer".
        // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        const match = /^Bearer (.+)$/i.exec(header); //Checks the Bearer token format

        // (const received = match ? Buffer.from(match[1]) : Buffer.alloc(0);) Found this online
        let received; //Holds the token received from the request
        if (match) {
            received = Buffer.from(match[1]);
        } else {
            received = Buffer.alloc(0);
        }

        const expected = Buffer.from(expectedToken); //Converts the expected token into bytes

        // [AI-G6] Uses timingSafeEqual to reduce timing information leaked when comparing secret tokens.
        // The length check also prevents timingSafeEqual from throwing on different-sized buffers.
        // Source: https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
        if (!received.length || received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
            return res.status(401).json({ error: "Missing or invalid bearer token" }); //Rejects requests with missing or incorrect tokens
        }

        next(); //Allows valid requests to continue to the API
    };
}

module.exports = { requireApiToken }; //Makes function available to app.js with the call