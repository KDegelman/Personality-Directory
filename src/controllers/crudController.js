const { ApiError } = require("../middleware/ApiError"); //Importing custom code(Like a library) and extracts the functions(ApiError) we need.
const { validateEntityInput, parsePositiveId } = require("../validators/entityValidator");

//CRUD Logic taken from Java Gym project; Translated into JSON/HTTP.

// [AI-G6] Uses one controller factory for different entity definitions instead of repeating the same CRUD handlers.
// Suggested to keep the routes consistent across the application's models.
// Source: https://expressjs.com/en/guide/routing.html

// [AI-G6] Express 5 automatically forwards errors from async handlers to the application's error handler.
// This allows the CRUD functions to throw errors without requiring a separate try/catch for each request.
// Source: https://expressjs.com/en/guide/error-handling.html

function makeCrudController(store, definition) { //Factory function to hold controller's functions
    return {
        list: async function(req, res) { //For making a list of every entity in a category, it asynchronously requests the list and post it as a JSON
            const output = await store.listRecords(definition);
            res.json(output);
        },

        read: async function(req, res) { //For getting a single entity in a category. Uses find to look for an id and posts it as a JSON.
            const item = await store.findRecord(definition, parsePositiveId(req.params.id)); //Finds an entity by id using user data

            if (!item) { //Throws and error if its null
                throw new ApiError(404, "Record not found");
            }

            res.json(item);
        },

        create: async function(req, res) { //For creating a new entity in a category. It asynchronously creates the entry using the users data and posts it as JSON
            const data = validateEntityInput(definition, req.body); //Validates the user data from req.body
            const item = await store.createRecord(definition, data);
            res.status(201).json(item); //Sends the successful entry to the user
        },

        update: async function(req, res) { //Updates an entity using the user data
            const id = parsePositiveId(req.params.id);
            const data = validateEntityInput(definition, req.body, true);
            const item = await store.updateRecord(definition, id, data);

            if (!item) {
                throw new ApiError(404, "Record not found");
            }

            res.json(item);
        },

        remove: async function(req, res) { //Deletes an entity using its ID
            const deleted = await store.removeRecord(definition, parsePositiveId(req.params.id));

            if (!deleted) {
                throw new ApiError(404, "Record not found");
            }

            res.status(204).end();
        }
    };
}

module.exports = { makeCrudController }; //Makes this exportable
