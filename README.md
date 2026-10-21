# Personality Directory — CWEB 280

Secure backend starter for organizing artists, video creators, streamers, voice actors, stage actors, and their social accounts. Based on the **submitted proposal**. Use this as a new repository; it does not alter your EIDR group repository.

## Start immediately (no database setup needed)

1. Download/unzip this project and open the **Personality-Directory-Starter** folder in WebStorm.
2. In WebStorm's Terminal (at this folder's root), run `npm install` **once**.
3. Run `npm start`. Or use the green Run icon next to the `start` script in `package.json`.
4. Open **http://localhost:3000** and **http://localhost:3000/health** in your browser. They work without a token.
5. The terminal prints a **Development API token**. Copy it into the Postman Authorization -> Bearer Token field for `/api/*` requests.
6. Stop with **Ctrl+C** in the terminal. For automatic restarting while editing, use `npm run dev`.

**Important:** It starts in `memory` mode: data is temporary and disappears when the server stops. This is useful for testing immediately, but MySQL storage should be configured for your actual coursework demonstration.

## Quick API check on Windows

With the server running, in another Terminal tab:

```powershell
curl.exe http://localhost:3000/health
curl.exe -H "Authorization: Bearer PASTE_YOUR_TOKEN" http://localhost:3000/api/categories
```

Routes and JSON bodies are listed in [`docs/API_EXAMPLES.md`](docs/API_EXAMPLES.md).

## Switch from demo storage to MySQL (for the assignment)

1. Open MySQL Workbench, connect to your local MySQL server, and run **`database/schema.sql`** (the entire script).
2. Copy `.env.example` to `.env` at the project root. The server reads this automatically.
3. In `.env`, set `DB_MODE=mysql` and set `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_NAME` to match your MySQL installation. Uncomment those fields by removing `#`.
4. In `.env`, set an unguessable `API_TOKEN` to keep your token stable across restarts. **Never commit `.env`.**
5. Stop and restart (`npm start`). `/health` should now show `"storage": "mysql"`.
6. Test all CRUD requests in Postman and run `npm test`. If MySQL is unreachable, startup gives an error rather than silently pretending to persist.

## GitHub repository setup (WebStorm)

1. Create a new empty GitHub repository, for example **`personality-directory`**. Do **not** initialise it with an online README or `.gitignore` (both are already here).
2. In WebStorm, open this folder, then **Git -> Create Git Repository** (or **VCS -> Enable Version Control Integration**, depending on your WebStorm version).
3. Commit your project files. Do not commit `node_modules` or `.env` (excluded in `.gitignore`).
4. In the Git menu, use **GitHub -> Share Project on GitHub** if offered, or add your new GitHub repository as a remote and push `main`.

Terminal alternative after creating an empty GitHub repository:

```shell
git init
git add .
git commit -m "Initial Personality Directory backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/personality-directory.git
git push -u origin main
```

If you prefer, run `npm install` *before* your first commit so NPM produces and commits `package-lock.json`; the `node_modules` directory still stays ignored.

## Project structure

```text
Personality-Directory-Starter/
├── .env.example            # Local configuration template; real .env is private
├── .gitignore              # Ignore dependencies, credentials, IDE files
├── package.json            # npm start, npm run dev, npm test
├── server.js               # Entry point and startup (from EIDR pattern)
├── src/
│   ├── app.js              # Express setup / routing
│   ├── controllers/         # CRUD HTTP request/response logic
│   ├── middleware/          # Authentication and error handling
│   ├── models/              # Entity fields from the proposal
│   ├── routes/              # /api routes
│   ├── storage/             # In-memory demo & MySQL adapters
│   └── validators/          # JSON input checks
├── database/schema.sql     # MySQL 3-table schema and category seed data
├── tests/                  # Unit and API-level tests
└── docs/                   # API examples and reuse notes
```

## Submission notes

- This is a **working project scaffold**, not a claim that the whole midterm is complete.
- `.js` means JavaScript — correct for a Node.js backend. The earlier Java project uses `.java`, which cannot run in Node directly.
- Use **NPM** for packages, as required. Never submit `node_modules`.
- See [`docs/IMPLEMENTATION_NOTES.md`](docs/IMPLEMENTATION_NOTES.md) for known limitations and the next milestones.
