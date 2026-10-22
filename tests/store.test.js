const test = require("node:test");
const assert = require("node:assert/strict");
const { createMemoryStore } = require("../src/storage/memoryStore");
const { personality, category, socialProfile } = require("../src/models");

test("Category lookup starts with the proposed classification choices", async () => {
    const store = createMemoryStore();
    const categories = await store.listRecord(category);
    assert.ok(categories.some(item => item.name === "Artist"));
    assert.ok(categories.some(item => item.name === "Streamer"));
});

test("Memory store CRUD for Personality and SocialProfile", async () => {
    const store = createMemoryStore();
    const person = await store.createRecord(personality, { displayName: "Test Artist", categoryId: 1 });
    assert.equal(person.personalityId, 1);
    assert.equal((await store.findRecord(personality, 1)).displayName, "Test Artist");
    assert.equal((await store.listRecord(personality)).length, 1);

    const profile = await store.createRecord(socialProfile, {
        personalityId: 1,
        platform: "Pixiv",
        username: "test",
        profileUrl: "https://example.com/test"
    });
    assert.equal(profile.profileId, 1);
    assert.equal((await store.updateRecord(socialProfile, 1, { isFollowing: true })).isFollowing, true);
    assert.equal((await store.updateRecord(personality, 1, { alias: "Example" })).alias, "Example");
    assert.equal(await store.removeRecord(personality, 1), true);
    assert.equal(await store.findRecord(personality, 1), null);
    assert.equal((await store.listRecord(socialProfile)).length, 0);
});

test("Memory store enforces foreign keys and prevents deleting used categories", async () => {
    const store = createMemoryStore();
    await assert.rejects(store.createRecord(personality, { displayName: "Missing Category", categoryId: 999 }), /does not exist/);
    await assert.rejects(store.createRecord(socialProfile, { personalityId: 999 }), /does not exist/);
    await store.createRecord(personality, { displayName: "Example", categoryId: 1 });
    await assert.rejects(store.removeRecord(category, 1), /Cannot delete/);
});
