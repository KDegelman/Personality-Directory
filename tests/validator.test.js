const test = require("node:test");
const assert = require("node:assert/strict");
const { validateEntityInput, parsePositiveId } = require("../src/validators/entityValidator");
const { personality, category, socialProfile } = require("../src/models");

// [AI-G6] These unit tests check the validator directly without starting Express or MySQL.
// Source: https://nodejs.org/api/test.html

test("Allows valid Category data and trims strings", function() {
    const output = validateEntityInput(category, { name: "  Artist  ", description: "  Drawing  " });
    assert.deepEqual(output, { name: "Artist", description: "Drawing" });
});

test("Rejects missing or invalid JSON objects", function() {
    for (const input of [null, [], "hello", 5]) {
        assert.throws(function() {
            validateEntityInput(category, input);
        }, { status: 400 });
    }
});

test("Rejects missing required fields", function() {
    assert.throws(function() {
        validateEntityInput(category, { description: "Missing a name" });
    }, { status: 400, message: "Missing required field: name" });
});

test("Rejects fields that aren't in the model", function() {
    assert.throws(function() {
        validateEntityInput(category, { name: "Artist", admin: true });
    }, { status: 400, message: "Unexpected field: admin" });
});

test("Rejects blank and oversized strings", function() {
    for (const name of ["   ", "x".repeat(51), 42]) {
        assert.throws(function() {
            validateEntityInput(category, { name: name });
        }, { status: 400 });
    }
});

test("Accepts optional null strings but rejects null required fields", function() {
    const output = validateEntityInput(category, { name: "Artist", description: null });
    assert.equal(output.description, null);

    assert.throws(function() {
        validateEntityInput(category, { name: null });
    }, { status: 400 });
});

test("Allows booleans but rejects non-boolean values", function() {
    const output = validateEntityInput(personality, { displayName: "Example", categoryId: 1, isFavorite: false });
    assert.equal(output.isFavorite, false);

    assert.throws(function() {
        validateEntityInput(personality, { displayName: "Example", categoryId: 1, isFavorite: "false" });
    }, { status: 400 });
});

test("Rejects invalid model IDs", function() {
    for (const categoryId of [0, -1, 1.5, "1", Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(function() {
            validateEntityInput(personality, { displayName: "Example", categoryId: categoryId });
        }, { status: 400 });
    }
});

test("Allows HTTP(S) URLs and rejects other URL formats", function() {
    const output = validateEntityInput(socialProfile, {
        personalityId: 1,
        platform: "Example",
        username: "example",
        profileUrl: " https://example.com/profile "
    });
    assert.equal(output.profileUrl, "https://example.com/profile");

    for (const profileUrl of ["not-a-url", "ftp://example.com/file", "javascript:alert(1)"]) {
        assert.throws(function() {
            validateEntityInput(socialProfile, {
                personalityId: 1,
                platform: "Example",
                username: "example",
                profileUrl: profileUrl
            });
        }, { status: 400 });
    }
});

test("Accepts a valid ISO timestamp and formats it for MySQL", function() {
    const output = validateEntityInput(socialProfile, {
        personalityId: 1,
        platform: "Example",
        username: "example",
        profileUrl: "https://example.com",
        lastChecked: "2026-11-16T14:02:00Z"
    });
    assert.equal(output.lastChecked, "2026-11-16 14:02:00");
});

test("Rejects non-ISO or impossible dates", function() {
    for (const value of [
        "Nov 16 2026",
        "2026-02-30T12:00:00Z",
        "2025-02-29T12:00:00Z",
        "2026-11-16T24:00:00Z",
        "2026-11-16T14:02:00+02:75",
        "2026-11-16T14:02:00",
        "not a date"
    ]) {
        assert.throws(function() {
            validateEntityInput(socialProfile, { lastChecked: value }, true);
        }, { status: 400 });
    }
});

test("Accepts leap years and ISO timestamps with timezone offsets", function() {
    const leapYear = validateEntityInput(socialProfile, { lastChecked: "2024-02-29T12:00:00Z" }, true);
    assert.equal(leapYear.lastChecked, "2024-02-29 12:00:00");

    const withOffset = validateEntityInput(socialProfile, { lastChecked: "2026-11-16T14:02:00+02:00" }, true);
    assert.equal(withOffset.lastChecked, "2026-11-16 12:02:00");
});

test("Allows partial updates without required fields", function() {
    const output = validateEntityInput(personality, { alias: "Changed" }, true);
    assert.deepEqual(output, { alias: "Changed" });
});

test("Rejects partial updates containing no fields", function() {
    assert.throws(function() {
        validateEntityInput(category, {}, true);
    }, { status: 400, message: "No update fields provided" });
});

test("Converts valid URL path IDs and rejects invalid IDs", function() {
    assert.equal(parsePositiveId("12"), 12);
    for (const value of ["0", "-5", "3.5", "abc", "9007199254740992"]) {
        assert.throws(function() {
            parsePositiveId(value);
        }, { status: 400 });
    }
});
