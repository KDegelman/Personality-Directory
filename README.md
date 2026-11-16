# Personality Directory

**CWEB-280 — Internet Programming and Web Applications 2**

A Node.js and Express REST API for organizing artists, creators, performers, and their social media profiles. The project uses three related entities: **Personality**, **Category**, and **SocialProfile**.

## Features

- CRUD endpoints for all three entities.
- MySQL storage with relationships defined in `database/schema.sql`.
- Shared routing, controllers, and input validation.
- Bearer-token authentication for `/api` requests.
- JSON responses and centralized error handling.
- Optional in-memory storage for development; data in this mode is not saved between restarts.

## Setup

Requires **Node.js 20 or newer**, npm, and MySQL for persistent storage.

1. Run `npm install` in the project folder.
2. Run `database/schema.sql` in MySQL Workbench to create the database and tables.
3. Copy `.env.example` to `.env`. Set `DB_MODE=mysql`, configure the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` values for your MySQL installation, and set an `API_TOKEN`.
4. Run `npm start`.
5. Open `http://127.0.0.1:3000/health` to check the server's response and selected storage mode.

The server uses port `3000` by default. Keep `.env` private; it contains local configuration and may contain credentials.

For temporary storage without MySQL, set `DB_MODE=memory`. If `API_TOKEN` is not configured, the server generates a development token and prints it in the terminal on startup.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` and `/health` | Public status endpoints |
| GET | `/api/personalities`, `/api/categories`, `/api/social-profiles` | List records |
| GET | `/api/{resource}/:id` | Get one record |
| POST | `/api/{resource}` | Create a record |
| PUT / PATCH | `/api/{resource}/:id` | Update a record |
| DELETE | `/api/{resource}/:id` | Delete a record |

All `/api` endpoints require an `Authorization: Bearer <token>` header. POST, PUT, and PATCH requests accept JSON. In this implementation, PUT and PATCH both support partial updates.

Request examples and expected responses are in [`docs/API_EXAMPLES.md`](docs/API_EXAMPLES.md).

## Testing

Run `npm test` for the included automated tests. The existing API tests use the in-memory store; MySQL behaviour should also be checked with MySQL configured and requests sent through Postman.

## Development and AI assistance

The project draws on CRUD and server patterns from my earlier Web Data Importer/EIDR and Boolean Bros Gym coursework. AI assistance was used in parts of the backend design, code review, and technical documentation.

Source-code comments marked **`[AI-G6]`** are AI-authored technical explanations or notes identifying AI-suggested implementation choices, generally with supporting documentation links. The marker is for identifying those comments; unmarked code or comments should not be taken as proof that no AI assistance was involved.
