import createConnectionPool, { sql } from "@databases/mysql";
import "dotenv/config";
export { sql };
// const db = createConnectionPool(process.env.DATABASE_URL, {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   bigIntMode: "number", // Optional: to handle big integers
//   poolSize: 10, // Optional: adjust the pool size as needed
// });

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
