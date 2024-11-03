import { Router } from "express";

import { profileRouter } from "./profileRouter.js";
import { invoiceRouter } from "./invoiceRouter.js";

export const router = Router()
  .use("/profile", profileRouter)
  .use("/invoice", invoiceRouter);
