import express from "express";
import puppeteer from "puppeteer";
// PDF Generation
import { router } from "./routes/index.js";
import cors from "cors";

const app = express();
const port = 8080;

// const db = await getConnection();

app.use(cors()).use(express.json()).use("/api", router);

app.get("/pdf2/:id", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const invoiceId = req.params.id;
  console.log(req.params);
  await page.goto(`http://localhost:3030/send-invoice/${invoiceId}`);
  // await page.goto(
  //   `http://localhost:3030/send-invoice/109d17de-987c-11ef-9b4a-0242ac140002`
  // );

  // Generate the PDF as a buffer
  const pdfBuffer = await page.pdf({ printBackground: true });

  await browser.close();

  // Set headers to prompt a file download
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", pdfBuffer.length);

  // Send the buffer and close the response
  res.end(pdfBuffer);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
