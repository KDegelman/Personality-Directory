// API-level tests use Supertest. Run: npm test (after npm install).
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");
const { createMemoryStore } = require("../src/storage/memoryStore");

function fixture() {
    const token = "testing-bearer-token";
    return { app: createApp({ store: createMemoryStore(), apiToken: token }), token };
}

test("Health endpoint works without authentication", async () => {
    const { app } = fixture();
    const response = await request(app).get("/health").expect(200);
    assert.equal(response.body.success, true);
});

test("CRUD APIs reject requests without authentication", async () => {
    const { app } = fixture();
    await request(app).get("/api/personalities").expect(401);
    await request(app).get("/api/categories").expect(401);
    await request(app).get("/api/social-profiles").expect(401);
});

test("Create, retrieve, update and delete a personality", async () => {
    const { app, token } = fixture();
    const auth = { Authorization: `Bearer ${token}` };
    const created = await request(app).post("/api/personalities").set(auth)
        .send({ displayName: "Example Artist", categoryId: 1 }).expect(201);
    const id = created.body.personalityId;
    assert.ok(id > 0);
    const found = await request(app).get(`/api/personalities/${id}`).set(auth).expect(200);
    assert.equal(found.body.displayName, "Example Artist");
    const updated = await request(app).put(`/api/personalities/${id}`).set(auth)
        .send({ isFavorite: true }).expect(200);
    assert.equal(updated.body.isFavorite, true);
    await request(app).delete(`/api/personalities/${id}`).set(auth).expect(204);
    await request(app).get(`/api/personalities/${id}`).set(auth).expect(404);
});

test("Create and remove a social profile for an existing personality", async () => {
    const { app, token } = fixture();
    const auth = { Authorization: `Bearer ${token}` };
    const person = await request(app).post("/api/personalities").set(auth)
        .send({ displayName: "Example", categoryId: 1 }).expect(201);
    const created = await request(app).post("/api/social-profiles").set(auth)
        .send({ personalityId: person.body.personalityId, platform: "Pixiv", username: "example", profileUrl: "https://www.pixiv.net/" }).expect(201);
    await request(app).get(`/api/social-profiles/${created.body.profileId}`).set(auth).expect(200);
    await request(app).patch(`/api/social-profiles/${created.body.profileId}`).set(auth)
        .send({ isFollowing: true }).expect(200);
    await request(app).delete(`/api/social-profiles/${created.body.profileId}`).set(auth).expect(204);
});

test("Input validation reports HTTP 400", async () => {
    const { app, token } = fixture();
    await request(app).post("/api/personalities").set({ Authorization: `Bearer ${token}` })
        .send({ categoryId: 1 }).expect(400);
});
