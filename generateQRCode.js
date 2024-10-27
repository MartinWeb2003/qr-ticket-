// generateQRCode.js
const QRCode = require('qrcode');

async function generateQRCode(url) {
  try {
    return await QRCode.toDataURL(url); // Generate QR code as a base64 data URL
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR Code');
  }
}

module.exports = generateQRCode;
