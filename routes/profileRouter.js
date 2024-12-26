import { Router } from "express";
import db, { sql } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const profileRouter = Router();

profileRouter.get("/", async (req, res) => {
  const results = await db.query(sql`
        SELECT * from profiles
        WHERE role = 'client';
      `);

  res.send(results);

  return;
});

profileRouter.get("/list/:accountId", async (req, res) => {
  let accountId = req.params.accountId;
  const results = await db.query(sql`
        SELECT * from profiles
        WHERE role = 'client' AND accountId = ${accountId};
      `);

  res.send(results);

  return;
});

profileRouter.get("/:id", async (req, res) => {
  let id = req.params.id;
  const results = await db.query(sql`
        SELECT * from profiles WHERE id = ${id};
      `);
  res.send(results[0]);
  return;
});

profileRouter.post("/create-client", async (req, res) => {
  const { accountId, first_name, last_name, email, phone, address, role } =
    req.body;
  try {
    let full_name = `${first_name} ${last_name}`;
    await db.query(
      sql`INSERT INTO profiles ( accountId, first_name, last_name, full_name, email, phone, address, role) 
          VALUES (${accountId}, ${first_name}, ${last_name}, ${full_name}, ${email}, ${phone}, ${JSON.stringify(
        address
      )}, ${role})`
    );

    const result = await db.query(
      sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`
    );
    const newProfileId = result[0].id;
    let newProfile = {
      id: newProfileId,
      first_name: first_name,
      last_name: last_name,
      full_name: full_name,
      email: email,
      phone: phone,
      address: address,
      role: role,
    };
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
    return;
  }
});

profileRouter.post("/create", async (req, res) => {
  const saltRounds = 10;
  const {
    accountId,
    first_name,
    last_name,
    email,
    password,
    phone,
    address,
    role,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    let full_name = `${first_name} ${last_name}`;
    await db.query(
      sql`INSERT INTO profiles ( accountId, first_name, last_name, full_name, email, password, phone, address, role) 
          VALUES (${accountId}, ${first_name}, ${last_name}, ${full_name}, ${email}, ${hashedPassword}, ${phone}, ${JSON.stringify(
        address
      )}, ${role})`
    );

    const result = await db.query(
      sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`
    );
    const newProfileId = result[0].id;
    let newProfile = {
      id: newProfileId,
      first_name: first_name,
      last_name: last_name,
      full_name: full_name,
      email: email,
      phone: phone,
      address: address,
      role: role,
    };
    // Generate tokens
    const accessToken = jwt.sign(newProfile, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      newProfile,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Insert tokens into the profiles table
    await db.query(
      sql`UPDATE profiles SET accessToken = ${accessToken}, refreshToken = ${refreshToken} WHERE email = ${email}`
    );

    newProfile = { ...newProfile, accessToken, refreshToken };
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
    return;
  }
});

profileRouter.put("/update", async (req, res) => {
  const { id, accountId, first_name, last_name, phone, email, address, role } =
    req.body;
  try {
    let full_name = `${first_name} ${last_name}`;
    await db.query(sql`
        UPDATE profiles
        SET 
          accountId = ${accountId},
          first_name = ${first_name},
          last_name = ${last_name},
          full_name = ${full_name},
          phone = ${phone},
          email = ${email},
          address = ${JSON.stringify(address)},
          role = ${role}
        WHERE id = ${id}
      `);

    const result = await db.query(
      sql`SELECT id FROM profiles WHERE id = ${id} LIMIT 1`
    );
    const updated = result[0].id;
    res.json({ success: true, id: updated });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
  }
});

profileRouter.delete("/delete/:id", async (req, res) => {
  let id = req.params.id;
  await db.query(sql`
    DELETE FROM profiles
    WHERE id=${id}
  `);
  res.json({ success: true, id: id });
});
