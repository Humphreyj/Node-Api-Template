import PDFDocument from "pdfkit";

export const createInvoice = (invoiceData, outputPath) => {
  const doc = new PDFDocument({
    margins: {
      top: 25,
      left: 25,
      right: 25,
    },
  });

  // Pipe the PDF to a writable stream (e.g., file or response)

  // Header
  doc
    .fontSize(20)
    .text(invoiceData.companyName, { align: "center" })
    .fontSize(12)
    .text(invoiceData.companyAddress, { align: "center" })
    .moveDown();
  doc.lineCap("butt").moveTo(10, doc.y).lineTo(605, doc.y).stroke().moveDown();

  // Invoice Title
  doc
    .fontSize(18)
    .text("INVOICE", { align: "center", underline: true })
    .moveDown();

  // Client Information
  //   doc
  //     .fontSize(12)
  //     .text(`Date: ${invoiceData.date}`, { align: "right" })
  //     .text(`Invoice #: ${invoiceData.invoiceNumber}`, {
  //       align: "right",
  //       continuing: true,
  //     });

  doc
    .fontSize(14)
    .text(`Bill To: ${invoiceData.clientName}`)
    .fontSize(12)
    .text(invoiceData.clientAddress, { continuing: true })
    .text(`Date: ${invoiceData.date}`, { align: "right" })
    .text(`Invoice #: ${invoiceData.invoiceNumber}`, {
      align: "right",
    });

  // Table Header
  doc
    .fontSize(12)
    .text("Description", 30, doc.y, {
      continued: true,
      align: "left",
      width: 200,
    })
    .text("Quantity", 200, doc.y, {
      continued: true,
      align: "left",
      width: 200,
    })
    .text("Unit Price", 370, doc.y, {
      continued: true,
      align: "center",
      width: 100,
    })
    .text("Total", 470, doc.y)
    .moveDown();

  // Table Rows
  let totalAmount = 0;
  invoiceData.items.forEach((item) => {
    const itemTotal = item.quantity * item.unitPrice;
    totalAmount += itemTotal;

    doc
      .text(item.description, 30, doc.y, {
        continued: true,
        align: "left",
        width: 200,
        columns: 1,
      })
      .text(item.quantity, 200, doc.y, {
        continued: true,
        align: "center",
      })
      .text(`$${item.unitPrice.toFixed(2)}`, 370, doc.y, {
        continued: true,
        align: "center",
        width: 100,
      })
      .text(`$${itemTotal.toFixed(2)}`, 470, doc.y, {
        align: "right",
      })
      .moveDown();
  });

  // Total Amount
  doc
    .fontSize(12)
    .moveDown()
    .text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: "right" });

  // Footer
  doc
    .moveDown(2)
    .fontSize(10)
    .text("Thank you for your business!", { align: "center", italic: true });

  // Finalize PDF
  return doc;
};

// Sample invoice data
const invoiceData = {
  companyName: "Handy Services Inc.",
  companyAddress: "123 Main St, Springfield, USA",
  date: "2024-10-25",
  invoiceNumber: "INV-12345",
  clientName: "John Doe",
  clientAddress: "789 Elm St, Springfield, USA",
  items: [
    { description: "Plumbing Repair", quantity: "3", unitPrice: 75.0 },
    { description: "Electrical Fix", quantity: "1", unitPrice: 120.0 },
    { description: "Painting Service", quantity: "2", unitPrice: 50.0 },
  ],
};
