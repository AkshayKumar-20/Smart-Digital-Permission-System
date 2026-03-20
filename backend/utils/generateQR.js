const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT that encodes the QR payload.
 * The QR displayed to the student encodes the full verify URL.
 * @param {Object} request - Mongoose Request document
 * @param {string} approverId - ObjectId of the approver
 * @returns {string} signed JWT token
 */
const generateQRToken = (request, approverId) => {
  const payload = {
    requestId:  request._id.toString(),
    studentId:  request.student.toString(),
    approvedBy: approverId.toString(),
    approvedAt: new Date().toISOString(),
    validUntil: request.toDate.toISOString()
  };

  // Calculate seconds until toDate
  const now = Math.floor(Date.now() / 1000);
  const expiry = Math.floor(new Date(request.toDate).getTime() / 1000);
  const expiresIn = Math.max(expiry - now, 3600); // at least 1 hour

  return jwt.sign(payload, process.env.QR_SECRET, { expiresIn });
};

module.exports = generateQRToken;
