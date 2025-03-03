import { Router } from "express";
import nodemailer from "nodemailer";
import db, { sql } from "../db.js";
export const accountRouter = Router();

accountRouter.get("/:id", async (req, res) => {
  let id = req.params.id;

  const results = await db.query(sql`
          SELECT * from accounts WHERE id = ${id};
        `);
  let account = results[0];
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
    companyPhone,
    companyEmail,
    subscriptionPlan,
    billingInfo,
  } = req.body;
  try {
    await db.query(
      sql`INSERT INTO accounts (primaryContact, companyName, companyAddress, companyPhone, companyEmail, subscriptionPlan, billingInfo )
      VALUES (${primaryContact}, ${companyName},${JSON.stringify(
        companyAddress
      )}, ${companyPhone}, ${companyEmail}, ${subscriptionPlan} , ${JSON.stringify(
        billingInfo
      )} )`
    );

    const newAccountId = await db.query(
      sql`SELECT id FROM accounts WHERE primaryContact = ${primaryContact} LIMIT 1`
    );
    const newAccount = await db.query(
      sql`SELECT * FROM accounts WHERE id = ${newAccountId[0].id}`
    );

    let result = newAccount[0];
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
    return;
  }
});

accountRouter.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const {
    primaryContact,
    companyName,
    companyAddress,
    companyPhone,
    companyEmail,
    subscriptionPlan,
    billingInfo,
  } = req.body;

  try {
    await db.query(
      sql`UPDATE accounts SET primaryContact = ${primaryContact}, companyName = ${companyName}, companyAddress = ${JSON.stringify(
        companyAddress
      )}, companyPhone = ${companyPhone}, companyEmail = ${companyEmail}, subscriptionPlan = ${subscriptionPlan}, billingInfo = ${JSON.stringify(
        billingInfo
      )} WHERE id = ${id}`
    );
    const updatedAccount = await db.query(
      sql`SELECT * FROM accounts WHERE id = ${id}`
    );
    res.status(200).json(updatedAccount[0]);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error updating account" });
    return;
  }
});

accountRouter.post("/request-access", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  const existingProfile = await db.query(
    sql`SELECT * FROM profiles WHERE email = ${email}`
  );
  if (existingProfile.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Email already in use" });
  }

  try {
    const result = await db.query(
      sql`INSERT INTO accessRequests (email) VALUES (${email})`
    );
    const insertedRequest = await db.query(
      sql`SELECT * FROM accessRequests WHERE email = ${email} LIMIT 1`
    );
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, // Default port for Mailhog
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: "system@ezpdf.app",
      to: email,
      subject: `Create your Ezpdf acco`,
      text: "Your invoice is attached, you better pay it.",
      html: `<p>Click <a target="_blank" rel="noopener noreferrer"  href="http://localhost:3030/account/new/${insertedRequest[0].id}">here</a> to create your account</p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error sending email:", error);
      }
      console.log("Email sent:", info.messageId);
    });
    res.status(201).json({ success: true, data: insertedRequest[0] });
  } catch (error) {
    console.error("error", error);
    res
      .status(500)
      .json({ success: false, message: "Error requesting access" });
  }
});

accountRouter.get("/new/:id", async (req, res) => {
  let id = req.params.id;
  const results = await db.query(sql`
          SELECT * from accessRequests WHERE id = ${id};
        `);
  let request = results[0];
  res.status(200).send(request);
  return;
});
