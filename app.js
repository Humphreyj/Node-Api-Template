import express from "express";

import { router } from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
// Middleware
import { geoFence } from "./middleware/geoFence.js";

const app = express();
const port = 8080;

// const db = await getConnection();

app
  .use(cors())
  .use(express.json())
  .use(helmet())
  // .use(geoFence)
  .use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/api", (req, res) => {
  res.send("PING");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

export { app };
