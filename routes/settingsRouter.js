import { Router } from "express";

import db, { sql } from "../db.js";
export const settingsRouter = Router();

settingsRouter.get("/:accountId", async (req, res) => {
  const accountId = req.params.accountId;
  const [{ max_invoice_number, total_invoice_amount }] = await db.query(
    sql`SELECT COALESCE(MAX(invoiceNumber), 0) + 1 AS max_invoice_number, COALESCE(SUM(invoiceTotal), 0) AS total_invoice_amount FROM invoices WHERE accountId = ${accountId}`
  );
  const settingsResponse = {
    nextInvoiceNumber: max_invoice_number,
    totalInvoiced: total_invoice_amount,
  };
  res.status(200).send(settingsResponse);
  return;
});
