const test = require("node:test");
const assert = require("node:assert/strict");
const { before, after } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const mysql = require("mysql2/promise");
const { createMysqlStore } = require("../src/storage/mysqlStore");
const { createApp } = require("../src/app");

require("dotenv").config();

const TEST_TOKEN = "integration-test-only";
const TEST_DATABASE = "personality_directory_test";
let store;
let app;

// [AI-G6] This test suite uses a separate MySQL database, not the application's normal data.
// It creates the test schema and clears existing rows in personality_directory_test before testing.
// The schema comes from database/schema.sql to keep the test tables consistent with the project.
// Source: https://nodejs.org/api/test.html
before(async function() {
    if (process.env.DB_NAME === TEST_DATABASE) {
        throw new Error("Set DB_NAME to the normal application database in .env, not the test database.");
    }

    const admin = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        multipleStatements: true
    });

    try {
        const source = fs.readFileSync(path.join(__dirname, "../database/schema.sql"), "utf8");
        if (!source.includes("CREATE DATABASE IF NOT EXISTS personality_directory")) {
            throw new Error("Unexpected schema.sql format. Test database wasn't modified.");
        }
        const testSchema = source.replaceAll("personality_directory", TEST_DATABASE);
        await admin.query(testSchema);

        //Clears the test database before running the CRUD cases, in foreign-key order
        await admin.query("DELETE FROM `personality_directory_test`.`SocialProfile`");
        await admin.query("DELETE FROM `personality_directory_test`.`Personality`");
        await admin.query("DELETE FROM `personality_directory_test`.`Category`");
    } finally {
        await admin.end();
    }

    const normalName = process.env.DB_NAME;
    process.env.DB_NAME = TEST_DATABASE;
    try {
        store = await createMysqlStore();
    } finally {
        if (normalName === undefined) {
            delete process.env.DB_NAME;
        } else {
            process.env.DB_NAME = normalName;
        }
    }

    app = createApp({ store: store, apiToken: TEST_TOKEN });
});

after(async function() {
    if (store) {
        await store.close();
    }
});

//Uses the real MySQL adapter and exercises the HTTP API without starting server.js
function authorized() {
    return ("Bearer " + TEST_TOKEN);
}

test("MySQL Category CRUD and unique-name constraint", async function() {
    const created = await request(app).post("/api/categories").set("Authorization", authorized())
        .send({ name: "Integration Category", description: "For testing" }).expect(201);
    const id = created.body.categoryId;
    assert.ok(Number.isSafeInteger(id));

    const list = await request(app).get("/api/categories").set("Authorization", authorized()).expect(200);
    assert.ok(list.body.some(function(step) {
        return (step.categoryId === id);
    }));

    const read = await request(app).get("/api/categories/" + id).set("Authorization", authorized()).expect(200);
    assert.equal(read.body.name, "Integration Category");

    const updated = await request(app).patch("/api/categories/" + id).set("Authorization", authorized())
        .send({ description: "Changed" }).expect(200);
    assert.equal(updated.body.description, "Changed");

    await request(app).post("/api/categories").set("Authorization", authorized())
        .send({ name: "Integration Category" }).expect(409);

    await request(app).delete("/api/categories/" + id).set("Authorization", authorized()).expect(204);
    await request(app).get("/api/categories/" + id).set("Authorization", authorized()).expect(404);
});

test("MySQL Personality CRUD and foreign key protection", async function() {
    const categoryResponse = await request(app).post("/api/categories").set("Authorization", authorized())
        .send({ name: "Personality Test Category" }).expect(201);
    const categoryId = categoryResponse.body.categoryId;

    await request(app).post("/api/personalities").set("Authorization", authorized())
        .send({ displayName: "Invalid Foreign Key", categoryId: 2147483000 }).expect(400);

    const created = await request(app).post("/api/personalities").set("Authorization", authorized())
        .send({ displayName: "Example Personality", categoryId: categoryId, isFavorite: true }).expect(201);
    const id = created.body.personalityId;
    assert.equal(created.body.isFavorite, true);

    await request(app).delete("/api/categories/" + categoryId).set("Authorization", authorized()).expect(409);

    const read = await request(app).get("/api/personalities/" + id).set("Authorization", authorized()).expect(200);
    assert.equal(read.body.displayName, "Example Personality");
    assert.equal(read.body.isFavorite, true);

    const updated = await request(app).put("/api/personalities/" + id).set("Authorization", authorized())
        .send({ alias: "Changed Alias", isFavorite: false }).expect(200);
    assert.equal(updated.body.alias, "Changed Alias");
    assert.equal(updated.body.isFavorite, false);

    await request(app).delete("/api/personalities/" + id).set("Authorization", authorized()).expect(204);
    await request(app).get("/api/personalities/" + id).set("Authorization", authorized()).expect(404);
    await request(app).delete("/api/categories/" + categoryId).set("Authorization", authorized()).expect(204);
});

test("MySQL SocialProfile CRUD and cascade deletion", async function() {
    const categoryResponse = await request(app).post("/api/categories").set("Authorization", authorized())
        .send({ name: "Social Profile Test Category" }).expect(201);
    const categoryId = categoryResponse.body.categoryId;

    const personalityResponse = await request(app).post("/api/personalities").set("Authorization", authorized())
        .send({ displayName: "Social Profile Parent", categoryId: categoryId }).expect(201);
    const personalityId = personalityResponse.body.personalityId;

    const created = await request(app).post("/api/social-profiles").set("Authorization", authorized())
        .send({
            personalityId: personalityId,
            platform: "Example",
            username: "exampleUser",
            profileUrl: "https://example.com/profile",
            isFollowing: true,
            lastChecked: "2026-11-16T14:02:00Z"
        }).expect(201);
    const profileId = created.body.profileId;
    assert.equal(created.body.isFollowing, true);
    assert.equal(created.body.lastChecked, "2026-11-16 14:02:00");

    const list = await request(app).get("/api/social-profiles").set("Authorization", authorized()).expect(200);
    assert.ok(list.body.some(function(step) {
        return (step.profileId === profileId);
    }));

    const read = await request(app).get("/api/social-profiles/" + profileId).set("Authorization", authorized()).expect(200);
    assert.equal(read.body.username, "exampleUser");

    const updated = await request(app).patch("/api/social-profiles/" + profileId).set("Authorization", authorized())
        .send({ username: "changedUser", isFollowing: false }).expect(200);
    assert.equal(updated.body.username, "changedUser");
    assert.equal(updated.body.isFollowing, false);

    //Deleting the parent Personality should also remove its SocialProfile through the foreign key
    await request(app).delete("/api/personalities/" + personalityId).set("Authorization", authorized()).expect(204);
    await request(app).get("/api/social-profiles/" + profileId).set("Authorization", authorized()).expect(404);
    await request(app).delete("/api/categories/" + categoryId).set("Authorization", authorized()).expect(204);
});
