import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customAlias: {
      type: String,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    qrCodeUrl: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically provides createdAt and updatedAt fields
  }
);

// Compound index to optimize querying and sorting user URLs by creation date
urlSchema.index({ userId: 1, createdAt: -1 });

// Export the model
const Url = mongoose.model('Url', urlSchema);

export default Url;
