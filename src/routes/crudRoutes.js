const express = require("express");
const { makeCrudController } = require("../controllers/crudController");

function createCrudRouter(store, definition) {
    const router = express.Router();
    const controller = makeCrudController(store, definition);
    router.get("/", controller.list);
    router.get("/:id", controller.read);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.patch("/:id", controller.update);
    router.delete("/:id", controller.remove);
    return router;
}
module.exports = { createCrudRouter };
