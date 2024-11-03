import { Router } from "express";
import db, { sql } from "../db.js";
export const profileRouter = Router();

profileRouter.get("/", async (req, res) => {
  const results = await db.query(sql`
        SELECT * from profiles;
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

profileRouter.post("/create", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address_line_1,
    address_line_2,
    city,
    state,
    zip,
    title,
  } = req.body;
  try {
    let full_name = `${first_name} ${last_name}`;
    await db.query(
      sql`INSERT INTO profiles (first_name, last_name, full_name, email, phone, address_line_1, address_line_2, city, state, zip, title) 
          VALUES (${first_name}, ${last_name}, ${full_name}, ${email}, ${phone}, ${address_line_1}, ${address_line_2}, ${city}, ${state}, ${zip}, ${title})`
    );

    const result = await db.query(
      sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`
    );
    const newProfileId = result[0].id;
    res.json({ success: true, id: newProfileId });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
    return;
  }
});

profileRouter.put("/update", async (req, res) => {
  const {
    id,
    first_name,
    last_name,
    phone,
    email,
    address_line_1,
    address_line_2,
    city,
    state,
    zip,
    title,
  } = req.body;
  try {
    await db.query(sql`
        UPDATE profiles
        SET 
          first_name = ${first_name},
          last_name = ${last_name},
          phone = ${phone},
          email = ${email},
          address_line_1 = ${address_line_1},
          address_line_2 = ${address_line_2},
          city = ${city},
          state = ${state},
          zip = ${zip},
          title = ${title}
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
});
