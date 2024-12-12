import { Router } from "express";
// PDF Generation
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import db, { sql } from "../db.js";
export const invoiceRouter = Router();

invoiceRouter.get("/list/:accountId", async (req, res) => {
  const accountId = req.params.accountId;
  const results = await db.query(sql`
        SELECT * from invoices WHERE accountId = ${accountId}
        ORDER BY invoiceNumber;
      `);

  res.send(results);
  return;
});

invoiceRouter.get("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const results = await db.query(sql`
    SELECT * from invoices WHERE id = ${id};
    `);
    const client = await db.query(
      sql`SELECT * from profiles WHERE id = ${results[0].clientId}`
    );
    results[0].client = client[0];
    res.send(results[0]);
    return;
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error fetching invoice" });
    return;
  }
});

invoiceRouter.post("/create", async (req, res) => {
  const {
    accountId,
    clientId,
    client,
    invoiceNumber,
    invoiceDate,
    dueDate,
    invoiceTotal,
    lineItems,
    status,
    comments,
    discount,
    totalDiscount,
  } = req.body;

  const formattedInvoiceDate = new Date(invoiceDate)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formattedDueDate = new Date(dueDate)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    await db.query(
      sql`INSERT INTO invoices (accountId, clientId, client, invoiceNumber, invoiceDate, dueDate, invoiceTotal, lineItems, status, comments, discount, totalDiscount) 
          VALUES (${accountId}, ${clientId}, ${JSON.stringify(
        client
      )}, ${invoiceNumber}, ${formattedInvoiceDate}, ${formattedDueDate}, ${invoiceTotal}, ${JSON.stringify(
        lineItems
      )}, ${status}, ${comments}, ${discount}, ${totalDiscount})`
    );

    const result = await db.query(
      sql`SELECT * FROM invoices WHERE invoiceNumber = ${invoiceNumber} `
    );
    const newInvoice = result[0];
    res.status(201).json(newInvoice);
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
    comments,
    discount,
    totalDiscount,
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
            status = ${status},
            comments = ${comments},
            discount = ${discount},
            totalDiscount = ${totalDiscount}
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
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await page.goto(`http://localhost:3030/send-invoice/${invoiceId}`);
  await delay(5000);
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

  let date = Date.now();
  const formattedSentDate = new Date(date)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  await db.query(
    sql`UPDATE invoices
          SET
            lastSentDate = ${formattedSentDate},
            status = 'unpaid'
          WHERE id = ${invoiceId}`
  );

  // Send the buffer and close the response
  res.status(200).send(pdfBuffer);
});

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
