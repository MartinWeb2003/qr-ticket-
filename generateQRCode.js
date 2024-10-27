
const QRCode = require('qrcode');

async function generateQRCode(url) {
  try {
    return await QRCode.toDataURL(url);
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR Code');
  }
}

module.exports = generateQRCode;
