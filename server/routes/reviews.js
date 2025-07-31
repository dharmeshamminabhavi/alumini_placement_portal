const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Company = require('../models/Company');
const { auth, requireAlumni } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews with filters
// @access  Public
router.get('/', [
  query('company').optional().isMongoId().withMessage('Invalid company ID'),
  query('author').optional().isMongoId().withMessage('Invalid author ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['newest', 'oldest', 'rating', 'helpful']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, author, page = 1, limit = 10, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (company) filter.company = company;
    if (author) filter.author = author;

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'rating':
        sortObj = { overallRating: -1 };
        break;
      case 'helpful':
        sortObj = { helpfulCount: -1 };
        break;
    }

    const reviews = await Review.find(filter)
      .populate('author', 'name graduationYear branch currentCompany designation email linkedinProfile')
      .populate('company', 'name industry logo')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/company/:companyId
// @desc    Get all reviews for a specific company (no pagination)
// @access  Public
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const reviews = await Review.find({ 
      company: companyId, 
      isActive: true 
    })
      .populate('author', 'name graduationYear branch currentCompany designation email linkedinProfile')
      .populate('company', 'name industry logo')
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      reviews,
      total: reviews.length
    });
  } catch (error) {
    console.error('Get company reviews error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('author', 'name graduationYear branch currentCompany designation email linkedinProfile')
      .populate('company', 'name industry logo');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ 
      success: true,
      review 
    });
  } catch (error) {
    console.error('Get review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Alumni only)
router.post('/', auth, requireAlumni, [
  body('company').isMongoId().withMessage('Valid company ID is required'),

  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('workCulture').isInt({ min: 1, max: 5 }).withMessage('Work culture rating must be between 1 and 5'),
  body('workLifeBalance').isInt({ min: 1, max: 5 }).withMessage('Work-life balance rating must be between 1 and 5'),
  body('careerGrowth').isInt({ min: 1, max: 5 }).withMessage('Career growth rating must be between 1 and 5'),
  body('compensation').isInt({ min: 1, max: 5 }).withMessage('Compensation rating must be between 1 and 5'),
  body('management').isInt({ min: 1, max: 5 }).withMessage('Management rating must be between 1 and 5'),
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('content').trim().isLength({ min: 50, max: 2000 }).withMessage('Content must be between 50 and 2000 characters'),
  body('pros').optional().isArray().withMessage('Pros must be an array'),
  body('cons').optional().isArray().withMessage('Cons must be an array'),
  body('recommendations').isIn(['Yes', 'No', 'Maybe']).withMessage('Recommendation must be Yes, No, or Maybe'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean'),
  body('linkedinProfile').optional().isURL().withMessage('LinkedIn profile must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      overallRating,
      workCulture,
      workLifeBalance,
      careerGrowth,
      compensation,
      management,
      title,
      content,
      pros = [],
      cons = [],
      recommendations,
      isAnonymous = false,
      linkedinProfile
    } = req.body;

    // Check if user already reviewed this company
    const existingReview = await Review.findOne({
      author: req.user._id,
      company,
      isActive: true
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    const reviewData = {
      author: req.user._id,
      company,
      overallRating,
      workCulture,
      workLifeBalance,
      careerGrowth,
      compensation,
      management,
      title,
      content,
      pros,
      cons,
      recommendations,
      isAnonymous,
      linkedinProfile
    };



    const review = new Review(reviewData);

    await review.save();

    // Update company statistics
    await updateCompanyStats(company);

    const populatedReview = await Review.findById(review._id)
      .populate('author', 'name graduationYear branch currentCompany designation email linkedinProfile')
      .populate('company', 'name industry logo');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Review author or admin)
router.put('/:id', auth, [
  body('overallRating').optional().isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('workCulture').optional().isInt({ min: 1, max: 5 }).withMessage('Work culture rating must be between 1 and 5'),
  body('workLifeBalance').optional().isInt({ min: 1, max: 5 }).withMessage('Work-life balance rating must be between 1 and 5'),
  body('careerGrowth').optional().isInt({ min: 1, max: 5 }).withMessage('Career growth rating must be between 1 and 5'),
  body('compensation').optional().isInt({ min: 1, max: 5 }).withMessage('Compensation rating must be between 1 and 5'),
  body('management').optional().isInt({ min: 1, max: 5 }).withMessage('Management rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('content').optional().trim().isLength({ min: 50, max: 2000 }).withMessage('Content must be between 50 and 2000 characters'),
  body('pros').optional().isArray().withMessage('Pros must be an array'),
  body('cons').optional().isArray().withMessage('Cons must be an array'),
  body('recommendations').optional().isIn(['Yes', 'No', 'Maybe']).withMessage('Recommendation must be Yes, No, or Maybe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is authorized to update
    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('author', 'name graduationYear branch currentCompany designation email linkedinProfile')
    .populate('company', 'name industry logo');

    // Update company statistics
    await updateCompanyStats(review.company);

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review (soft delete)
// @access  Private (Review author or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is authorized to delete
    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    review.isActive = false;
    await review.save();

    // Update company statistics
    await updateCompanyStats(review.company);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id.toString();
    const helpfulIndex = review.helpfulUsers.indexOf(userId);

    if (helpfulIndex > -1) {
      // Remove helpful vote
      review.helpfulUsers.splice(helpfulIndex, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful vote
      review.helpfulUsers.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      message: helpfulIndex > -1 ? 'Helpful vote removed' : 'Review marked as helpful',
      helpfulCount: review.helpfulCount,
      hasVoted: helpfulIndex === -1
    });
  } catch (error) {
    console.error('Helpful vote error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update company statistics
async function updateCompanyStats(companyId) {
  try {
    const reviews = await Review.find({ company: companyId, isActive: true });
    
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const averageRating = totalRating / reviews.length;

    await Company.findByIdAndUpdate(companyId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Update company stats error:', error);
  }
}

module.exports = router; 