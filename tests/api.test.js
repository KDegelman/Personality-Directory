const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");
const { personality, category, socialProfile } = require("../src/models");

const TEST_TOKEN = "test-token-only";

// [AI-G6] Supertest sends HTTP requests to createApp() without starting server.js or connecting to MySQL.
// A test-only stub replaces the database calls so routing and responses can be checked separately.
// Source: https://github.com/forwardemail/supertest
function createTestStore() {
    const calls = [];
    return {
        mode: "mysql",
        calls: calls,
        async listRecords(def) {
            calls.push({ action: "list", model: def.key });
            return ([]);
        },
        async findRecord(def, id) {
            calls.push({ action: "read", model: def.key, id: id });
            return ({ [def.id]: id });
        },
        async createRecord(def, data) {
            calls.push({ action: "create", model: def.key, data: data });
            return ({ [def.id]: 42, ...data });
        },
        async updateRecord(def, id, data) {
            calls.push({ action: "update", model: def.key, id: id, data: data });
            return ({ [def.id]: id, ...data });
        },
        async removeRecord(def, id) {
            calls.push({ action: "delete", model: def.key, id: id });
            return (true);
        }
    };
}

//Checks the same CRUD routes for each model without duplicating the tests
const entities = [
    {
        name: "Category",
        url: "/api/categories",
        def: category,
        create: { name: "Test Category", description: "Testing" },
        update: { description: "Updated Category" }
    },
    {
        name: "Personality",
        url: "/api/personalities",
        def: personality,
        create: { displayName: "Test Personality", categoryId: 1, isFavorite: false },
        update: { alias: "Updated Personality" }
    },
    {
        name: "SocialProfile",
        url: "/api/social-profiles",
        def: socialProfile,
        create: { personalityId: 1, platform: "Example", username: "tester", profileUrl: "https://example.com" },
        update: { username: "updatedTester" }
    }
];

for (const entity of entities) {
    test(entity.name + " GET list returns JSON", async function() {
        const store = createTestStore();
        const app = createApp({ store: store, apiToken: TEST_TOKEN });
        const response = await request(app).get(entity.url).set("Authorization", "Bearer " + TEST_TOKEN).expect(200);
        assert.deepEqual(response.body, []);
        assert.deepEqual(store.calls[0], { action: "list", model: entity.def.key });
    });

    test(entity.name + " GET one record uses its ID", async function() {
        const store = createTestStore();
        const app = createApp({ store: store, apiToken: TEST_TOKEN });
        const response = await request(app).get(entity.url + "/7").set("Authorization", "Bearer " + TEST_TOKEN).expect(200);
        assert.equal(response.body[entity.def.id], 7);
        assert.deepEqual(store.calls[0], { action: "read", model: entity.def.key, id: 7 });
    });

    test(entity.name + " POST creates a record", async function() {
        const store = createTestStore();
        const app = createApp({ store: store, apiToken: TEST_TOKEN });
        const response = await request(app).post(entity.url).set("Authorization", "Bearer " + TEST_TOKEN)
            .send(entity.create).expect(201);
        assert.equal(response.body[entity.def.id], 42);
        assert.equal(store.calls[0].action, "create");
        assert.equal(store.calls[0].model, entity.def.key);
    });

    for (const method of ["put", "patch"]) {
        test(entity.name + " " + method.toUpperCase() + " updates a record", async function() {
            const store = createTestStore();
            const app = createApp({ store: store, apiToken: TEST_TOKEN });
            const response = await request(app)[method](entity.url + "/7")
                .set("Authorization", "Bearer " + TEST_TOKEN).send(entity.update).expect(200);
            assert.equal(response.body[entity.def.id], 7);
            assert.equal(store.calls[0].action, "update");
            assert.equal(store.calls[0].id, 7);
        });
    }

    test(entity.name + " DELETE returns 204", async function() {
        const store = createTestStore();
        const app = createApp({ store: store, apiToken: TEST_TOKEN });
        const response = await request(app).delete(entity.url + "/7")
            .set("Authorization", "Bearer " + TEST_TOKEN).expect(204);
        assert.equal(response.text, "");
        assert.deepEqual(store.calls[0], { action: "delete", model: entity.def.key, id: 7 });
    });
}

