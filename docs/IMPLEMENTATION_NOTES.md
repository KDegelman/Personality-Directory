# CWEB 280 implementation handoff

## From which previous project?

- **Web Data Importer:** Adapted the known Express server startup, `app.get("/")`, JSON error handling, NPM scripts and README instructions. The ExcelJS/Multer importer was deliberately not copied because it is unrelated to this project and would create extraneous code.
- **Boolean Bros Gym Java server:** Used CREATE/READ/READALL/UPDATE/DELETE and prepared SQL statements as the conceptual CRUD reference. Did NOT copy JDBC code or the socket server because those are Java/TCP rather than Node/HTTP; the existing `UPDATE ... SET ? = ?` SQL issue is avoided.
- **Boolean Bros Gym Android:** Used the model and form-validation flow as reference. Android Java screens were not copied because they cannot run inside Node.js.

## What is implemented in this starter

- Express server with `/` and `/health` endpoints.
- Entities: Personality, Category, SocialProfile (18 proposed fields).
- Authenticated REST CRUD route/controller structure for all three entities.
- Input validation and JSON status/error responses.
- Instant-run in-memory store (temporary) and MySQL adapter + schema.
- Initial automated tests using Node test runner and Supertest.
- Local startup documentation, `.gitignore`, `.env.example` and GitHub setup directions.

## Critical limitations before calling this a finished midterm

1. Default `DB_MODE=memory` loses everything on restart; demonstrate the database-backed version with MySQL before submission.
2. The bearer token is *simple API-token authentication*, not a user login/JWT implementation. Ask the instructor which authentication method the class requires.
3. Need to run `database/schema.sql` in your own MySQL Workbench, configure `.env`, and verify MySQL CRUD and error cases in Postman.
4. The tests are a head start but are **not exhaustive**. Expand unit/integration tests for EVERY API and edge case per rubric.
5. The proposal mentions Category lookup for a select input. This starter also includes Category CRUD; if your instructor expects a literal select/autocomplete UI, ask or add a tiny UI later.
6. You must understand, test and defend code in your own submission. Verify permission to reuse parts of previously graded/group coursework.
7. MySQL packages cannot be downloaded in this build environment, so the Express application itself was not executed here; Node syntax and dependency-free logic tests can be verified. Test `npm install`, `npm start`, `npm test` locally.

## Logical next steps

1. Download ZIP and open folder in WebStorm, `npm install` then `npm start`.
2. Check `/health`, get the server-generated API token and make first Postman request.
3. Create GitHub repository, make first commit.
4. Run `database/schema.sql` in MySQL Workbench, set `.env` to `DB_MODE=mysql`, then test CRUD against real database.
5. Confirm classroom authentication pattern and expand tests.
