module.exports = {
    key: "categories",
    table: "Category",
    id: "categoryId",
    fields: {
        name: { type: "string", max: 50, required: true },
        description: { type: "string", max: 5000 }
    }
};