test("Public status routes don't require authentication", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    await request(app).get("/").expect(200);
    const response = await request(app).get("/health").expect(200);
    assert.equal(response.body.storage, "mysql");
});

test("Protected routes reject missing, incorrect and non-Bearer tokens", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    await request(app).get("/api/categories").expect(401);
    await request(app).get("/api/categories").set("Authorization", "Bearer wrong").expect(401);
    await request(app).get("/api/categories").set("Authorization", "Basic " + TEST_TOKEN).expect(401);
});

test("Unknown routes return HTTP 404", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    const response = await request(app).get("/api/not-a-route").set("Authorization", "Bearer " + TEST_TOKEN).expect(404);
    assert.equal(response.body.error, "Endpoint not found");
});

test("Malformed JSON returns HTTP 400", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    const response = await request(app).post("/api/categories")
        .set("Authorization", "Bearer " + TEST_TOKEN)
        .set("Content-Type", "application/json").send('{"name":').expect(400);
    assert.equal(response.body.error, "Invalid JSON");
});

test("Invalid JSON fields and missing required fields return HTTP 400", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    await request(app).post("/api/categories").set("Authorization", "Bearer " + TEST_TOKEN)
        .send({ description: "Missing name" }).expect(400);
    await request(app).post("/api/categories").set("Authorization", "Bearer " + TEST_TOKEN)
        .send({ name: "Artist", unexpected: true }).expect(400);
    await request(app).patch("/api/categories/1").set("Authorization", "Bearer " + TEST_TOKEN)
        .send({}).expect(400);
});

test("Invalid path IDs return HTTP 400", async function() {
    const app = createApp({ store: createTestStore(), apiToken: TEST_TOKEN });
    await request(app).get("/api/categories/not-a-number").set("Authorization", "Bearer " + TEST_TOKEN).expect(400);
    await request(app).delete("/api/categories/0").set("Authorization", "Bearer " + TEST_TOKEN).expect(400);
});

test("Missing records return HTTP 404", async function() {
    const store = createTestStore();
    store.findRecord = async function() {
        return (null);
    };
    store.updateRecord = async function() {
        return (null);
    };
    store.removeRecord = async function() {
        return (false);
    };
    const app = createApp({ store: store, apiToken: TEST_TOKEN });
    await request(app).get("/api/categories/999").set("Authorization", "Bearer " + TEST_TOKEN).expect(404);
    await request(app).patch("/api/categories/999").set("Authorization", "Bearer " + TEST_TOKEN)
        .send({ description: "Update" }).expect(404);
    await request(app).delete("/api/categories/999").set("Authorization", "Bearer " + TEST_TOKEN).expect(404);
});

// [AI-G6] These simulate driver errors to verify that errorHandler converts them to HTTP status codes.
// They do not replace the separate tests against a real MySQL database.
const driverErrors = [
    { code: "ER_DUP_ENTRY", status: 409 },
    { code: "ER_ROW_IS_REFERENCED_2", status: 409 },
    { code: "ER_NO_REFERENCED_ROW_2", status: 400 }
];
for (const testCase of driverErrors) {
    test("MySQL error " + testCase.code + " becomes HTTP " + testCase.status, async function() {
        const store = createTestStore();
        store.createRecord = async function() {
            const error = new Error("Simulated MySQL constraint error");
            error.code = testCase.code;
            throw error;
        };
        const app = createApp({ store: store, apiToken: TEST_TOKEN });
        await request(app).post("/api/categories")
            .set("Authorization", "Bearer " + TEST_TOKEN)
            .send({ name: "Test" }).expect(testCase.status);
    });
}
