const { ApiError } = require("./ApiError"); //Imports custom error class

// [AI-G6] Central error handler for the API. Express requires four parameters to identify error middleware.
function errorHandler(error, req, res, next) {
    if (error instanceof ApiError) { //Checks if the error is the custom type
        return (res.status(error.status).json({ error: error.message }));
    }

    // [AI-G6] JSON parsing errors use the entity.parse.failed error type.
    if (error.type === "entity.parse.failed") { //Checks if the error is for malformed JSON
        return (res.status(400).json({ error: "Invalid JSON" }));
    }

    // [AI-G6] Converts MySQL constraint errors into responses the client can understand.
    // The specific MySQL error codes are an AI-suggested addition.
    // Source: https://dev.mysql.com/doc/mysql-errors/8.4/en/server-error-reference.html
    if (error.code === "ER_ROW_IS_REFERENCED_2") { //Checks if another record still references it
        return (res.status(409).json({ error: "Record is still referenced by another record" }));
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") { //Checks if the referenced record doesn't exist
        return (res.status(400).json({ error: "Referenced record does not exist" }));
    }

    if (error.code === "ER_DUP_ENTRY") { //Checks if the record conflicts with existing data
        return (res.status(409).json({ error: "Record conflicts with an existing value" }));
    }

    console.error(error); //Outputs the error to the console
    res.status(500).json({ error: "Internal server error" }); //Sends default error if no other case matches
}

module.exports = { errorHandler };