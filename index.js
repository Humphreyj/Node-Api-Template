import express from "express";
// PDF Generation
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import { router } from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

const app = express();
const port = 8080;

// const db = await getConnection();

app.use(cors()).use(express.json()).use(helmet()).use("/api", router);
console.log(process.env.TEST_PROP);
app.get("/api/pdf2/:id", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const invoiceId = req.params.id;
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // Default port for Mailhog
    secure: false,
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
    to: "joshhumphrey1@gmail.com",
    subject: "Here is your PDF",
    text: "Please find the PDF attached.",
    attachments: [
      {
        filename: "document.pdf",
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

  // Send the buffer and close the response
  res.send(pdfBuffer);
});

process.once("SIGTERM", () => {
  db.dispose().catch((ex) => {
    console.error(ex);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
