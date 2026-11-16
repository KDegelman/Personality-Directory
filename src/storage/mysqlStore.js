const mysql = require("mysql2/promise"); //Imports mysql2 interface

// [AI-G6] Uses MySQL2 directly with a connection pool instead of the TypeORM
// Suggested to reuse database connections while keeping SQL operations in this storage file.
// Source: https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool
async function createMysqlStore() { //Sets up MySQL storage for the app
    const pool = mysql.createPool({ //Sets up the MySQL connection pool
        // [AI-G6] Uses configured database settings when provided, otherwise falls back to the local defaults.
        host: process.env.DB_HOST || "127.0.0.1", //If no IP set to default
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root", //If no username set to root
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "personality_directory", //If no default database set one
        waitForConnections: true, //Enables request queuing
        connectionLimit: 5, //Limits database connections

        // [AI-G6] Sets UTC for driver date handling and returns SQL dates as text instead of JavaScript Date objects.
        // Suggested to keep the returned date format consistent for the API.
        // Source: https://sidorares.github.io/node-mysql2/docs/examples/connections/create-connection
        timezone: "Z", //Sets UTC time
        dateStrings: true //Sets date return as strings
    });

    await pool.query("SELECT 1"); //Checks that MySQL is responding.

    // [AI-G6] Table and ID column names come from the model definitions, while INSERT/UPDATE
    // columns come from data already checked by entityValidator.js.
    // The ? placeholders keep submitted values separate from the SQL statement.
    // Suggested for reusing CRUD operations across multiple entities.
    // Source: https://sidorares.github.io/node-mysql2/docs/documentation/prepared-statements
    function tableName(def) { //Grabs the tables name
        return ("`" + def.table + "`");
    }

    function normalise(def, row) { //Normalizes database records for Api usage
        if (!row) { //Checks if record exist
            return null;
        }

        const copy = { ...row }; //Dupes the record for manipulation

        for (const step of Object.keys(def.fields)) { //Checks each field for if they need converting
            if (def.fields[step].type === "boolean" && copy[step] !== undefined) { //If boolean convert from 0-1 to true-false
                copy[step] = Boolean(copy[step]);
            }
        }

        return copy;
    }

    async function findRecord(def, id) { //Finds a record by ID
        const sql = ("SELECT * FROM " + tableName(def) + " WHERE `" + def.id + "` = ?"); //Creates request in sql speak
        const queryResult = await pool.execute(sql, [id]); //sends request

        return (normalise(def, queryResult[0][0]));
    }

    async function listRecords(def) { //Finds all records by entity
        const sql = ("SELECT * FROM " + tableName(def) + " ORDER BY `" + def.id + "` ASC");
        const queryResult = await pool.query(sql);
        const output = [];

        for (const step of queryResult[0]) {
            output.push(normalise(def, step)); //Adds the converted record to results
        }

        return output;
    }

    async function createRecord(def, data) { //Creates new record
        const columns = [];
        const placeholders = [];
        const values = [];

        for (const step of Object.keys(data)) { //Constructs record from data
            columns.push("`" + step + "`");
            placeholders.push("?");
            values.push(data[step]);
        }

        const sql = ("INSERT INTO " + tableName(def) + " (" + columns.join(", ") + ") VALUES (" + placeholders.join(", ") + ")"); //Creates request in sql speak
        const queryResult = await pool.execute(sql, values);

        return findRecord(def, queryResult[0].insertId); //Gets the new record using the MySQL assigned ID
    }

    async function updateRecord(def, id, data) { //Updates an existing record with the provided data
        const assignments = [];
        const values = [];

        for (const step of Object.keys(data)) {
            assignments.push("`" + step + "` = ?");
            values.push(data[step]);
        }

        values.push(id);

        const sql = ("UPDATE " + tableName(def) + " SET " + assignments.join(", ") + " WHERE `" + def.id + "` = ?");
        const queryResult = await pool.execute(sql, values);

        if (queryResult[0].affectedRows > 0) {
            return findRecord(def, id);
        }

        return null;
    }

    async function removeRecord(def, id) { //Deletes a record by ID
        const sql = ("DELETE FROM " + tableName(def) + " WHERE `" + def.id + "` = ?");
        const queryResult = await pool.execute(sql, [id]);

        return (queryResult[0].affectedRows > 0); //Returns whether a record was deleted
    }

    function close() { //Shuts down connection
        return pool.end();
    }

    return { //Creates referencable names
        mode: "mysql",
        listRecords: listRecords,
        findRecord: findRecord,
        createRecord: createRecord,
        updateRecord: updateRecord,
        removeRecord: removeRecord,
        close: close
    };
}

module.exports = { createMysqlStore };
