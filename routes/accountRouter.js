import { Router } from "express";

import db, { sql } from "../db.js";
export const accountRouter = Router();

accountRouter.get("/:id", async (req, res) => {
  let id = req.params.id;

  const results = await db.query(sql`
          SELECT * from accounts WHERE id = ${id};
        `);
  let account = results[0];
  console.log(account);
  // let primaryContact = await db.query(sql`
  //   SELECT * from profiles WHERE id = ${account.primaryContact};
  // `);
  // account.primaryContact = primaryContact[0];
  res.status(200).send(account);
  return;
});

accountRouter.post("/create", async (req, res) => {
  const {
    primaryContact,
    companyName,
    companyAddress,
    phone,
    email,
    subscriptionPlan,
    billingInfo,
  } = req.body;
  try {
    await db.query(
      sql`INSERT INTO accounts (primaryContact, companyName, companyAddress, companyPhone, companyEmail, subscriptionPlan, billingInfo )
      VALUES (${primaryContact}, ${companyName},${JSON.stringify(
        companyAddress
      )}, ${phone}, ${email}, ${subscriptionPlan} , ${JSON.stringify(
        billingInfo
      )} )`
    );

    const newAccountId = await db.query(
      sql`SELECT id FROM accounts WHERE primaryContact = ${primaryContact} LIMIT 1`
    );
    const newAccount = await db.query(
      sql`SELECT * FROM accounts WHERE id = ${newAccountId[0].id}`
    );
    res.status(201).json(newAccount[0]);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
    return;
  }
});
