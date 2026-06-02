import mongoose from 'mongoose';
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// @desc    Generate mock traffic/visit logs for a URL
// @route   POST /api/analytics/:urlId/mock
// @access  Private
export const generateMockTraffic = async (req, res, next) => {
  const { urlId } = req.params;
  const userId = req.user._id;
  const count = Math.min(parseInt(req.body.count, 10) || 50, 200); // cap at 200 per call for safety
  const daysRange = Math.min(parseInt(req.body.daysRange, 10) || 7, 30); // limit to 30 days

  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(urlId)) {
      return errorResponse(res, 'Invalid URL ID format', 400);
    }

    // Verify URL ownership
    const url = await Url.findOne({ _id: urlId, userId });
    if (!url) {
      return errorResponse(res, 'URL not found or unauthorized access', 404);
    }

    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const referrers = ['Google', 'Direct', 'Twitter/X', 'GitHub', 'LinkedIn', 'YouTube'];

    const mockVisits = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      // Pick random device and matching browser
      const device = devices[Math.floor(Math.random() * devices.length)];
      let browser = browsers[Math.floor(Math.random() * browsers.length)];
      if (device === 'Mobile' && Math.random() > 0.4) {
        browser = 'Mobile Safari';
      }

      // Generate a timestamp in the range
      const randomMinutes = Math.floor(Math.random() * 24 * 60 * daysRange);
      const timestamp = new Date(now.getTime() - randomMinutes * 60 * 1000);

      // Generate a random IP address
      const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      // Generate User-Agent string
      const userAgent = `Mozilla/5.0 (Simulated; ${device}; ${browser})`;

      mockVisits.push({
        urlId: url._id,
        timestamp,
        ipAddress: ip,
        browser,
        device,
        userAgent,
      });
    }

    // Save all visits
    await Visit.insertMany(mockVisits);

    // Update click count atomically
    await Url.updateOne({ _id: url._id }, { $inc: { clickCount: count } });

    return successResponse(
      res,
      {
        generatedCount: count,
        urlId: url._id,
        shortCode: url.shortCode,
      },
      `Successfully generated ${count} mock visits for /${url.shortCode}`,
      201
    );
  } catch (error) {
    next(error);
  }
};
