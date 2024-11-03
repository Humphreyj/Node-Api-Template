import { Router } from "express";
import db, { sql } from "../db.js";
export const invoiceRouter = Router();

invoiceRouter.get("/", async (req, res) => {
  const results = await db.query(sql`
        SELECT * from invoices;
      `);
  res.send(results);
  return;
});

invoiceRouter.get("/:id", async (req, res) => {
  let id = req.params.id;
  const results = await db.query(sql`
        SELECT * from invoices WHERE id = ${id};
      `);
  res.send(results[0]);
  return;
});

invoiceRouter.post("/create", async (req, res) => {
  const {
    clientId,
    client,
    invoiceNumber,
    invoiceDate,
    invoiceDueDate,
    invoiceTotal,
    lineItems,
    status,
  } = req.body;

  console.log(req.body);
  try {
    await db.query(
      sql`INSERT INTO invoices (clientId, client, invoiceNumber, invoiceDate, dueDate, invoiceTotal, lineItems, status) 
          VALUES (${clientId}, ${JSON.stringify(
        client
      )}, ${invoiceNumber}, ${invoiceDate}, ${invoiceDueDate}, ${invoiceTotal}, ${JSON.stringify(
        lineItems
      )}, ${status})`
    );

    const result = await db.query(
      sql`SELECT id FROM invoices WHERE clientId = ${clientId} LIMIT 1`
    );
    const newInvoiceId = result[0].id;
    res.json({ success: true, id: newInvoiceId });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating invoice" });
    return;
  }
});

// invoiceRouter.get("/invoice/:id", async (req, res) => {
//   let invoiceId = req.params.id;
//   const results = await db.query(sql`
//         SELECT * from invoices WHERE id = ${invoiceId};
//       `);
//   console.log(invoiceId);
//   res.send(results[0]);
//   return;
// });
