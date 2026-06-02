import { nanoid } from 'nanoid';
import Url from '../models/Url.js';

/**
 * Generates a unique short code that does not exist in the database.
 * @param {number} length - Length of the short code (default: 7)
 * @returns {Promise<string>}
 */
export const generateUniqueCode = async (length = 7) => {
  let isUnique = false;
  let code = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = nanoid(length);
    const existing = await Url.findOne({ shortCode: code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique short code after multiple attempts');
  }

  return code;
};
