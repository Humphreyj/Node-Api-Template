import { Router } from "express";

import db, { sql } from "../db.js";
export const settingsRouter = Router();

settingsRouter.get("/:accountId", async (req, res) => {
  const accountId = req.params.accountId;
  const [{ max_invoice_number }] = await db.query(
    sql`SELECT COALESCE(MAX(invoiceNumber), 0) + 1 AS max_invoice_number FROM invoices WHERE accountId = ${accountId}`
  );
  const settingsResponse = {
    nextInvoiceNumber: max_invoice_number,
  };
  res.status(200).send(settingsResponse);
  return;
});
