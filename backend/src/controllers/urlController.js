import Url from '../models/Url.js';
import Visit from '../models/Visit.js';
import { generateUniqueCode } from '../services/shortCodeService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import QRCode from 'qrcode';

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Private
export const createShortUrl = async (req, res, next) => {
  const { originalUrl, customAlias, expiryDate } = req.body;
  const userId = req.user._id;

  try {
    let shortCode;

    if (customAlias) {
      // Validate Custom Alias format
      const aliasRegex = /^[a-zA-Z0-9_-]+$/;
      if (!aliasRegex.test(customAlias)) {
        return errorResponse(res, 'Custom alias must be alphanumeric, dashes, or underscores', 400);
      }

      // Check uniqueness of custom alias
      const existingAlias = await Url.findOne({ shortCode: customAlias });
      if (existingAlias) {
        return errorResponse(res, 'Custom alias is already in use', 400);
      }
      shortCode = customAlias;
    } else {
      // Generate a unique code
      shortCode = await generateUniqueCode(7);
    }

    // Build Short URL and QR Code
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${shortCode}`;
    const qrCodeUrl = await QRCode.toDataURL(shortUrl);

    // Save URL document
    const url = await Url.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      qrCodeUrl,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    return successResponse(
      res,
      {
        shortUrl,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        qrCodeUrl: url.qrCodeUrl,
        expiryDate: url.expiryDate,
        clickCount: url.clickCount,
        _id: url._id,
      },
      'Short URL created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs created by logged-in user
// @route   GET /api/urls
// @access  Private
export const getUserUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Sanitize pagination inputs
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.max(1, Math.min(100, limit)); // Cap page limit at 100 for security
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    // Perform DB queries in parallel for efficiency
    const [urls, totalItems] = await Promise.all([
      Url.find({ userId: req.user._id })
        .select('originalUrl shortCode clickCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit),
      Url.countDocuments({ userId: req.user._id }),
    ]);

    const totalPages = Math.ceil(totalItems / sanitizedLimit);

    return successResponse(
      res,
      {
        urls,
        pagination: {
          totalItems,
          totalPages,
          currentPage: sanitizedPage,
          limit: sanitizedLimit,
        },
      },
      'User URLs retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single URL details
// @route   GET /api/urls/:id
// @access  Private
export const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return errorResponse(res, 'URL not found or unauthorized', 404);
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${url.shortCode}`;

    return successResponse(
      res,
      {
        ...url.toObject(),
        shortUrl,
      },
      'URL retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL belonging to logged-in user
// @route   DELETE /api/urls/:id
// @access  Private
export const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return errorResponse(res, 'URL not found or unauthorized', 404);
    }

    // Cascade delete visits
    await Visit.deleteMany({ urlId: url._id });
    await Url.deleteOne({ _id: url._id });

    return successResponse(res, null, 'URL and associated analytics deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
export const redirectToOriginalUrl = async (req, res, next) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send('<h1>URL Not Found</h1><p>The link you are trying to reach does not exist.</p>');
    }

    // Check expiry
    if (url.expiryDate && new Date() > new Date(url.expiryDate)) {
      return res.status(410).send('<h1>Link Expired</h1><p>This shortened link has expired.</p>');
    }

    // Increment click count atomically to prevent concurrent race conditions
    await Url.updateOne({ _id: url._id }, { $inc: { clickCount: 1 } });

    // Extract device metadata
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
    const userAgentStr = req.headers['user-agent'] || 'Unknown';
    let browser = 'Unknown';
    let device = 'Desktop';

    if (req.useragent) {
      browser = req.useragent.browser || 'Unknown';
      if (req.useragent.isMobile) device = 'Mobile';
      else if (req.useragent.isTablet) device = 'Tablet';
      else if (req.useragent.isDesktop) device = 'Desktop';
    }

    // Create Visit record
    await Visit.create({
      urlId: url._id,
      ipAddress,
      browser,
      device,
      userAgent: userAgentStr,
    });

    // Redirect
    return res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination URL (Edit URL)
// @route   PUT /api/urls/:id
// @access  Private
export const updateUrl = async (req, res, next) => {
  const { originalUrl } = req.body;
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return errorResponse(res, 'URL not found or unauthorized access', 404);
    }

    url.originalUrl = originalUrl;
    await url.save();

    return successResponse(res, url, 'Destination URL updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create shortened URLs
// @route   POST /api/urls/bulk
// @access  Private
export const bulkCreateUrls = async (req, res, next) => {
  const { urlsList } = req.body; // array of { originalUrl, customAlias, expiryDate }
  const userId = req.user._id;

  try {
    if (!Array.isArray(urlsList) || urlsList.length === 0) {
      return errorResponse(res, 'Please provide a list of URLs to shorten', 400);
    }

    const createdUrls = [];
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    for (const item of urlsList) {
      const { originalUrl, customAlias, expiryDate } = item;

      // Basic validation
      if (!originalUrl || !/^https?:\/\/\S+/i.test(originalUrl)) {
        continue; // skip invalid URLs
      }

      let shortCode;
      if (customAlias) {
        // Validate custom alias format
        const aliasRegex = /^[a-zA-Z0-9_-]+$/;
        if (!aliasRegex.test(customAlias)) continue;
        const existingAlias = await Url.findOne({ shortCode: customAlias });
        if (existingAlias) continue;
        shortCode = customAlias;
      } else {
        shortCode = await generateUniqueCode(7);
      }

      const shortUrl = `${baseUrl}/${shortCode}`;
      const qrCodeUrl = await QRCode.toDataURL(shortUrl);

      const urlDoc = await Url.create({
        userId,
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        qrCodeUrl,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      });

      createdUrls.push({
        _id: urlDoc._id,
        originalUrl: urlDoc.originalUrl,
        shortCode: urlDoc.shortCode,
        shortUrl,
        createdAt: urlDoc.createdAt,
      });
    }

    return successResponse(res, createdUrls, `Successfully shortened ${createdUrls.length} URLs in bulk`, 201);
  } catch (error) {
    next(error);
  }
};
