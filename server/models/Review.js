const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  workCulture: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  workLifeBalance: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  careerGrowth: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  compensation: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  management: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 50,
    maxlength: 2000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  recommendations: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  linkedinProfile: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ company: 1, createdAt: -1 });
reviewSchema.index({ author: 1, createdAt: -1 });

// Virtual for calculating average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [this.workCulture, this.workLifeBalance, this.careerGrowth, this.compensation, this.management];
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

module.exports = mongoose.model('Review', reviewSchema); 