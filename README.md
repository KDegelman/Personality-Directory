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

1. BACKEND ALTERATIONS
----------------------

[ ] Convert MySQL2 queries to TypeORM.
- Define the three entities in TypeORM.
- Replace manual SQL with repository operations.
- Preserve the current controllers and routes where possible.

[ ] Convert the database to SQLite.
- Configure TypeORM for SQLite.
- Recreate the existing tables and relationships.
- Verify database persistence.
- Do this alongside the TypeORM conversion.

[ ] Replace the custom validator with class-validator.
- Preserve the current validation requirements.
- Review required/optional fields, null handling, and lengths.
- Verify URL, date, boolean and ID validation.
- Ensure validation errors produce appropriate JSON responses.

[ ] Review and rework the AI-generated test suite.
- Update tests for TypeORM and SQLite.
- Test all CRUD endpoints.
- Test authentication and invalid input.
- Test foreign keys and database constraints.
- Review the tests rather than simply accepting generated code.

[ ] Review PUT and PATCH behaviour.
- Decide whether PUT should replace entire records.
- Keep PATCH for partial updates.

[ ] Review deletion behaviour.
- Confirm what happens when deleting categories with personalities.
- Confirm what happens when deleting personalities with social profiles.

[ ] Review the existing backend code and documentation.
- Check for outdated MySQL references.
- Remove unused code and dependencies.
- Correct misplaced comments in app.js.
- Preserve personal comments and AI-G6 documentation.


2. BACKEND ADDITIONS
--------------------

[ ] Implement authentication suitable for the completed application.
- Decide between JWT, sessions, or another permitted approach.
- Authenticate users before protected API operations.
- Support the frontend's login and logout functionality.
- Test authorized and unauthorized requests.

[ ] Add authentication endpoints if required.
- Login.
- Authentication status.
- Logout or token invalidation, depending on the approach.

[ ] Prepare demonstration data.
- Sample categories.
- Sample personalities.
- Sample social profiles.
- Make it easy to demonstrate relationships and CRUD.

[ ] Finish testing the completed backend.
- Automated tests.
- Postman CRUD requests.
- Error cases (400, 401, 404, 409, 500 as applicable).
- Verify persistence after restarting.
- Save test results for documentation.


3. FRONTEND
-----------

[ ] Replace the HTML prototype with Vue.
- Set up Vue and Vue Router.
- Create components, views, and routes.
- Implement props and emits.
- Use the Vue version demonstrated in class if possible.

[ ] Rebuild the CRUD interface in Vue.
- Personality list.
- Personality details.
- Add Personality.
- Edit Personality.
- Delete Personality.
- Social Profile management.
- Category lookup and selection.
- Full CRUD for at least two entities.

[ ] Connect Vue to the Express API.
- Use fetch() with JSON.
- Display records returned by the API.
- Send create, update and delete requests.
- Handle failed requests and connection errors.

[ ] Add frontend authentication.
- Login screen.
- Protected views/routes.
- Connect authentication to backend.
- Logout functionality.
- Prevent unauthorized access to protected interfaces.

[ ] Rework the interface around my previous Android application.
- Home/dashboard navigation.
- Searchable record list.
- Detailed view for selected records.
- Prefilled editing forms.
- Search for records directly from edit/delete screens.
- Delete confirmation.
- Navigation back to the main screen.

[ ] Improve the desktop interface.
- Use the larger screen more effectively.
- Make social profiles accessible from their personality.
- Support category filtering.
- Consider favourites filtering.
- Improve layout, navigation and readability.

[ ] Implement client-side validation and user feedback.
- Validate required fields.
- Display useful errors beside form fields.
- Display confirmation after successful operations.
- Handle empty lists and missing data.
- Prevent forms from crashing on incorrect input.

[ ] Add Bootstrap-Vue or other qualifying third-party components.
- Forms and inputs.
- Buttons.
- Tables or lists.
- Navigation.
- Use components where they actually improve the application.

[ ] Check the complete frontend functionality.
- Navigation works.
- All forms work.
- CRUD works through the browser.
- API authentication works.
- UI authentication works.
- Errors and successes are displayed correctly.


4. DOCUMENTATION AND SUBMISSION
-------------------------------

[ ] Update the final-project proposal.
- Confirm project scope and instructor approval.
- Include project description.
- Include class diagrams.
- Include GUI mock-ups before and after user actions.
- Show navigation and major workflows.

[ ] Prepare the formal presentation.
- Demonstrate the frontend.
- Demonstrate CRUD and database persistence.
- Demonstrate authentication.
- Explain the important technical decisions.
- Prepare screenshots or other presentation material.


## Development and AI assistance

The project adapts ideas from previous coursework, including my Web Data Importer/EIDR and Boolean Bros Gym projects. AI assistance was used for parts of the design, implementation, code review, automated tests, and documentation.

Comments marked **`[AI-G6]`** identify AI-written technical documentation and/or AI-suggested implementation decisions, often with links to supporting sources. The marker does not imply that all marked code was written with AI assistance.