import express from "express";

import { router } from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

const app = express();
const port = 8080;

// const db = await getConnection();

app.use(cors()).use(express.json()).use(helmet()).use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

export { app };
