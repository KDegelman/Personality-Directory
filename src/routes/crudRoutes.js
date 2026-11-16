const express = require("express"); //Imports and names express functions
const { makeCrudController } = require("../controllers/crudController"); //Imports and names custom controller

// [AI-G6] Uses one reusable router for different models instead of repeating the same CRUD routes.
// Suggested to reduce duplicated code across the different entities.
// Source: https://expressjs.com/en/guide/routing.html
function createCrudRouter(store, definition) { //Sets up CRUD routes of models
    const router = express.Router();
    const controller = makeCrudController(store, definition); //Gets the CRUD functions of model

    router.get("/", controller.list); //Assigns the CRUD functions to their requests
    router.get("/:id", controller.read);
    router.post("/", controller.create);

    // [AI-G6] Both PUT and PATCH use the same partial-update function in this project.
    // This is a simplification. Standard PUT replaces a resource, while PATCH modifies part of it.
    // Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH
    router.put("/:id", controller.update);
    router.patch("/:id", controller.update);

    router.delete("/:id", controller.remove);

    return (router);
}

module.exports = { createCrudRouter };