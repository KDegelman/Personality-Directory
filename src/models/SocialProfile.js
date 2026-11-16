module.exports = {
    key: "social-profiles",
    table: "SocialProfile",
    id: "profileId",
    fields: {
        personalityId: { type: "id", required: true },
        platform: { type: "string", max: 50, required: true },
        username: { type: "string", max: 100, required: true },
        profileUrl: { type: "url", max: 2048, required: true },
        isFollowing: { type: "boolean" },
        lastChecked: { type: "date" }
    }
};
