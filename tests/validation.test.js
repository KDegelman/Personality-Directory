const test = require("node:test");
const assert = require("node:assert/strict");
const { personality, socialProfile } = require("../src/models");
const { validateEntityInput, parsePositiveId } = require("../src/validators/entityValidator");

test("Personality validation accepts fields from the class diagram", () => {
    const result = validateEntityInput(personality, { displayName: "  Example ", categoryId: 1, isFavorite: false });
    assert.equal(result.displayName, "Example");
    assert.equal(result.categoryId, 1);
});
test("Personality validation requires a name", () => {
    assert.throws(() => validateEntityInput(personality, { categoryId: 1 }), /displayName/);
});
test("SocialProfile validation rejects non-http URLs", () => {
    assert.throws(() => validateEntityInput(socialProfile, { personalityId: 1, platform: "Pixiv", username: "sample", profileUrl: "javascript:alert(1)" }), /URL/);
});
test("IDs must be positive integers", () => {
    assert.equal(parsePositiveId("3"), 3);
    assert.throws(() => parsePositiveId("bad"), /positive integer/);
});
