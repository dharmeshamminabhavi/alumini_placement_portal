const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Retail', 'Education', 'Other']
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  location: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
  },
  foundedYear: {
    type: Number
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  averagePackage: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
companySchema.index({ name: 'text', description: 'text', industry: 'text' });

module.exports = mongoose.model('Company', companySchema); 