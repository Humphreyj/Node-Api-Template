import createConnectionPool, { sql } from "@databases/mysql";

export { sql };
const db = createConnectionPool("mysql://root:dottoe@localhost:3308/db", {
  host: "localhost",
  port: 3308,
  user: "root",
  password: "dottoe",
  database: "db",
  bigIntMode: "number", // Optional: to handle big integers
  poolSize: 10, // Optional: adjust the pool size as needed
});

export default db;
