-- Run this script in MySQL Workbench before enabling DB_MODE=mysql.
-- Three entities and 18 total properties, matching the submitted proposal.
CREATE DATABASE IF NOT EXISTS personality_directory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personality_directory;

CREATE TABLE IF NOT EXISTS Category (
    categoryId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL
);

CREATE TABLE IF NOT EXISTS Personality (
    personalityId INT AUTO_INCREMENT PRIMARY KEY,
    displayName VARCHAR(100) NOT NULL,
    alias VARCHAR(100) NULL,
    categoryId INT NOT NULL,
    description TEXT NULL,
    notes TEXT NULL,
    isFavorite BOOLEAN NOT NULL DEFAULT FALSE,
    dateAdded DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_personality_category FOREIGN KEY (categoryId) REFERENCES Category(categoryId)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS SocialProfile (
    profileId INT AUTO_INCREMENT PRIMARY KEY,
    personalityId INT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    profileUrl VARCHAR(2048) NOT NULL,
    isFollowing BOOLEAN NOT NULL DEFAULT FALSE,
    lastChecked DATETIME NULL,
    CONSTRAINT fk_social_profile_personality FOREIGN KEY (personalityId) REFERENCES Personality(personalityId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT IGNORE INTO Category (name, description) VALUES
    ('Artist', 'Illustrators and other visual artists'),
    ('Video creator', 'People producing video content'),
    ('Streamer', 'Livestream content creators'),
    ('Voice actor', 'Voice performers'),
    ('Stage actor', 'Live theatre performers');
