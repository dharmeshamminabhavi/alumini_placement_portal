const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Company = require('../models/Company');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies with filters
// @access  Public
router.get('/', [
  query('search').optional().trim(),
  query('industry').optional().isIn(['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Retail', 'Education', 'Other']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { search, industry, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (industry) filter.industry = industry;
    if (search) {
      filter.$text = { $search: search };
    }

    const companies = await Company.find(filter)
      .sort({ averageRating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Company.countDocuments(filter);

    res.json({
      success: true,
      companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.isActive) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ 
      success: true,
      company 
    });
  } catch (error) {
    console.error('Get company error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/companies
// @desc    Create a new company
// @access  Private (Admin or Alumni)
router.post('/', auth, async (req, res) => {
  // Check if user is admin or alumni
  if (req.user.role !== 'admin' && req.user.role !== 'alumni') {
    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  }
}, [
  body('name').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters long'),
  body('industry').isIn(['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Retail', 'Education', 'Other']).withMessage('Invalid industry'),
  body('description').optional().trim(),
  body('website').optional().trim().isURL().withMessage('Please provide a valid website URL'),
  body('location').optional().trim(),
  body('companySize').optional().isIn(['1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']).withMessage('Invalid company size'),
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid founded year'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, industry, description, website, location, companySize, foundedYear, tags } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const company = new Company({
      name,
      industry,
      description,
      website,
      location,
      companySize,
      foundedYear,
      tags
    });

    await company.save();

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private (Admin only)
router.put('/:id', auth, requireAdmin, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters long'),
  body('industry').optional().isIn(['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Retail', 'Education', 'Other']).withMessage('Invalid industry'),
  body('description').optional().trim(),
  body('website').optional().trim().isURL().withMessage('Please provide a valid website URL'),
  body('location').optional().trim(),
  body('companySize').optional().isIn(['1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']).withMessage('Invalid company size'),
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid founded year'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const updateFields = req.body;
    delete updateFields.averageRating;
    delete updateFields.totalReviews;
    delete updateFields.averagePackage;
    delete updateFields.placementCount;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isActive = false;
    await company.save();

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/stats/overview
// @desc    Get company statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments({ isActive: true });
    const topCompanies = await Company.find({ isActive: true })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .select('name averageRating totalReviews averagePackage');

    const industryStats = await Company.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalCompanies,
      topCompanies,
      industryStats
    });
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 