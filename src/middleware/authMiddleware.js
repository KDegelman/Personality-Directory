const crypto = require("node:crypto");

function requireApiToken(expectedToken) {
    return (req, res, next) => {
        const header = req.get("authorization") || "";
        const match = /^Bearer (.+)$/i.exec(header);
        const received = match ? Buffer.from(match[1]) : Buffer.alloc(0);
        const expected = Buffer.from(expectedToken);
        if (!received.length || received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
            return res.status(401).json({ error: "Missing or invalid bearer token" });
        }
        next();
    };
}
module.exports = { requireApiToken };
