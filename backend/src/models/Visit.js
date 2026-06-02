import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
});

// Compound index to optimize matching and sorting visits by timestamp for recent logs
visitSchema.index({ urlId: 1, timestamp: -1 });

// Export the model
const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
