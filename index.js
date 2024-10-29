import express from "express";
import PDFDocument from "pdfkit";
// PDF Generation
import { createInvoice } from "./services/pdf-service.js";

// import { connection } from "./db";

const app = express();
const port = 8080;

// connection.connect();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/pdf", (req, res) => {
  // Set the response headers to make it downloadable
  res.setHeader("Content-disposition", "attachment; filename=invoice.pdf");
  res.setHeader("Content-type", "application/pdf");

  let date = new Date();
  let dateOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  let invoiceDate = new Intl.DateTimeFormat("en-US", dateOptions).format(date);
  let invoiceNumber = "INV-42069";
  const invoiceData = {
    companyName: "Homie Antho",
    companyAddress: "123 Main St, Tickletown, USA",
    date: invoiceDate,
    invoiceNumber: invoiceNumber,
    clientName: "Rick Toucher",
    clientAddress: "789 Elm St, Springfield, USA",
    items: [
      { description: "Plumbing Repair", quantity: "2 hours", unitPrice: 75.0 },
      {
        description: "Electrical Service",
        quantity: "2 each",
        unitPrice: 120.0,
      },
      { description: "Painting Service", quantity: "3 hours", unitPrice: 50.0 },
    ],
  };
  const doc = createInvoice(invoiceData, `invoice-${invoiceNumber}`);

  // Pipe the document to the response
  doc.pipe(res);

  doc.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// connection.end();
