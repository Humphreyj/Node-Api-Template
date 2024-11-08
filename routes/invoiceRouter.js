import { Router } from "express";
// PDF Generation
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import db, { sql } from "../db.js";
export const invoiceRouter = Router();

invoiceRouter.get("/", async (req, res) => {
  const results = await db.query(sql`
        SELECT * from invoices
        ORDER BY invoiceNumber;
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
    dueDate,
    invoiceTotal,
    lineItems,
    status,
  } = req.body;

  try {
    await db.query(
      sql`INSERT INTO invoices (clientId, client, invoiceNumber, invoiceDate, dueDate, invoiceTotal, lineItems, status) 
          VALUES (${clientId}, ${JSON.stringify(
        client
      )}, ${invoiceNumber}, ${invoiceDate}, ${dueDate}, ${invoiceTotal}, ${JSON.stringify(
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

invoiceRouter.put("/update", async (req, res) => {
  const {
    id,
    clientId,
    client,
    invoiceNumber,
    invoiceDate,
    dueDate,
    invoiceTotal,
    lineItems,
    status,
  } = req.body;

  try {
    await db.query(
      sql`UPDATE invoices
          SET
            clientId = ${clientId},
            client = ${JSON.stringify(client)},
            invoiceNumber = ${invoiceNumber},
            invoiceDate = ${invoiceDate.substring(0, 10)},
            dueDate = ${dueDate.substring(0, 10)},
            invoiceTotal = ${invoiceTotal},
            lineItems = ${JSON.stringify(lineItems)},
            status = ${status}
          WHERE id = ${id}
            `
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

invoiceRouter.post("/send-invoice", async (req, res) => {
  const { invoiceId, client, invoiceNumber } = req.body;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // Default port for Mailhog
    secure: false,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
  });
  await page.goto(`http://localhost:3030/send-invoice/${invoiceId}`);

  // Generate the PDF as a buffer
  const pdfBuffer = await page.pdf({ printBackground: true });

  await browser.close();

  // Set headers to prompt a file download
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", pdfBuffer.length);
  const mailOptions = {
    from: "system@ezpdf.app",
    to: client.email,
    subject: `Invoice for ${client.full_name}`,
    text: "Your invoice is attached, you better pay it.",
    attachments: [
      {
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Email sent:", info.messageId);
  });
  const date = new Date();
  const lastSentDate = date.toISOString();
  await db.query(
    sql`UPDATE invoices
        SET
          lastSentDate = ${lastSentDate.substring(0, 10)},
          status = 'unpaid'
          `
  );

  // Send the buffer and close the response
  res.send(pdfBuffer);
});
