const { readFileSync } = require("fs");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

function databasePath() {
  const value = process.env.DATABASE_URL || "file:/tmp/andre-bebe-wedding-dev.db";
  if (!value.startsWith("file:")) {
    throw new Error("db:init only supports file: SQLite DATABASE_URL values.");
  }
  return value.replace("file:", "");
}

const sql = readFileSync(path.join(__dirname, "migrations", "20260603000000_init", "migration.sql"), "utf8");
const db = new DatabaseSync(databasePath());
db.exec(sql);
db.close();
console.log(`Initialized SQLite database at ${databasePath()}`);
