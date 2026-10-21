// The entity's public properties match the submitted proposal/class diagram.
module.exports = {
    key: "personalities",
    table: "Personality",
    id: "personalityId",
    fields: {
        displayName: { type: "string", max: 100, required: true },
        alias: { type: "string", max: 100 },
        categoryId: { type: "id", required: true },
        description: { type: "string", max: 5000 },
        notes: { type: "string", max: 5000 },
        isFavorite: { type: "boolean" }
    }
    // dateAdded is assigned by the store/database; clients cannot set it.
};
