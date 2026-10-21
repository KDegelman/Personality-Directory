const { ApiError } = require("../middleware/ApiError");

function validateEntityInput(definition, input, partial = false) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiError(400, "Expected a JSON object");
    const allowedFields = definition.fields;
    const cleaned = {};

    for (const field of Object.keys(input)) {
        if (!Object.hasOwn(allowedFields, field)) throw new ApiError(400, `Unexpected field: ${field}`);
    }
    for (const [name, rule] of Object.entries(allowedFields)) {
        const value = input[name];
        if (value === undefined) {
            if (!partial && rule.required) throw new ApiError(400, `Missing required field: ${name}`);
            continue;
        }
        if (value === null) {
            if (rule.required || !["string", "date"].includes(rule.type)) {
                throw new ApiError(400, `${name} cannot be null`);
            }
            cleaned[name] = null;
            continue;
        }
        if (rule.type === "string" || rule.type === "url") {
            if (typeof value !== "string" || value.trim() === "" || value.length > rule.max) {
                throw new ApiError(400, `${name} must be a non-empty string (max ${rule.max} characters)`);
            }
            const trimmed = value.trim();
            if (rule.type === "url") {
                try {
                    const parsed = new URL(trimmed);
                    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
                } catch { throw new ApiError(400, `${name} must be an HTTP(S) URL`); }
            }
            cleaned[name] = trimmed;
        } else if (rule.type === "boolean") {
            if (typeof value !== "boolean") throw new ApiError(400, `${name} must be true or false`);
            cleaned[name] = value;
        } else if (rule.type === "id") {
            if (!Number.isSafeInteger(value) || value < 1) throw new ApiError(400, `${name} must be a positive integer`);
            cleaned[name] = value;
        } else if (rule.type === "date") {
            if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
                throw new ApiError(400, `${name} must be an ISO date/time string`);
            }
            cleaned[name] = new Date(value).toISOString().slice(0, 19).replace("T", " ");
        }
    }
    if (partial && Object.keys(cleaned).length === 0) throw new ApiError(400, "No update fields provided");
    return cleaned;
}

function parsePositiveId(value) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(400, "ID must be a positive integer");
    return id;
}

module.exports = { validateEntityInput, parsePositiveId };
