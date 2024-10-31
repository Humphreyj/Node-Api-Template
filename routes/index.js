import { Router } from "express";

import { profileRouter } from "./profileRouter.js";

export const router = Router().use("/profile", profileRouter);
