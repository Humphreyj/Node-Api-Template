import { Router } from "express";

import { profileRouter } from "./profileRouter.js";
import { invoiceRouter } from "./invoiceRouter.js";
import { accountRouter } from "./accountRouter.js";
import { settingsRouter } from "./settingsRouter.js";
import { authRouter } from "./authRouter.js";

export const router = Router()
  .use("/auth", authRouter)
  .use("/account", accountRouter)
  .use("/settings", settingsRouter)
  .use("/profile", profileRouter)
  .use("/invoice", invoiceRouter);
