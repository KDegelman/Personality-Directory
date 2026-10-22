// MySQL adapter for the SAME controllers used by the working in-memory mode.
// Inspired by the prepared-statement SELECT/INSERT/UPDATE/DELETE structure in the Gym Java project.
const mysql = require("mysql2/promise");

async function createMysqlStore() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "personality_directory",
        waitForConnections: true,
        connectionLimit: 5,
        timezone: "Z",
        dateStrings: true
    });
    await pool.query("SELECT 1"); // Fail on startup if MySQL is not configured correctly.
    const tableName = def => `\`${def.table}\``; // Only hardcoded model definitions reach here.
    const sqlFields = fields => fields.map(name => `\`${name}\``).join(", ");
    const normalise = (def, row) => {
        if (!row) return null;
        const copy = { ...row };
        for (const [field, rule] of Object.entries(def.fields)) {
            if (rule.type === "boolean" && copy[field] !== undefined) copy[field] = Boolean(copy[field]);
        }
        return copy;
    };
    const find = async (def, id) => {
        const [rows] = await pool.execute(`SELECT * FROM ${tableName(def)} WHERE \`${def.id}\` = ?`, [id]);
        return normalise(def, rows[0]);
    };
    return {
        mode: "mysql",
        async listRecord(def) {
            const [rows] = await pool.query(`SELECT * FROM ${tableName(def)} ORDER BY \`${def.id}\` ASC`);
            return rows.map(row => normalise(def, row));
        },
        find,
        async createRecord(def, data) {
            const fields = Object.keys(data);
            const columns = sqlFields(fields);
            const placeholders = fields.map(() => "?").join(", ");
            const statement = `INSERT INTO ${tableName(def)} (${columns}) VALUES (${placeholders})`;
            const [result] = await pool.execute(statement, fields.map(field => data[field]));
            return find(def, result.insertId);
        },
        async updateRecord(def, id, data) {
            const fields = Object.keys(data);
            const assignments = fields.map(field => `\`${field}\` = ?`).join(", ");
            const statement = `UPDATE ${tableName(def)} SET ${assignments} WHERE \`${def.id}\` = ?`;
            const [result] = await pool.execute(statement, [...fields.map(field => data[field]), id]);
            return result.affectedRows ? find(def, id) : null;
        },
        async removeRecord(def, id) {
            const [result] = await pool.execute(`DELETE FROM ${tableName(def)} WHERE \`${def.id}\` = ?`, [id]);
            return result.affectedRows > 0;
        },
        async close() { await pool.end(); }
    };
}
module.exports = { createMysqlStore };
