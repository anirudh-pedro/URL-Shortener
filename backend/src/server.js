import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful rejection handler for unhandled promises
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  if (err.stack) console.error(err.stack);
  // Close server and exit process
  server.close(() => process.exit(1));
});

// Graceful exception handler for uncaught synchronous errors
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception Error: ${err.message}`);
  console.error(err.stack);
  // Close server and exit process
  server.close(() => process.exit(1));
});
