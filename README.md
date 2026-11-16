# Personality Directory

CWEB-280 — Internet Programming and Web Applications 2

Personality Directory is a Node.js/Express application for tracking creators and performers, their categories, and their social media profiles. It uses MySQL to save records and provides authenticated JSON APIs for the three related entities: **Personality**, **Category**, and **SocialProfile**.

## Current features

- Create, view, update, and delete all three entity types.
- MySQL storage with foreign-key relationships.
- Shared controllers, routes, input validation, and error handling.
- Bearer-token authentication for `/api` routes.
- Basic HTML/JavaScript pages for managing records at `/site/`.
- Automated API/validation tests and separate MySQL integration tests.

The frontend is an initial functional prototype; it is not the finished desktop interface. Authentication currently uses a shared API token rather than a user login system.

## Running the project

Requires Node.js 20+, npm, and a running MySQL server.

1. Run `npm install` in the project folder.
2. Execute `database/schema.sql` in MySQL Workbench.
3. Create a `.env` file in the project root (or copy `.env.example` if present) and configure the MySQL connection:

   ```dotenv
   PORT=3000
   HOST=127.0.0.1
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=personality_directory
   ```

   You can also add `API_TOKEN=YOUR_TOKEN`. Otherwise, the server prints a temporary development token when it starts. Do not commit the real `.env` file.

4. Run `npm start`.
5. Open `http://127.0.0.1:3000/site/` for the website, or `/health` to check the server. Enter the API token on the data pages.

## API

| Method | Route | Function |
| --- | --- | --- |
| GET | `/api/{resource}` | List records |
| GET | `/api/{resource}/:id` | Get one record |
| POST | `/api/{resource}` | Create a record |
| PUT / PATCH | `/api/{resource}/:id` | Update a record |
| DELETE | `/api/{resource}/:id` | Delete a record |

`{resource}` is `personalities`, `categories`, or `social-profiles`. API requests require `Authorization: Bearer <token>`. Write requests use JSON. Both PUT and PATCH currently permit partial updates.

## Testing

```powershell
npm test
npm run test:mysql
```

The first command runs validation and API tests using test-only database substitutes. The second tests real MySQL operations in a separate **`personality_directory_test`** database, which is reset during testing. Do not put important data in that test database.

## Current status and TODO

The MySQL-backed API is implemented and has passed the current automated tests. Some components are still **proofs of concept**, rather than the versions I intend to keep for the final project:

- [ ] **Validation:** Review the current shared, model-driven validator and decide whether to keep it or use an approach closer to what is taught in class.
- [ ] **Testing:** Review and rework the AI-generated test suite. The existing tests pass, but they are a starting point rather than my finished testing work.
- [ ] **Frontend:** Replace the nearly completely AI-generated basic HTML/JavaScript interface with a more usable desktop-oriented design, drawing on the workflows of my previous Android application.

## Development and AI assistance

The project adapts ideas from previous coursework, including my Web Data Importer/EIDR and Boolean Bros Gym projects. AI assistance was used for parts of the design, implementation, code review, automated tests, and documentation.

Comments marked **`[AI-G6]`** identify AI-written technical documentation and/or AI-suggested implementation decisions, often with links to supporting sources. The marker does not imply that all marked code was written with AI assistance.