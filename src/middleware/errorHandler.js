const { ApiError } = require("./ApiError");

function errorHandler(error, req, res, next) {
    if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
    if (error.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    if (error.code === "ER_ROW_IS_REFERENCED_2") return res.status(409).json({ error: "Record is still referenced by another record" });
    if (error.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Referenced record does not exist" });
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Record conflicts with an existing value" });
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}
module.exports = { errorHandler };
