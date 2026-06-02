import express from 'express';
import { getUrlAnalytics } from '../controllers/analyticsController.js';
import { generateMockTraffic } from '../controllers/mockController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/{urlId}:
 *   get:
 *     summary: Retrieve click and visitor analytics for a URL
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL database ID
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       400:
 *         description: Invalid URL ID format
 *       404:
 *         description: URL not found or unauthorized
 *       401:
 *         description: Unauthorized
 */
router.get('/:urlId', protect, getUrlAnalytics);

/**
 * @swagger
 * /api/analytics/{urlId}/mock:
 *   post:
 *     summary: Generate mock visitor logs for a URL
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urlId
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL database ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 example: 50
 *               daysRange:
 *                 type: integer
 *                 example: 7
 *     responses:
 *       201:
 *         description: Mock traffic generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:urlId/mock', protect, generateMockTraffic);

export default router;
