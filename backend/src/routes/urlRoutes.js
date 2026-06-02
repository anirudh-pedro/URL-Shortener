import express from 'express';
import { body } from 'express-validator';
import { createShortUrl, getUserUrls, getUrlById, deleteUrl } from '../controllers/urlController.js';
import protect from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Apply auth middleware to protect all URL routes
router.use(protect);

/**
 * @swagger
 * /api/urls:
 *   post:
 *     summary: Create a shortened URL
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 example: https://google.com
 *               customAlias:
 *                 type: string
 *                 example: google
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *       400:
 *         description: Validation error or alias already in use
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  [
    body('originalUrl')
      .trim()
      .notEmpty()
      .withMessage('Original URL is required')
      .isURL()
      .withMessage('Please provide a valid URL'),
    body('customAlias')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Custom alias must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Custom alias must contain only alphanumeric characters, dashes, or underscores'),
    body('expiryDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Please provide a valid date string (e.g., YYYY-MM-DD)'),
  ],
  validateRequest,
  createShortUrl
);

/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: Retrieve paginated list of URLs created by logged-in user
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: URLs list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserUrls);

/**
 * @swagger
 * /api/urls/{id}:
 *   get:
 *     summary: Get single URL details
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL database ID
 *     responses:
 *       200:
 *         description: URL retrieved successfully
 *       404:
 *         description: URL not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getUrlById);

/**
 * @swagger
 * /api/urls/{id}:
 *   delete:
 *     summary: Delete a shortened URL and its analytics
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL database ID
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *       404:
 *         description: URL not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteUrl);

export default router;
