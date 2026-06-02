import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import useragent from 'express-useragent';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Import routes & controllers
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { redirectToOriginalUrl } from './controllers/urlController.js';
import errorHandler from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Ensure log folder exists and build access log stream
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// Log Apache-style combined logs to access.log and dev colorized logs to console
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON and URL encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach user-agent parsing to req.useragent
app.use(useragent.express());

// --- RATE LIMITERS ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Relaxed from 10 to 100 in dev mode
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 2000, // Higher limit in development
  message: {
    success: false,
    message: 'Too many redirection requests from this IP. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply specific rate limiters to routes
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);

// --- SWAGGER API DOCUMENTATION ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener with Analytics API',
      version: '1.0.0',
      description: 'Production-ready Node.js API for URL Shortener with real-time visitor analytics',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000',
        description: 'Server URL',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redirect API Endpoint with rate limiter
app.get('/:shortCode', redirectLimiter, redirectToOriginalUrl);

// Application routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  next(error);
});

// Centralized error handler
app.use(errorHandler);

export default app;
