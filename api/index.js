import app from "./app.js"; // Adjust path as needed
import { createServer } from "@vercel/node";

// Create the serverless handler
export default createServer(app);
