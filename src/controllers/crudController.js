const { ApiError } = require("../middleware/ApiError");
const { validateEntityInput, parsePositiveId } = require("../validators/entityValidator");

// Translates CRUD operations from the author's Java Gym project into JSON/HTTP actions.
function makeCrudController(store, definition) {
    return {
        list: async (req, res) => res.json(await store.list(definition)),
        read: async (req, res) => {
            const item = await store.find(definition, parsePositiveId(req.params.id));
            if (!item) throw new ApiError(404, "Record not found");
            res.json(item);
        },
        create: async (req, res) => {
            const data = validateEntityInput(definition, req.body);
            const item = await store.create(definition, data);
            res.status(201).json(item);
        },
        update: async (req, res) => {
            const id = parsePositiveId(req.params.id);
            const data = validateEntityInput(definition, req.body, true);
            const item = await store.update(definition, id, data);
            if (!item) throw new ApiError(404, "Record not found");
            res.json(item);
        },
        remove: async (req, res) => {
            const deleted = await store.remove(definition, parsePositiveId(req.params.id));
            if (!deleted) throw new ApiError(404, "Record not found");
            res.status(204).end();
        }
    };
}
module.exports = { makeCrudController };
