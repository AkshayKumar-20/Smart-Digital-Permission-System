const PDFDocument = require('pdfkit');

const generatePermissionPDF = (data, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream the PDF directly to the response
  doc.pipe(res);

  // --- College Header ---
  doc.fontSize(20).text("SMART COLLEGE OF TECHNOLOGY", { align: "center", bold: true });
  doc.fontSize(10).text("Official Permission Letter", { align: "center" });
  doc.moveDown();
  doc.path('M 50 80 L 550 80').stroke(); // Horizontal line
  doc.moveDown();

  // --- Letter Content ---
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  doc.text(`To,`, { bold: true });
  doc.text(`The Department Head / Class Teacher,`);
  doc.moveDown();
  doc.text(`Subject: Permission Request for ${data.requestType}`);
  doc.moveDown();
  doc.text(`Respected Sir/Madam,`);
  doc.moveDown();
  doc.text(`I, ${data.student.name}, a student of ${data.student.department}, Year: ${data.student.year}, am writing to request permission for: ${data.reason}.`);
  doc.moveDown();
  doc.text(`Description: ${data.description || "As discussed."}`);
  doc.moveDown();
  doc.text(`Status: ${data.status.toUpperCase()}`);
  doc.moveDown();
  doc.moveDown();

  // --- Signature Area ---
  doc.text("__________________________", 400, doc.y);
  doc.text("Authorized Signature", 400, doc.y + 15);

  doc.end();
};

module.exports = { generatePermissionPDF };