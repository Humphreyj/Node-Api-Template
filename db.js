const mysql = require("mysql");

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dottoe",
  database: "template",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});
