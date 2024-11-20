import { Router } from "express";

import db, { sql } from "../db.js";
export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email } = req.body;
  let accountResult;
  const [account] = await db.query(
    sql`SELECT * from accounts WHERE companyEmail = ${email}`
  );
  if (!account) {
    const [user] = await db.query(
      sql`SELECT * from profiles WHERE email = ${email}`
    );
    accountResult = user;
  } else {
    accountResult = account;
  }
  // This will allow the user to login with either their email or company email

  res.status(200).send(accountResult);
  return;
});
