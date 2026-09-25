import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generates a unique secure ticket token payload
 */
export const generateTicketToken = (attendeeId, eventId, bookingId) => {
  const payload = {
    aid: attendeeId,
    eid: eventId,
    bid: bookingId,
    t: Date.now(),
    r: crypto.randomBytes(4).toString('hex'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

/**
 * Generates a base64 Data URL for embedding or displaying the QR code
 */
export const generateQRCodeDataURL = async (tokenData) => {
  try {
    const dataUrl = await QRCode.toDataURL(tokenData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 300,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

/**
 * Decodes and validates ticket token
 */
export const parseTicketToken = (token) => {
  try {
    const jsonStr = Buffer.from(token, 'base64url').toString('utf8');
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
};
