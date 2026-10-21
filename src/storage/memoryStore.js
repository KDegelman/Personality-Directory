const { ApiError } = require("../middleware/ApiError");

// Development-only mode: lets every endpoint run before MySQL is configured.
// IMPORTANT: records disappear when the server restarts. Use DB_MODE=mysql for persistent data.
function createMemoryStore() {
    const state = {
        categories: [
            { categoryId: 1, name: "Artist", description: "Illustrators and other visual artists" },
            { categoryId: 2, name: "Video creator", description: "People producing video content" },
            { categoryId: 3, name: "Streamer", description: "Livestream content creators" },
            { categoryId: 4, name: "Voice actor", description: "Voice performers" },
            { categoryId: 5, name: "Stage actor", description: "Live theatre performers" }
        ],
        personalities: [],
        "social-profiles": []
    };
    const counters = { categories: 5, personalities: 0, "social-profiles": 0 };
    const copy = value => value === undefined ? undefined : structuredClone(value);

    function checkReferences(key, data) {
        if (key === "personalities" && data.categoryId !== undefined && data.categoryId !== null) {
            if (!state.categories.some(item => item.categoryId === data.categoryId)) throw new ApiError(400, "categoryId does not exist");
        }
        if (key === "social-profiles" && data.personalityId !== undefined && data.personalityId !== null) {
            if (!state.personalities.some(item => item.personalityId === data.personalityId)) throw new ApiError(400, "personalityId does not exist");
        }
    }
    return {
        mode: "memory (temporary)",
        async list(def) { return copy(state[def.key]); },
        async find(def, id) { return copy(state[def.key].find(item => item[def.id] === id) || null); },
        async create(def, data) {
            checkReferences(def.key, data);
            const row = { [def.id]: ++counters[def.key], ...copy(data) };
            if (def.key === "personalities") { row.isFavorite ??= false; row.dateAdded = new Date().toISOString(); }
            if (def.key === "social-profiles") { row.isFollowing ??= false; row.lastChecked ??= null; }
            state[def.key].push(row);
            return copy(row);
        },
        async update(def, id, data) {
            const row = state[def.key].find(item => item[def.id] === id);
            if (!row) return null;
            checkReferences(def.key, data);
            Object.assign(row, copy(data));
            return copy(row);
        },
        async remove(def, id) {
            const index = state[def.key].findIndex(item => item[def.id] === id);
            if (index === -1) return false;
            if (def.key === "categories" && state.personalities.some(item => item.categoryId === id)) {
                throw new ApiError(409, "Cannot delete a category still used by a personality");
            }
            if (def.key === "personalities") {
                state["social-profiles"] = state["social-profiles"].filter(item => item.personalityId !== id);
            }
            state[def.key].splice(index, 1);
            return true;
        }
    };
}
module.exports = { createMemoryStore };
