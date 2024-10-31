import createConnectionPool, { sql } from "@databases/mysql";

// export const getConnection = async () => {
//   try {
//     const connection = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       port: 3308,
//       password: "dottoe",
//     });
//     return connection;
//   } catch (err) {
//     console.log(err);
//   }
// };
export { sql };
const db = createConnectionPool("mysql://root:dottoe@localhost:3308/db");

export default db;
