const fs = require("fs");
const path = require("path");

const { loadEnv } = require("../src/config/env");
const { pool } = require("../src/db/pool");

async function run() {
  loadEnv();
  const sqlPath = path.resolve(__dirname, "..", "sql", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Migration completed.");
  await pool.end();
}

run().catch((error) => {
  console.error("Migration failed.", error);
  process.exitCode = 1;
});
