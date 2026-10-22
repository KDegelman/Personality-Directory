const { ApiError } = require("../middleware/ApiError"); //Importing custom code(Like a library) and extracts the functions(ApiError) we need.
const { validateEntityInput, parsePositiveId } = require("../validators/entityValidator");

//CRUD Logic taken from Java Gym project; Translated into JSON/HTTP.
function makeCrudController(store, definition) { //Factory function to hold controller's functions
    return {
        list: async (req, res) => res.json(await store.listRecord(definition)), //For making a list of every entity in a category, it asynchronously requests the list and post it as a JSON
        read: async (req, res) => { //For getting a single entity in a category. Uses find to look for an id and posts it as a JSON.
            const item = await store.findRecord(definition, parsePositiveId(req.params.id)); //Finds an entity by id using user data
            if (!item) throw new ApiError(404, "Record not found"); //Throws and error if its null
            res.json(item);
        },
        create: async (req, res) => {  //For creating a new entity in a category. It asynchronously creates the entry using the users data and posts it by ID
            const data = validateEntityInput(definition, req.body); //Requests the user data through the body of the http
            const item = await store.createRecord(definition, data);
            res.status(201).json(item); //Sends the successful entry to the user
        },
        update: async (req, res) => {
            const id = parsePositiveId(req.params.id);
            const data = validateEntityInput(definition, req.body, true);
            const item = await store.updateRecord(definition, id, data);
            if (!item) throw new ApiError(404, "Record not found");
            res.json(item);
        },
        remove: async (req, res) => {
            const deleted = await store.removeRecord(definition, parsePositiveId(req.params.id));
            if (!deleted) throw new ApiError(404, "Record not found");
            res.status(204).end();
        }
    };
}
module.exports = { makeCrudController }; //Makes this exportable
