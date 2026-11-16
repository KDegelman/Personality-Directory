const { ApiError } = require("../middleware/ApiError");

// [AI-G6] Checks incoming JSON against the model's allowed fields before sending data to storage.
// Rejects unknown fields and invalid values. Partial updates can omit required fields.
// Suggested to reuse the same validation rules across all CRUD controllers.
// Source: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
function validateEntityInput(def, input, partial = false) { //Checks if missing needed info
    if (!input || typeof input !== "object" || Array.isArray(input)) { //Checks if input is valid JSON object data
        throw new ApiError(400, "Expected a JSON object");
    }

    const cleaned = {};

    for (const step of Object.keys(input)) { //Fills an array with properties names and checks every field if the name is valid for the model
        // [AI-G6] Object.hasOwn() checks that the field belongs directly to the model's field definitions.
        // Suggested to avoid accepting unexpected or inherited properties.
        // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
        if (!Object.hasOwn(def.fields, step)) { //Is name compatible
            throw new ApiError(400, ("Unexpected field: " + step));
        }
    }

    for (const step of Object.keys(def.fields)) { //Fills an array with properties names and checks every field if the value is valid for the model or if its missing info
        const rule = def.fields[step];
        const value = input[step];

        if (value === undefined) { //Is value present
            if (!partial && rule.required) { //Is it allowed to be unfilled
                throw new ApiError(400, ("Missing required field: " + step));
            }
            continue;
        }

        if (value === null) { //Is it null
            if (rule.required || (rule.type !== "string" && rule.type !== "date")) { //Reject if required or not a string/date
                throw new ApiError(400, (step + " cannot be null"));
            }

            cleaned[step] = null;
            continue;
        }

        switch (rule.type) {
            case "string":
            case "url": { //Is it a string or URL
                if (typeof value !== "string" || value.trim() === "" || value.length > rule.max) { //Is it a string, empty, or too long
                    throw new ApiError(400, (step + " must be a non-empty string (max " + rule.max + " characters)"));
                }

                const trimmed = value.trim();

                if (rule.type === "url") { //Is field meant to be URL
                    let parsed;

                    // [AI-G6] Uses Node.js's URL parser to check the URL format.
                    // Only HTTP and HTTPS are accepted by the additional protocol check below.
                    // Source: https://nodejs.org/api/url.html#new-urlinput-base
                    try {
                        parsed = new URL(trimmed); //Turn URL into object
                    } catch { //Jumps here if URL was not valid
                        throw new ApiError(400, (step + " must be an HTTP(S) URL"));
                    }

                    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") { //Is accepted protocol
                        throw new ApiError(400, (step + " must be an HTTP(S) URL"));
                    }
                }

                cleaned[step] = trimmed; //Pushes the now cleaned value
                break;
            }

            case "boolean": { //Is field meant to be boolean
                if (typeof value !== "boolean") {
                    throw new ApiError(400, (step + " must be true or false"));
                }

                cleaned[step] = value;
                break;
            }

            case "id": {
                if (!Number.isSafeInteger(value) || value < 1) { //Checks if it's a valid whole number.
                    throw new ApiError(400, (step + " must be a positive integer"));
                }

                cleaned[step] = value;
                break;
            }

            case "date": {
                // [AI-G6] Requires a full ISO date/time with a timezone and rejects impossible dates.
                // Date.parse() alone can accept non-ISO text or normalize invalid calendar dates.
                // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
                let match = null;
                if (typeof value === "string") {
                    match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
                }

                if (!match || !Number.isFinite(Date.parse(value))) {
                    throw new ApiError(400, (step + " must be a valid ISO date/time string"));
                }

                let offsetMinutes = 0;
                if (match[2] !== "Z") { //Checks the timezone offset
                    const hours = Number(match[2].slice(1, 3));
                    const minutes = Number(match[2].slice(4, 6));

                    if (hours > 23 || minutes > 59) {
                        throw new ApiError(400, (step + " must be a valid ISO date/time string"));
                    }

                    offsetMinutes = hours * 60 + minutes;
                    if (match[2][0] === "-") {
                        offsetMinutes = -offsetMinutes;
                    }
                }

                const date = new Date(value);
                const originalTime = new Date(date.getTime() + offsetMinutes * 60000).toISOString().slice(0, 19);
                if (originalTime !== match[1]) { //Rejects dates changed by JavaScript's parser
                    throw new ApiError(400, (step + " must be a valid ISO date/time string"));
                }

                cleaned[step] = (date.toISOString().slice(0, 19).replace("T", " ")); //Converts to MySQL UTC format
                break;
            }
        }
    }

    if (partial && Object.keys(cleaned).length === 0) {
        throw new ApiError(400, "No update fields provided");
    }

    return (cleaned);
}

function parsePositiveId(value) { //Makes the ID from the url available and turns it into a usable format
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id < 1) {
        throw new ApiError(400, "ID must be a positive integer");
    }

    return (id);
}

module.exports = { validateEntityInput, parsePositiveId };