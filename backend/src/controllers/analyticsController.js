import mongoose from 'mongoose';
import Url from '../models/Url.js';
import Visit from '../models/Visit.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// @desc    Get analytics for a specific URL
// @route   GET /api/analytics/:urlId
// @access  Private
export const getUrlAnalytics = async (req, res, next) => {
  const { urlId } = req.params;
  const userId = req.user._id;

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

    // Calculate total clicks
    const totalClicks = await Visit.countDocuments({ urlId });

    // Fetch the 10 most recent visits
    const recentVisits = await Visit.find({ urlId })
      .sort({ timestamp: -1 })
      .limit(10);

    // Get last visited timestamp
    const lastVisited = recentVisits.length > 0 ? recentVisits[0].timestamp : null;

    // Aggregate clicks grouped by day (YYYY-MM-DD) for the last 7 days to optimize query performance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicksByDay = await Visit.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedClicksByDay = clicksByDay.map((item) => ({
      date: item._id,
      count: item.clicks,
    }));

    return successResponse(
      res,
      {
        totalClicks,
        lastVisited,
        recentVisits,
        clicksByDay: formattedClicksByDay,
      },
      'URL analytics retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get public analytics for a specific URL by shortCode
// @route   GET /api/analytics/public/:shortCode
// @access  Public
export const getPublicUrlAnalytics = async (req, res, next) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return errorResponse(res, 'URL not found', 404);
    }

    // Check expiry
    if (url.expiryDate && new Date() > new Date(url.expiryDate)) {
      return errorResponse(res, 'This link has expired', 410);
    }

    const totalClicks = await Visit.countDocuments({ urlId: url._id });

    // Fetch the 10 most recent visits (masking IP addresses/UA for privacy)
    const recentVisits = await Visit.find({ urlId: url._id })
      .select('browser device timestamp') // omit ipAddress & userAgent
      .sort({ timestamp: -1 })
      .limit(10);

    const lastVisited = recentVisits.length > 0 ? recentVisits[0].timestamp : null;

    // Aggregate clicks grouped by day (YYYY-MM-DD) for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicksByDay = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedClicksByDay = clicksByDay.map((item) => ({
      date: item._id,
      count: item.clicks,
    }));

    return successResponse(
      res,
      {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        totalClicks,
        lastVisited,
        recentVisits,
        clicksByDay: formattedClicksByDay,
      },
      'Public URL analytics retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};
